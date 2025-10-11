import * as THREE from '../node_modules/three/build/three.module.js';

// Three.js setup
let scene, camera, renderer;
let meshes = [];
let currentIndex = 0;

let canvas, canvasCtx;

const SETTINGS = {
    threshold: 80,
    contrast: 75,
    ditherType: 'bayer4x4',
    ditherStrength: 30,
    pixelSize: 20
};

// Bayer 4x4 dithering matrix
const bayerMatrix4x4 = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5]
];

function initThree() {
    // Scene setup
    scene = new THREE.Scene();

    // Camera setup
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 5;
    camera.position.x = 2;
    camera.position.y = 1;
    camera.lookAt(0, 0, 0);

    // Renderer setup
    canvas = document.querySelector('#geometryCanvas');
    canvasCtx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Render at lower resolution since we're pixelating anyway
    const renderScale = .5;
    const renderWidth = Math.floor(window.innerWidth * renderScale);
    const renderHeight = Math.floor(window.innerHeight * renderScale);

    const threeCanvas = document.createElement('canvas');
    threeCanvas.style.display = 'none';
    threeCanvas.width = renderWidth;
    threeCanvas.height = renderHeight;
    document.body.appendChild(threeCanvas);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({
        canvas: threeCanvas,
        antialias: false, // Disable since we're pixelating anyway
        alpha: true
    });
    renderer.setSize(renderWidth, renderHeight);
    renderer.setClearColor(0x000000, 0);

    window.threeCanvas = threeCanvas;
    window.renderScale = renderScale;

    // Create geometries - using different subdivision levels for visual variety
    const geometries = [
        new THREE.TetrahedronGeometry(2, 0),  // 4 faces
        new THREE.OctahedronGeometry(1.8, 0),  // 8 faces
        new THREE.IcosahedronGeometry(1.6, 0)  // 20 faces
    ];

    // Create material
    const material = new THREE.MeshPhongMaterial({
        // color: 0x6b8cff,
        // emissive: 0x5b6ee1,
        emissiveIntensity: 0,
        shininess: 100,
        specular: 0xf2f2f2,
        flatShading: true,
        transparent: true,
        opacity: 1
    });

    // Create meshes for each geometry
    geometries.forEach((geometry, index) => {
        const mesh = new THREE.Mesh(geometry, material.clone());
        mesh.visible = index === 0; // Only first mesh visible initially
        mesh.material.opacity = index === 0 ? 1 : 0;

        // Add wireframe
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x555fe2,
            transparent: false,
            opacity: 1
        });
        const wireframe = new THREE.LineSegments(edges, lineMaterial);
        mesh.add(wireframe);

        scene.add(mesh);
        meshes.push(mesh);
    });

    // Add lights
    // const ambientLight = new THREE.AmbientLight(0xf2f2f2, .2);
    // scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xf2f2f2, .18);
    directionalLight.position.set(2, 0, 10);
    scene.add(directionalLight);

    // const rimLight = new THREE.DirectionalLight(0xf2f2f2, 1);
    // rimLight.position.set(-5, -10, -5);
    // scene.add(rimLight);
}

// Transition to a specific shape
function transitionToShape(index) {
    if (index === currentIndex || index >= meshes.length) return;

    const duration = 1.5;
    const currentMesh = meshes[currentIndex];
    const nextMesh = meshes[index];

    // Make next mesh visible
    nextMesh.visible = true;
    nextMesh.rotation.copy(currentMesh.rotation);

    // Fade out current mesh
    gsap.to(currentMesh.material, {
        opacity: 0,
        duration: duration * 0.5,
        ease: "power2.inOut",
        onComplete: () => {
            currentMesh.visible = false;
        }
    });

    // Fade in next mesh
    gsap.fromTo(nextMesh.material,
        { opacity: 0 },
        {
            opacity: 1,
            duration: duration * 0.5,
            ease: "power2.inOut"
        }
    );

    // Rotation animation during transition
    gsap.to([currentMesh.rotation, nextMesh.rotation], {
        y: "+=3.14159",
        duration: duration,
        ease: "power2.inOut"
    });

    // Scale animation
    // gsap.to(nextMesh.scale, {
    //     x: 1.2,
    //     y: 1.2,
    //     z: 1.2,
    //     duration: duration * 0.5,
    //     ease: "power2.out",
    //     yoyo: true,
    //     repeat: 1
    // });

    currentIndex = index;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate all meshes
    meshes.forEach(mesh => {
        if (mesh.visible) {
            mesh.rotation.x += 0.003;
            mesh.rotation.y += 0.005;
        }
    });

    // Subtle pulsing
    const time = performance.now() * 0.001;
    meshes.forEach(mesh => {
        if (mesh.visible) {
            // const scale = 1 + Math.sin(time * 2) * 0.02;
            const scale = 2.15;
            mesh.scale.setScalar(scale);
        }
    });

    renderer.render(scene, camera);

    applyFilter();
}

// Handle resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

document.addEventListener('DOMContentLoaded', () => {

    // Initialize Three.js
    initThree();
    animate();

    // Window resize handler
    window.addEventListener('resize', onWindowResize);

    // GSAP ScrollTrigger for each section
    gsap.utils.toArray('#about, #works, #contact').forEach((section, index) => {
        ScrollTrigger.create({
            trigger: section,
            start: 'top center',
            end: 'bottom center',
            onEnter: () => transitionToShape(index),
            onEnterBack: () => transitionToShape(index),
        });
    });

    // Start animation
    animate();
});

// Apply Bayer 4x4 dithering
function applyDithering(luminance, x, y, strength) {
    const normalizedStrength = strength / 100;
    const threshold = bayerMatrix4x4[y % 4][x % 4] / 16;
    return luminance + (threshold - 0.5) * 128 * normalizedStrength;
}

// Apply the retro filter
function applyFilter() {

    // const canvas = document.querySelector('#geometryCanvas');
    // const canvasCtx = canvas.getContext('2d');

    const width = canvas.width;
    const height = canvas.height;
    const pixelSize = SETTINGS.pixelSize;


    // Canvas clear before producing new frame
    canvasCtx.clearRect(0, 0, width, height);
    // Set composite operation to handle transparency correctly
    canvasCtx.globalCompositeOperation = 'source-over';

    // Calculate downscaled dimensions
    const smallWidth = Math.floor(width / pixelSize);
    const smallHeight = Math.floor(height / pixelSize);

    // Draw Three.js canvas to filter canvas
    canvasCtx.drawImage(window.threeCanvas, 0, 0, window.threeCanvas.width, window.threeCanvas.height, 0, 0, width, height);

    // Create smaller canvas for processing
    const smallCanvas = document.createElement('canvas');
    smallCanvas.width = smallWidth;
    smallCanvas.height = smallHeight;
    const smallCtx = smallCanvas.getContext('2d');

    // Scale down the image
    smallCtx.drawImage(canvas, 0, 0, smallWidth, smallHeight);

    // Get downscaled image data
    const imageData = smallCtx.getImageData(0, 0, smallWidth, smallHeight);
    const data = imageData.data;

    const threshold = SETTINGS.threshold;
    const contrast = SETTINGS.contrast / 100;
    const ditherStrength = SETTINGS.ditherStrength;

    // Process each pixel at lower resolution
    for (let y = 0; y < smallHeight; y++) {
        for (let x = 0; x < smallWidth; x++) {
            const i = (y * smallWidth + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (a === 0) {
                data[i] = 0;
                data[i + 1] = 0;
                data[i + 2] = 0;
                data[i + 3] = 0; // Keep transparent
                continue;
            }

            if (a < 10) {
                data[i] = 0;
                data[i + 1] = 0;
                data[i + 2] = 0;
                data[i + 3] = 0;
                continue;
            }

            // Process visible pixels
            let luminance = 0.299 * r + 0.587 * g + 0.114 * b;

            // Apply contrast
            luminance = Math.max(0, Math.min(255,
                ((luminance / 255 - 0.5) * contrast + 0.5) * 255));

            // Apply dithering
            luminance = applyDithering(luminance, x, y, ditherStrength);
            luminance = Math.max(0, Math.min(255, luminance));

            // Apply threshold for black/white effect
            if (luminance > threshold) {
                // Bright areas become white
                data[i] = 255;
                data[i + 1] = 255;
                data[i + 2] = 255;
                data[i + 3] = 255;
            } else {
                // Dark areas become black
                data[i] = 0;
                data[i + 1] = 0;
                data[i + 2] = 0;
                data[i + 3] = 0;
            }
        }
    }

    // Put processed data back to small canvas
    smallCtx.putImageData(imageData, 0, 0);

    // Clear main canvas and scale up with pixelated effect
    canvasCtx.clearRect(0, 0, width, height);

    // Disable image smoothing for crisp pixels
    canvasCtx.imageSmoothingEnabled = false;
    canvasCtx.webkitImageSmoothingEnabled = false;
    canvasCtx.mozImageSmoothingEnabled = false;
    canvasCtx.msImageSmoothingEnabled = false;

    // Scale up the processed image
    canvasCtx.drawImage(smallCanvas, 0, 0, smallWidth, smallHeight, 0, 0, width, height);
}