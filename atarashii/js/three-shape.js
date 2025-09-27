import * as THREE from '../node_modules/three/build/three.module.js';

// Three.js setup
let scene, camera, renderer;
let meshes = [];
let currentIndex = 0;

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
    const canvas = document.querySelector('#cloudCanvas');
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,  // Use existing canvas
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create geometries - using different subdivision levels for visual variety
    const geometries = [
        new THREE.TetrahedronGeometry(2, 0),  // 4 faces
        new THREE.OctahedronGeometry(1.8, 0),  // 8 faces
        new THREE.IcosahedronGeometry(1.6, 0)  // 20 faces
    ];

    // Create material
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
        mesh.visible = index === 0; // Only first mesh visible initially
        mesh.material.opacity = index === 0 ? 1 : 0;

        // Add wireframe
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

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xa7adff, 1);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    const rimLight = new THREE.DirectionalLight(0x7c72e8, 0.5);
    rimLight.position.set(-5, -10, -5);
    scene.add(rimLight);

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
    gsap.to(nextMesh.scale, {
        x: 1.2,
        y: 1.2,
        z: 1.2,
        duration: duration * 0.5,
        ease: "power2.out",
        yoyo: true,
        repeat: 1
    });

    // Update nav dots
    document.querySelectorAll('.nav-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });

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
            const scale = 1 + Math.sin(time * 2) * 0.02;
            mesh.scale.setScalar(scale);
        }
    });

    renderer.render(scene, camera);
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

    console.log("meshes: ", meshes);
    console.log("scene: ", scene);
    console.log("camera: ", camera);

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

    // Mouse movement parallax
    // document.addEventListener('mousemove', (e) => {
    //     const x = (e.clientX / window.innerWidth) - 0.5;
    //     const y = (e.clientY / window.innerHeight) - 0.5;

    //     gsap.to(camera.position, {
    //         x: 2 + x * 0.5,
    //         y: 1 + y * 0.5,
    //         duration: 1,
    //         ease: "power2.out"
    //     });

    //     camera.lookAt(scene.position);
    // });
});