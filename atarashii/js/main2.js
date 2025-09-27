import * as THREE from '../node_modules/three/build/three.module.js';

// Three.js setup
let scene, camera, renderer;
let bgScene, bgCamera, bgMaterial;
let meshes = [];
let currentIndex = 0;




// Your existing fragment shader for the noise effect
const noiseFragmentShader = `
    precision highp float;
    
    varying vec2 v_uv;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform float u_speed;
    uniform float u_density;
    uniform float u_scale;
    uniform float u_complexity;
    uniform float u_contrast;
    uniform float u_perspective;
    uniform float u_horizonLine;
    uniform float u_rotationAngle;
    uniform vec2 u_direction;
    
    // Color palette uniforms
    uniform vec3 u_color1;
    uniform vec3 u_color2;
    uniform vec3 u_color3;
    uniform vec3 u_color4;
    uniform vec3 u_color5;
    uniform vec3 u_bgColor1;
    uniform vec3 u_bgColor2;
    
    // Simplex noise functions
    vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
    }
    
    vec2 mod289(vec2 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
    }
    
    vec3 permute(vec3 x) {
        return mod289(((x*34.0)+1.0)*x);
    }
    
    float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187,
                            0.366025403784439,
                           -0.577350269189626,
                            0.024390243902439);
        
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                + i.x + vec3(0.0, i1.x, 1.0));
        
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
    }
    
    mat2 rotate2D(float angle) {
        float s = sin(angle);
        float c = cos(angle);
        return mat2(c, -s, s, c);
    }
    
    float fbm(vec2 p, float time, int octaves) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        float maxValue = 0.0;
        
        mat2 rot = rotate2D(u_rotationAngle);
        
        for(int i = 0; i < 6; i++) {
            if(i >= octaves) break;
            
            vec2 movement = vec2(time * u_direction.x * 0.02, time * u_direction.y * 0.02);
            vec2 rotatedP = rot * p;
            value += snoise(rotatedP * frequency + movement) * amplitude;
            maxValue += amplitude;
            amplitude *= 0.5;
            frequency *= 2.0;
        }
        
        return value / maxValue;
    }
    
    vec3 getCloudColor(float noise, float height) {
        float t = (noise + 1.0) * 0.5;
        vec3 color;
        
        if(t < 0.25) {
            color = mix(u_color1, u_color2, t * 4.0);
        } else if(t < 0.5) {
            color = mix(u_color2, u_color3, (t - 0.25) * 4.0);
        } else if(t < 0.75) {
            color = mix(u_color3, u_color4, (t - 0.5) * 4.0);
        } else {
            color = mix(u_color4, u_color5, (t - 0.75) * 4.0);
        }
        
        float verticalGradient = 1.0 - height * 0.4;
        color *= verticalGradient;
        
        float highlight = max(0.0, noise - 0.3);
        color = mix(color, vec3(1.0), highlight * 0.5);
        
        return color;
    }
    
    void main() {
        vec2 uv = v_uv;
        
        float perspectiveFactor = 1.0;
        if(u_perspective > 0.0) {
            float distFromHorizon = abs(uv.y - u_horizonLine);
            
            if(uv.y > u_horizonLine) {
                perspectiveFactor = 1.0 + (uv.y - u_horizonLine) * u_perspective * 2.0;
            } else {
                perspectiveFactor = 1.0 - (u_horizonLine - uv.y) * u_perspective;
            }
            perspectiveFactor = max(0.1, perspectiveFactor);
        }
        
        vec2 coord = uv * u_scale / perspectiveFactor;
        
        if(u_perspective > 0.0) {
            float xDistortion = (uv.x - 0.5) * (1.0 - uv.y) * u_perspective;
            coord.x += xDistortion;
        }
        
        float time = u_time * u_speed * 0.001;
        
        float speedMod = perspectiveFactor;
        float noise1 = fbm(coord + vec2(time * speedMod, 0.0), time, int(u_complexity));
        float noise2 = fbm(coord * 1.5 - vec2(time * speedMod * 0.6, 0.0), time * 1.2, int(u_complexity));
        
        float cloudNoise = (noise1 * 0.7 + noise2 * 0.3);
        cloudNoise = pow((cloudNoise + 1.0) * 0.5, u_contrast) * 2.0 - 1.0;
        
        float adjustedDensity = u_density + (1.0 - perspectiveFactor) * 0.2;
        float cloudAlpha = smoothstep(adjustedDensity - 0.2, adjustedDensity + 0.2, cloudNoise);
        cloudAlpha *= 0.4 + perspectiveFactor * 0.6;
        
        vec3 cloudColor = getCloudColor(cloudNoise, uv.y);
        vec3 background = mix(u_bgColor2, u_bgColor1, uv.y);
        vec3 finalColor = mix(background, cloudColor, cloudAlpha * 0.7);
        
        if(u_perspective > 0.0) {
            float hazeFactor = (1.0 - perspectiveFactor) * 0.3;
            finalColor = mix(finalColor, background, hazeFactor);
        }
        
        float glow = length(uv - 0.5);
        finalColor += vec3(0.05, 0.05, 0.1) * (1.0 - glow);
        
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

function initThree() {
    // Main scene for 3D objects
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
    
    // Use existing canvas
    const canvas = document.querySelector('#cloudCanvas');
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.autoClear = false; // Important: manual clearing for multiple passes
    
    // Create background scene for noise effect
    bgScene = new THREE.Scene();
    bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    // Create fullscreen quad with noise shader
    const bgGeometry = new THREE.PlaneGeometry(2, 2);
    bgMaterial = new THREE.ShaderMaterial({
        uniforms: {
            u_time: { value: 0 },
            u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            u_speed: { value: 0.2 },
            u_density: { value: 0.80 },
            u_scale: { value: 4.5 },
            u_complexity: { value: 2 },
            u_contrast: { value: 0.5 },
            u_perspective: { value: 0.1 },
            u_horizonLine: { value: 0.90 },
            u_rotationAngle: { value: 65 * Math.PI / 180 },
            u_direction: { value: new THREE.Vector2(-1.7, -0.5) },
            u_color1: { value: new THREE.Vector3(0.843, 0.878, 0.976) }, // #d7e0f9
            u_color2: { value: new THREE.Vector3(0.871, 0.898, 0.969) }, // #dee5f7
            u_color3: { value: new THREE.Vector3(0.278, 0.459, 1.0) },   // #4775ff
            u_color4: { value: new THREE.Vector3(0.420, 0.714, 1.0) },   // #6bb6ff
            u_color5: { value: new THREE.Vector3(0.675, 0.749, 0.976) }, // #acbff9
            u_bgColor1: { value: new THREE.Vector3(0.0, 0.255, 0.671) }, // #0041ab
            u_bgColor2: { value: new THREE.Vector3(0.361, 0.490, 0.863) } // #5c7ddc
        },
        vertexShader: `
            varying vec2 v_uv;
            void main() {
                v_uv = uv;
                gl_Position = vec4(position, 1.0);
            }
        `,
        fragmentShader: noiseFragmentShader,
        depthWrite: false
    });
    
    const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
    bgScene.add(bgMesh);
    
    // Create 3D geometries
    const geometries = [
        new THREE.TetrahedronGeometry(2, 0),
        new THREE.OctahedronGeometry(1.8, 0),
        new THREE.IcosahedronGeometry(1.6, 0)
    ];
    
    // Create material for 3D objects
    const material = new THREE.MeshPhongMaterial({
        color: 0x6b8cff,
        emissive: 0x5b6ee1,
        emissiveIntensity: 0.2,
        shininess: 30,
        specular: 0xa7adff,
        flatShading: true,
        transparent: true,
        opacity: 1
    });
    
    // Create meshes for each geometry
    geometries.forEach((geometry, index) => {
        const mesh = new THREE.Mesh(geometry, material.clone());
        mesh.visible = index === 0;
        mesh.material.opacity = index === 0 ? 1 : 0;
        
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.2
        });
        const wireframe = new THREE.LineSegments(edges, lineMaterial);
        mesh.add(wireframe);
        
        scene.add(mesh);
        meshes.push(mesh);
    });
    
    // Add lights for 3D objects
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xa7adff, 1);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);
    
    const rimLight = new THREE.DirectionalLight(0x7c72e8, 0.5);
    rimLight.position.set(-5, -10, -5);
    scene.add(rimLight);
}

function transitionToShape(index) {
    if (index === currentIndex || index >= meshes.length) return;
    
    const duration = 1.5;
    const currentMesh = meshes[currentIndex];
    const nextMesh = meshes[index];
    
    nextMesh.visible = true;
    nextMesh.rotation.copy(currentMesh.rotation);
    
    gsap.to(currentMesh.material, {
        opacity: 0,
        duration: duration * 0.5,
        ease: "power2.inOut",
        onComplete: () => {
            currentMesh.visible = false;
        }
    });
    
    gsap.fromTo(nextMesh.material,
        { opacity: 0 },
        {
            opacity: 1,
            duration: duration * 0.5,
            ease: "power2.inOut"
        }
    );
    
    gsap.to([currentMesh.rotation, nextMesh.rotation], {
        y: "+=3.14159",
        duration: duration,
        ease: "power2.inOut"
    });
    
    gsap.to(nextMesh.scale, {
        x: 1.2,
        y: 1.2,
        z: 1.2,
        duration: duration * 0.5,
        ease: "power2.out",
        yoyo: true,
        repeat: 1
    });
    
    document.querySelectorAll('.nav-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
    
    currentIndex = index;
}

function animate() {
    requestAnimationFrame(animate);
    
    const time = performance.now();
    
    // Update noise shader time
    if (bgMaterial) {
        bgMaterial.uniforms.u_time.value = time;
    }
    
    // Rotate visible meshes
    meshes.forEach(mesh => {
        if (mesh.visible) {
            mesh.rotation.x += 0.003;
            mesh.rotation.y += 0.005;
            const scale = 1 + Math.sin(time * 0.002) * 0.02;
            mesh.scale.setScalar(scale);
        }
    });
    
    // Clear and render both scenes
    renderer.clear();
    
    // Render background noise first
    renderer.render(bgScene, bgCamera);
    
    // Render 3D shapes on top (without clearing)
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Update noise shader resolution
    if (bgMaterial) {
        bgMaterial.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initThree();
    animate();
    
    window.addEventListener('resize', onWindowResize);
    
    // GSAP ScrollTrigger for sections
    gsap.utils.toArray('#about, #works, #contact').forEach((section, index) => {
        ScrollTrigger.create({
            trigger: section,
            start: 'top center',
            end: 'bottom center',
            onEnter: () => transitionToShape(index),
            onEnterBack: () => transitionToShape(index),
        });
    });
    
    // Mouse movement parallax
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;
        
        gsap.to(camera.position, {
            x: 2 + x * 0.5,
            y: 1 + y * 0.5,
            duration: 1,
            ease: "power2.out"
        });
        
        camera.lookAt(scene.position);
    });
});