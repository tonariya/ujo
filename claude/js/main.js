import * as THREE from '../node_modules/three/build/three.module.js';

// Three.js scene setup
let scene, camera, renderer;
let cubes = [];
let mouse = { x: 0, y: 0 };
let mouseVelocity = { x: 0, y: 0 };
let lastMousePos = { x: 0, y: 0 };

function init() {
    // Create scene
    scene = new THREE.Scene();
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000011);
    document.body.appendChild(renderer.domElement);
    
    // Create cube system
    createCubeSystem();
    
    // Handle mouse movement
    window.addEventListener('mousemove', onMouseMove, false);
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
    
    // Start animation loop
    animate();
}

function createCubeSystem() {
    const cubeCount = 200;
    const geometry = new THREE.BoxGeometry(0.15, 0.15, 0.15);
    
    for (let i = 0; i < cubeCount; i++) {
        // Create galaxy-like colors (blues, purples, whites, yellows)
        let hue, saturation, lightness;
        if (Math.random() < 0.3) {
            // Core stars - yellow/white
            hue = 0.1 + Math.random() * 0.1;
            saturation = 0.3 + Math.random() * 0.4;
            lightness = 0.7 + Math.random() * 0.3;
        } else {
            // Outer stars - blue/purple
            hue = 0.6 + Math.random() * 0.2;
            saturation = 0.5 + Math.random() * 0.5;
            lightness = 0.4 + Math.random() * 0.4;
        }
        
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(hue, saturation, lightness)
        });
        
        const cube = new THREE.Mesh(geometry, material);
        
        // Create proper spiral galaxy distribution with multiple arms
        const numArms = 2; // Two main spiral arms like the Milky Way
        const armIndex = Math.floor(Math.random() * numArms);
        const baseAngle = (armIndex * 2 * Math.PI) / numArms;
        
        // Radius distribution with more density towards center
        const radius = Math.pow(Math.random(), 1.5) * 12 + 1;
        
        // Spiral arm equation: angle increases with radius to create spiral
        const spiralTightness = 0.3; // How tight the spiral is
        const armWidth = 0.8; // Width of each spiral arm
        const armOffset = (Math.random() - 0.5) * armWidth;
        
        const spiralAngle = baseAngle + radius * spiralTightness + armOffset;
        
        // Add scatter for realistic look
        const scatterRadius = (Math.random() - 0.5) * 2;
        const scatterAngle = Math.random() * Math.PI * 2;
        
        // Position in XZ plane first
        const x = Math.cos(spiralAngle) * radius + Math.cos(scatterAngle) * scatterRadius;
        const y = (Math.random() - 0.5) * (1.5 - radius * 0.05); // Thinner disk at edges
        const z = Math.sin(spiralAngle) * radius + Math.sin(scatterAngle) * scatterRadius;
        
        // Rotate 90 degrees around X-axis (XZ plane becomes XY plane)
        cube.position.x = x;
        cube.position.y = z; // Z becomes Y
        cube.position.z = -y; // Y becomes -Z
        
        cube.userData = {
            velocity: { x: 0, y: 0, z: 0 },
            acceleration: { x: 0, y: 0, z: 0 },
            baseRotationSpeed: { x: Math.random() * 0.02, y: Math.random() * 0.02, z: Math.random() * 0.02 }
        };
        
        cubes.push(cube);
        scene.add(cube);
    }
}

function onMouseMove(event) {
    // Convert mouse coordinates to normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Calculate mouse velocity
    mouseVelocity.x = mouse.x - lastMousePos.x;
    mouseVelocity.y = mouse.y - lastMousePos.y;
    
    lastMousePos.x = mouse.x;
    lastMousePos.y = mouse.y;
}

function animate() {
    requestAnimationFrame(animate);
    
    // Update cube physics
    updateCubePhysics();
    
    // Reduce mouse velocity over time (friction)
    mouseVelocity.x *= 0.95;
    mouseVelocity.y *= 0.95;
    
    renderer.render(scene, camera);
}

function updateCubePhysics() {
    const mouseVelocityMagnitude = Math.sqrt(mouseVelocity.x * mouseVelocity.x + mouseVelocity.y * mouseVelocity.y);
    
    cubes.forEach(cube => {
        // Calculate distance from cube to mouse cursor (in world coordinates)
        const cubeScreenPos = cube.position.clone();
        cubeScreenPos.project(camera);
        
        const distanceX = mouse.x - cubeScreenPos.x;
        const distanceY = mouse.y - cubeScreenPos.y;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        
        // Apply acceleration based on mouse velocity and distance
        const maxInfluence = 2.0; // Maximum influence distance
        const influence = Math.max(0, (maxInfluence - distance) / maxInfluence);
        const accelerationStrength = mouseVelocityMagnitude * influence * 0.1;
        
        if (accelerationStrength > 0) {
            // Apply acceleration towards mouse movement direction
            cube.userData.acceleration.x = mouseVelocity.x * accelerationStrength;
            cube.userData.acceleration.y = mouseVelocity.y * accelerationStrength;
            cube.userData.acceleration.z = (Math.random() - 0.5) * accelerationStrength * 0.5;
        }
        
        // Apply acceleration to velocity
        cube.userData.velocity.x += cube.userData.acceleration.x;
        cube.userData.velocity.y += cube.userData.acceleration.y;
        cube.userData.velocity.z += cube.userData.acceleration.z;
        
        // Apply friction/damping
        const damping = 0.98;
        cube.userData.velocity.x *= damping;
        cube.userData.velocity.y *= damping;
        cube.userData.velocity.z *= damping;
        
        // Update position
        cube.position.x += cube.userData.velocity.x;
        cube.position.y += cube.userData.velocity.y;
        cube.position.z += cube.userData.velocity.z;
        
        // Boundary constraints to keep cubes within view
        const boundary = 15;
        const returnForce = 0.02;
        
        if (Math.abs(cube.position.x) > boundary) {
            cube.userData.velocity.x -= Math.sign(cube.position.x) * returnForce;
        }
        if (Math.abs(cube.position.y) > boundary) {
            cube.userData.velocity.y -= Math.sign(cube.position.y) * returnForce;
        }
        if (Math.abs(cube.position.z) > boundary) {
            cube.userData.velocity.z -= Math.sign(cube.position.z) * returnForce;
        }
        
        // Update rotation based on base speed plus velocity influence
        const velocityMagnitude = Math.sqrt(
            cube.userData.velocity.x * cube.userData.velocity.x + 
            cube.userData.velocity.y * cube.userData.velocity.y + 
            cube.userData.velocity.z * cube.userData.velocity.z
        );
        const rotationMultiplier = 1 + velocityMagnitude * 10;
        
        cube.rotation.x += cube.userData.baseRotationSpeed.x * rotationMultiplier;
        cube.rotation.y += cube.userData.baseRotationSpeed.y * rotationMultiplier;
        cube.rotation.z += cube.userData.baseRotationSpeed.z * rotationMultiplier;
        
        // Reset acceleration for next frame
        cube.userData.acceleration.x = 0;
        cube.userData.acceleration.y = 0;
        cube.userData.acceleration.z = 0;
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize immediately
init();