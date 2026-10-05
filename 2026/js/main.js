import * as THREE from '../node_modules/three/build/three.module.js';

function createTextSprite(text, color = 0x0066ff, size = 64) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const fontSize = size;
    
    context.font = `Bold ${fontSize}px Courier New, monospace`;
    const textWidth = context.measureText(text).width;
    
    canvas.width = textWidth + 20;
    canvas.height = fontSize + 20;
    
    context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
    context.font = `Bold ${fontSize}px Courier New, monospace`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.9
    });
    
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(canvas.width / 32, canvas.height / 32, 1);
    
    return sprite;
}

// Three.js scene setup
let scene, camera, renderer;
let cubes = [];
let stars = [];
let planets = [];
let nebulaParts = [];
let mouse = { x: 0, y: 0 };
let mouseVelocity = { x: 0, y: 0 };
let lastMousePos = { x: 0, y: 0 };


const canvasInit = document.querySelector('canvas');

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
    
    canvasInit.parentNode.replaceChild(renderer.domElement, canvasInit);
    
    // Create space elements
    createCubeSystem();
    createStarField();
    createPlanets();
    createNebula();
    
    // Handle mouse movement
    window.addEventListener('mousemove', onMouseMove, false);
    
    // Handle window resize
    // window.addEventListener('resize', onWindowResize, false);
    
    // Start animation loop
    animate();
}

function createCubeSystem() {
    const cubeCount = 200;
    const asciiChars = ['■', '□', '▲', '△', '●', '○', '◆', '◇', '★', '☆'];
    
    for (let i = 0; i < cubeCount; i++) {
        // Pick random ASCII character
        const char = asciiChars[Math.floor(Math.random() * asciiChars.length)];
        
        // Create text sprite with blue color
        const cube = createTextSprite(char, 0x0066ff, 32);
        
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
            baseRotationSpeed: { x: Math.random() * 0.02, y: Math.random() * 0.02, z: Math.random() * 0.02 },
            initialPosition: { x: x, y: z, z: -y }
        };
        
        cubes.push(cube);
        scene.add(cube);
    }
}

function createStarField() {
    const starCount = 200; // Reduced for performance with sprites
    const starChars = ['.', '*', '·', '+', '×'];
    
    for (let i = 0; i < starCount; i++) {
        const radius = 50 + Math.random() * 200; // Far background stars
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;
        
        const x = radius * Math.sin(theta) * Math.cos(phi);
        const y = radius * Math.sin(theta) * Math.sin(phi);
        const z = radius * Math.cos(theta);
        
        // Pick random star character
        const char = starChars[Math.floor(Math.random() * starChars.length)];
        const star = createTextSprite(char, 0x0066ff, 24);
        
        star.position.set(x, y, z);
        star.userData = { 
            twinkleSpeed: Math.random() * 0.02 + 0.01,
            baseOpacity: 0.3 + Math.random() * 0.5
        };
        
        stars.push(star);
        scene.add(star);
    }
}

function createPlanets() {
    const planetCount = 5;
    const planetChars = ['◉', '⊕', '⊗', '◎', '⚬', '◐', '◑', '◒', '◓'];
    
    for (let i = 0; i < planetCount; i++) {
        // Pick random planet character
        const char = planetChars[Math.floor(Math.random() * planetChars.length)];
        const size = 48 + Math.random() * 32; // Varying sizes
        const planet = createTextSprite(char, 0x0066ff, size);
        
        // Position planets away from the main galaxy
        const angle = (i / planetCount) * Math.PI * 2;
        const distance = 20 + Math.random() * 15;
        
        planet.position.x = Math.cos(angle) * distance;
        planet.position.y = (Math.random() - 0.5) * 10;
        planet.position.z = Math.sin(angle) * distance;
        
        planet.userData = {
            rotationSpeed: { x: Math.random() * 0.01, y: Math.random() * 0.01, z: Math.random() * 0.01 },
            orbitSpeed: Math.random() * 0.005 + 0.001,
            orbitRadius: distance,
            orbitAngle: angle,
            initialPosition: { x: planet.position.x, y: planet.position.y, z: planet.position.z },
            velocity: { x: 0, y: 0, z: 0 }
        };
        
        planets.push(planet);
        scene.add(planet);
    }
}

function createNebula() {
    const nebulaCount = 150; // Reduced for performance with sprites
    const nebulaChars = ['~', '∼', '≈', '∾', '⁓', '∿', ':', ';', ',', '`'];
    
    for (let i = 0; i < nebulaCount; i++) {
        // Pick random nebula character
        const char = nebulaChars[Math.floor(Math.random() * nebulaChars.length)];
        const nebulaPart = createTextSprite(char, 0x0066ff, 20);
        
        // Cluster nebula parts around certain areas
        const clusterX = (Math.random() - 0.5) * 40;
        const clusterY = (Math.random() - 0.5) * 20;
        const clusterZ = (Math.random() - 0.5) * 40;
        
        nebulaPart.position.x = clusterX + (Math.random() - 0.5) * 15;
        nebulaPart.position.y = clusterY + (Math.random() - 0.5) * 8;
        nebulaPart.position.z = clusterZ + (Math.random() - 0.5) * 15;
        
        nebulaPart.userData = {
            driftSpeed: {
                x: (Math.random() - 0.5) * 0.008,
                y: (Math.random() - 0.5) * 0.004,
                z: (Math.random() - 0.5) * 0.008
            },
            initialPosition: { x: nebulaPart.position.x, y: nebulaPart.position.y, z: nebulaPart.position.z }
        };
        
        nebulaParts.push(nebulaPart);
        scene.add(nebulaPart);
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
    
    // Update space elements
    updateSpaceElements();
    
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
        const accelerationStrength = mouseVelocityMagnitude * influence * 0.5;
        
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
        
        // Position constraints relative to initial position
        const maxDisplacement = 100;
        const initial = cube.userData.initialPosition;
        const returnForce = 0.05;
        
        // Check displacement from initial position and apply return force
        const displaceX = cube.position.x - initial.x;
        const displaceY = cube.position.y - initial.y;
        const displaceZ = cube.position.z - initial.z;
        
        if (Math.abs(displaceX) > maxDisplacement) {
            cube.userData.velocity.x -= Math.sign(displaceX) * returnForce;
            cube.position.x = initial.x + Math.sign(displaceX) * maxDisplacement;
        }
        if (Math.abs(displaceY) > maxDisplacement) {
            cube.userData.velocity.y -= Math.sign(displaceY) * returnForce;
            cube.position.y = initial.y + Math.sign(displaceY) * maxDisplacement;
        }
        if (Math.abs(displaceZ) > maxDisplacement) {
            cube.userData.velocity.z -= Math.sign(displaceZ) * returnForce;
            cube.position.z = initial.z + Math.sign(displaceZ) * maxDisplacement;
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

function updateSpaceElements() {
    const time = Date.now() * 0.001;
    const mouseVelocityMagnitude = Math.sqrt(mouseVelocity.x * mouseVelocity.x + mouseVelocity.y * mouseVelocity.y);
    
    // Update star twinkling
    stars.forEach(star => {
        const material = star.material;
        const baseOpacity = star.userData.baseOpacity;
        material.opacity = baseOpacity * (0.5 + 0.5 * Math.sin(time * star.userData.twinkleSpeed));
    });
    
    // Update planet orbits and rotation
    planets.forEach(planet => {
        // Rotate the planet
        planet.rotation.x += planet.userData.rotationSpeed.x;
        planet.rotation.y += planet.userData.rotationSpeed.y;
        planet.rotation.z += planet.userData.rotationSpeed.z;
        
        // Apply mouse interaction
        const planetScreenPos = planet.position.clone();
        planetScreenPos.project(camera);
        
        const distanceX = mouse.x - planetScreenPos.x;
        const distanceY = mouse.y - planetScreenPos.y;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        
        const maxInfluence = 1.5;
        const influence = Math.max(0, (maxInfluence - distance) / maxInfluence);
        const accelerationStrength = mouseVelocityMagnitude * influence * 0.3;
        
        if (accelerationStrength > 0) {
            planet.userData.velocity.x += mouseVelocity.x * accelerationStrength;
            planet.userData.velocity.y += mouseVelocity.y * accelerationStrength;
            planet.userData.velocity.z += (Math.random() - 0.5) * accelerationStrength * 0.3;
        }
        
        // Apply orbital movement
        planet.userData.orbitAngle += planet.userData.orbitSpeed;
        const orbitRadius = planet.userData.orbitRadius;
        const baseX = Math.cos(planet.userData.orbitAngle) * orbitRadius;
        const baseZ = Math.sin(planet.userData.orbitAngle) * orbitRadius;
        
        // Add velocity to orbital position
        planet.userData.velocity.x *= 0.95; // Damping
        planet.userData.velocity.y *= 0.95;
        planet.userData.velocity.z *= 0.95;
        
        planet.position.x = baseX + planet.userData.velocity.x;
        planet.position.y = planet.userData.initialPosition.y + planet.userData.velocity.y;
        planet.position.z = baseZ + planet.userData.velocity.z;
        
        // Position constraints relative to initial orbital position
        const maxDisplacement = 100;
        const currentOrbitX = Math.cos(planet.userData.orbitAngle) * orbitRadius;
        const currentOrbitZ = Math.sin(planet.userData.orbitAngle) * orbitRadius;
        
        const displaceX = planet.position.x - currentOrbitX;
        const displaceY = planet.position.y - planet.userData.initialPosition.y;
        const displaceZ = planet.position.z - currentOrbitZ;
        
        if (Math.abs(displaceX) > maxDisplacement) {
            planet.position.x = currentOrbitX + Math.sign(displaceX) * maxDisplacement;
            planet.userData.velocity.x *= 0.5;
        }
        if (Math.abs(displaceY) > maxDisplacement) {
            planet.position.y = planet.userData.initialPosition.y + Math.sign(displaceY) * maxDisplacement;
            planet.userData.velocity.y *= 0.5;
        }
        if (Math.abs(displaceZ) > maxDisplacement) {
            planet.position.z = currentOrbitZ + Math.sign(displaceZ) * maxDisplacement;
            planet.userData.velocity.z *= 0.5;
        }
    });
    
    // Update nebula drift
    nebulaParts.forEach(nebulaPart => {
        nebulaPart.position.x += nebulaPart.userData.driftSpeed.x;
        nebulaPart.position.y += nebulaPart.userData.driftSpeed.y;
        nebulaPart.position.z += nebulaPart.userData.driftSpeed.z;
        
        // Position constraints relative to initial position
        const maxDisplacement = 100;
        const initial = nebulaPart.userData.initialPosition;
        
        const displaceX = nebulaPart.position.x - initial.x;
        const displaceY = nebulaPart.position.y - initial.y;
        const displaceZ = nebulaPart.position.z - initial.z;
        
        if (Math.abs(displaceX) > maxDisplacement) {
            nebulaPart.position.x = initial.x + Math.sign(displaceX) * maxDisplacement;
            nebulaPart.userData.driftSpeed.x *= -0.5; // Reverse and reduce drift
        }
        if (Math.abs(displaceY) > maxDisplacement) {
            nebulaPart.position.y = initial.y + Math.sign(displaceY) * maxDisplacement;
            nebulaPart.userData.driftSpeed.y *= -0.5;
        }
        if (Math.abs(displaceZ) > maxDisplacement) {
            nebulaPart.position.z = initial.z + Math.sign(displaceZ) * maxDisplacement;
            nebulaPart.userData.driftSpeed.z *= -0.5;
        }
        
        // Subtle opacity variation
        nebulaPart.material.opacity = 0.2 + 0.3 * (Math.sin(time * 0.5 + nebulaPart.position.x * 0.1) + 1) / 2;
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvasInit.offsetWidth, canvasInit.offsetHeight);
}

// Initialize immediately
init();