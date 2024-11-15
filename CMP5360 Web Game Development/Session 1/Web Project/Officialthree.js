import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.169.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.169.0/examples/jsm/loaders/GLTFLoader.js';

// Scene and Camera Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = -20;  // Initial camera position

// Renderer Setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setAnimationLoop(animate);

// Window resize handler
const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};
window.addEventListener('resize', onWindowResize);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Floor Plane
const addPlane = (x, y, w, h, materialAspect) => {
    const geometry = new THREE.PlaneGeometry(w, h);
    const material = new THREE.MeshBasicMaterial(materialAspect);
    const plane = new THREE.Mesh(geometry, material);
    plane.position.set(x, y, 0);
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);
};

const texture = new THREE.TextureLoader().load("Resource/images/goldpattern.png");
const materialAspectFloor = { map: texture, side: THREE.DoubleSide, transparent: true };
addPlane(0, -3.6, 30, 30, materialAspectFloor);

// Skybox function
const createSkybox = () => {
    const loader = new THREE.TextureLoader();
    loader.load("Resource/images/Nebula.jpg", (texture) => {
        const sphereGeometry = new THREE.SphereGeometry(100, 60, 40);
        const sphereMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        const skybox = new THREE.Mesh(sphereGeometry, sphereMaterial);
        scene.add(skybox);
    });
};
createSkybox();

// Player Model
let player;
const loader = new GLTFLoader();
loader.setPath("Resource/3Dmodels/");
loader.load(
    "pod.glb",
    (gltf) => {
        player = gltf.scene;
        player.scale.set(0.05, 0.05, 0.05);
        player.position.y = -5;
        scene.add(player);
    },
    undefined,
    (error) => {
        console.error("Error loading model:", error);
        const geometry1 = new THREE.BoxGeometry(1, 1, 1);
        const material1 = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        player = new THREE.Mesh(geometry1, material1);
        player.position.y = 1;
        scene.add(player);
    }
);

// Lights
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
scene.add(directionalLight);
const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
scene.add(ambientLight);

// Movement control variables
let upstate = false;
let downstate = false;
let leftstate = false;
let rightstate = false;
let changed = false;

// Keyboard Input State
const keyState = {
    'ArrowUp': false,
    'ArrowDown': false,
    'ArrowLeft': false,
    'ArrowRight': false,
    'w': false,
    's': false,
    'a': false,
    'd': false
};

// Key Event Listeners
document.addEventListener('keydown', (event) => {
    if (keyState.hasOwnProperty(event.key)) {
        keyState[event.key] = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (keyState.hasOwnProperty(event.key)) {
        keyState[event.key] = false;
    }
});

// Animation Loop
function animate() {
    if (player) {
        // Move the player based on key states
        if (keyState['ArrowUp'] || keyState['w']) {
            player.position.z += 0.6;  // Move forward
        }
        if (keyState['ArrowDown'] || keyState['s']) {
            player.position.z -= 0.6;  // Move backward
        }
        if (keyState['ArrowLeft'] || keyState['a']) {
            player.position.x += 0.6;  // Move left
        }
        if (keyState['ArrowRight'] || keyState['d']) {
            player.position.x -= 0.6;  // Move right
        }

        // Update camera position based on player's position and rotation
        const offset = 18; // Distance between player and camera
        camera.position.x = player.position.x - offset * Math.sin(player.rotation.y);
        camera.position.z = player.position.z - offset * Math.cos(player.rotation.y);
        camera.position.y = 10; // Keep the camera at a fixed height (optional)
        camera.lookAt(player.position); // Make the camera always look at the player
    }

    // Render the scene
    renderer.render(scene, camera);
}
