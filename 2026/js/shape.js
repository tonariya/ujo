import { gsap, ScrollTrigger } from './lib.js';

// Menu toggle shape: a slowly rotating polyhedron, flat-shaded and dithered to 1-bit pixels.
// Ray-cast straight into a tiny pixel grid on a 2D canvas: no WebGL, no three.js, no GPU readback.
// Reproduces the original three.js look: same camera, lighting maths, contrast, Bayer dither and threshold.

const SETTINGS = {
    threshold: 80,
    contrast: 75,
    ditherStrength: 30,
    pixelSize: 20,      // grid cell size, relative to the window (the grid is stretched into the button)
    scale: 2.15,
    fov: 75,
    eye: [2, 1, 5],
    lightDir: [2, 0, 10],
    lightIntensity: .18,
    shininess: 100,
};

// Bayer 4x4 dithering matrix
const bayerMatrix4x4 = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5]
];

// Polyhedra (same vertices/faces as three.js Tetrahedron/Octahedron/IcosahedronGeometry, detail 0)
const t = (1 + Math.sqrt(5)) / 2;
const SHAPES = [
    {
        radius: 2,
        vertices: [1, 1, 1, -1, -1, 1, -1, 1, -1, 1, -1, -1],
        faces: [2, 1, 0, 0, 3, 2, 1, 3, 0, 2, 3, 1],
    },
    {
        radius: 1.8,
        vertices: [1, 0, 0, -1, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 1, 0, 0, -1],
        faces: [0, 2, 4, 0, 4, 3, 0, 3, 5, 0, 5, 2, 1, 2, 5, 1, 5, 3, 1, 3, 4, 1, 4, 2],
    },
    {
        radius: 1.6,
        vertices: [-1, t, 0, 1, t, 0, -1, -t, 0, 1, -t, 0, 0, -1, t, 0, 1, t, 0, -1, -t, 0, 1, -t, t, 0, -1, t, 0, 1, -t, 0, -1, -t, 0, 1],
        faces: [0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11, 1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8, 3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1],
    },
];

// small vector helpers
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const normalize = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

const srgbToLinear = (c) => c <= .04045 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4);
const linearToSrgb = (c) => c <= .0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - .055;

// light and specular colour #f2f2f2, converted to linear like three.js does
const LIGHT = srgbToLinear(0xf2 / 255) * SETTINGS.lightIntensity;
const SPECULAR = srgbToLinear(0xf2 / 255);
const L = normalize(SETTINGS.lightDir);

const meshes = SHAPES.map((shape, index) => {
    const verts = [];
    for (let i = 0; i < shape.vertices.length; i += 3) {
        const v = normalize([shape.vertices[i], shape.vertices[i + 1], shape.vertices[i + 2]]);
        const r = shape.radius * SETTINGS.scale;
        verts.push([v[0] * r, v[1] * r, v[2] * r]);
    }
    const faces = [];
    for (let i = 0; i < shape.faces.length; i += 3) faces.push([shape.faces[i], shape.faces[i + 1], shape.faces[i + 2]]);

    return {
        verts,
        faces,
        rotation: { x: 0, y: 0, z: 0 },
        material: { opacity: index === 0 ? 1 : 0 },
        visible: index === 0,
    };
});

let currentIndex = 0;
let canvas, ctx, imageData, pixels;
let cols = 0, rows = 0;
let rays = [];          // one ray direction per grid cell
let depth;              // depth buffer
let shade;              // luminance (0-255) of the closest surface per cell
let camera;
let nav;

// Camera basis + one ray per cell; only changes on resize
function setupGrid() {
    cols = Math.max(1, Math.floor(window.innerWidth / SETTINGS.pixelSize));
    rows = Math.max(1, Math.floor(window.innerHeight / SETTINGS.pixelSize));

    canvas.width = cols;
    canvas.height = rows;
    imageData = ctx.createImageData(cols, rows);
    pixels = new Uint32Array(imageData.data.buffer);
    depth = new Float32Array(cols * rows);
    shade = new Float32Array(cols * rows);

    const eye = SETTINGS.eye;
    const forward = normalize(sub([0, 0, 0], eye));
    const right = normalize(cross(forward, [0, 1, 0]));
    const up = cross(right, forward);
    const tanHalf = Math.tan(SETTINGS.fov * Math.PI / 360);
    const aspect = window.innerWidth / window.innerHeight;

    camera = { eye, forward, right, up, tanHalf, aspect };

    rays = new Array(cols * rows);
    for (let y = 0; y < rows; y++) {
        const ndcY = 1 - (y + .5) / rows * 2;
        for (let x = 0; x < cols; x++) {
            const ndcX = (x + .5) / cols * 2 - 1;
            const sx = ndcX * tanHalf * aspect;
            const sy = ndcY * tanHalf;
            rays[y * cols + x] = normalize([
                forward[0] + right[0] * sx + up[0] * sy,
                forward[1] + right[1] * sx + up[1] * sy,
                forward[2] + right[2] * sx + up[2] * sy,
            ]);
        }
    }
}

// Euler XYZ rotation (three.js default order)
function rotate(v, r) {
    const cx = Math.cos(r.x), sx = Math.sin(r.x);
    const cy = Math.cos(r.y), sy = Math.sin(r.y);
    const cz = Math.cos(r.z), sz = Math.sin(r.z);
    // Rz
    let x = v[0] * cz - v[1] * sz;
    let y = v[0] * sz + v[1] * cz;
    let z = v[2];
    // Ry
    const x2 = x * cy + z * sy;
    z = -x * sy + z * cy;
    x = x2;
    // Rx
    const y2 = y * cx - z * sx;
    z = y * sx + z * cx;
    y = y2;
    return [x, y, z];
}

// world point -> grid coordinates
function project(p) {
    const d = sub(p, camera.eye);
    const z = dot(d, camera.forward);
    const ndcX = dot(d, camera.right) / (z * camera.tanHalf * camera.aspect);
    const ndcY = dot(d, camera.up) / (z * camera.tanHalf);
    return [(ndcX + 1) / 2 * cols, (1 - ndcY) / 2 * rows];
}

// Blinn-Phong as in three.js MeshPhongMaterial (white, flat shaded, one directional light)
function shadePoint(n, viewDir) {
    const dotNL = Math.max(dot(n, L), 0);
    if (dotNL <= 0) return 0;

    const irradiance = dotNL * LIGHT;
    const h = normalize([L[0] + viewDir[0], L[1] + viewDir[1], L[2] + viewDir[2]]);
    const dotNH = Math.max(dot(n, h), 0);
    const dotVH = Math.max(dot(viewDir, h), 0);

    const fresnel = SPECULAR + (1 - SPECULAR) * Math.pow(1 - dotVH, 5);
    const distribution = (SETTINGS.shininess * .5 + 1) * Math.pow(dotNH, SETTINGS.shininess) / Math.PI;
    const specular = irradiance * fresnel * .25 * distribution;
    const diffuse = irradiance / Math.PI;

    return Math.min(1, linearToSrgb(Math.min(1, diffuse + specular))) * 255;
}

function rasterize(mesh) {
    const world = mesh.verts.map((v) => rotate(v, mesh.rotation));
    const screen = world.map(project);
    const eye = camera.eye;

    for (const [ia, ib, ic] of mesh.faces) {
        const a = world[ia], b = world[ib], c = world[ic];
        let n = normalize(cross(sub(b, a), sub(c, a)));
        // orient outward (polyhedra are centred on the origin)
        const centroid = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3];
        if (dot(n, centroid) < 0) n = [-n[0], -n[1], -n[2]];
        // back-face culling
        if (dot(n, sub(eye, centroid)) <= 0) continue;

        const pa = screen[ia], pb = screen[ib], pc = screen[ic];
        const minX = Math.max(0, Math.floor(Math.min(pa[0], pb[0], pc[0])));
        const maxX = Math.min(cols - 1, Math.ceil(Math.max(pa[0], pb[0], pc[0])));
        const minY = Math.max(0, Math.floor(Math.min(pa[1], pb[1], pc[1])));
        const maxY = Math.min(rows - 1, Math.ceil(Math.max(pa[1], pb[1], pc[1])));

        const area = (pb[0] - pa[0]) * (pc[1] - pa[1]) - (pb[1] - pa[1]) * (pc[0] - pa[0]);
        if (area === 0) continue;
        const planeD = dot(n, sub(a, eye));

        for (let y = minY; y <= maxY; y++) {
            const py = y + .5;
            for (let x = minX; x <= maxX; x++) {
                const px = x + .5;
                // edge functions: inside if all share the triangle's winding
                const w0 = ((pc[0] - pb[0]) * (py - pb[1]) - (pc[1] - pb[1]) * (px - pb[0])) / area;
                const w1 = ((pa[0] - pc[0]) * (py - pc[1]) - (pa[1] - pc[1]) * (px - pc[0])) / area;
                const w2 = 1 - w0 - w1;
                if (w0 < 0 || w1 < 0 || w2 < 0) continue;

                const i = y * cols + x;
                const ray = rays[i];
                const tHit = planeD / dot(n, ray);
                if (!(tHit > 0) || tHit >= depth[i]) continue;

                depth[i] = tHit;
                shade[i] = shadePoint(n, [-ray[0], -ray[1], -ray[2]]);
            }
        }
    }
}

function render() {
    depth.fill(Infinity);

    meshes.forEach((mesh) => {
        // below ~10/255 alpha the original filter dropped the pixels entirely
        if (mesh.visible && mesh.material.opacity >= .04) rasterize(mesh);
    });

    const contrast = SETTINGS.contrast / 100;
    const strength = SETTINGS.ditherStrength / 100;

    for (let y = 0; y < rows; y++) {
        const bayerRow = bayerMatrix4x4[y % 4];
        for (let x = 0; x < cols; x++) {
            const i = y * cols + x;
            if (depth[i] === Infinity) {
                pixels[i] = 0;
                continue;
            }
            let luminance = Math.max(0, Math.min(255, ((shade[i] / 255 - .5) * contrast + .5) * 255));
            luminance += (bayerRow[x % 4] / 16 - .5) * 128 * strength;
            pixels[i] = luminance > SETTINGS.threshold ? 0xffffffff : 0;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

// Transition to a specific shape
function transitionToShape(index) {
    if (index === currentIndex || index >= meshes.length) return;

    const duration = 1.5;
    const currentMesh = meshes[currentIndex];
    const nextMesh = meshes[index];

    nextMesh.visible = true;
    Object.assign(nextMesh.rotation, currentMesh.rotation);

    gsap.to(currentMesh.material, {
        opacity: 0,
        duration: duration * .5,
        ease: 'power2.inOut',
        onComplete: () => { currentMesh.visible = false; },
    });

    gsap.fromTo(nextMesh.material, { opacity: 0 }, {
        opacity: 1,
        duration: duration * .5,
        ease: 'power2.inOut',
    });

    gsap.to([currentMesh.rotation, nextMesh.rotation], {
        y: '+=3.14159',
        duration: duration,
        ease: 'power2.inOut',
    });

    currentIndex = index;
}

function tick(time, deltaTime) {
    // nothing to draw while the nav (and its toggle) is still hidden
    if (!nav.classList.contains('ready')) return;

    // original speeds were per frame at 60fps
    const step = deltaTime / (1000 / 60);
    meshes.forEach((mesh) => {
        if (mesh.visible) {
            mesh.rotation.x += .003 * step;
            mesh.rotation.y += .005 * step;
        }
    });

    render();
}

document.addEventListener('DOMContentLoaded', () => {
    canvas = document.querySelector('#geometryCanvas');
    if (!canvas) return;   // toggle shape not in the markup
    ctx = canvas.getContext('2d');
    nav = document.querySelector('nav');

    setupGrid();
    window.addEventListener('resize', setupGrid);
    gsap.ticker.add(tick);

    gsap.utils.toArray('#about, #works, #contact').forEach((section, index) => {
        ScrollTrigger.create({
            trigger: section,
            start: 'top center',
            end: 'bottom center',
            onEnter: () => transitionToShape(index),
            onEnterBack: () => transitionToShape(index),
        });
    });
});
