import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.169.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.169.0/examples/jsm/loaders/GLTFLoader.js';

// Scene and Camera Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = -20; // Initial camera position

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

let skybox;

// Skybox function
const createSkybox = () => {
    const loader = new THREE.TextureLoader();
    loader.load("Resource/images/Nebula.jpg", (texture) => {
        const sphereGeometry = new THREE.SphereGeometry(200, 60, 40); // Increased size
        const sphereMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        skybox = new THREE.Mesh(sphereGeometry, sphereMaterial);
        scene.add(skybox);
    });
};
createSkybox();

// Ground Setup with Boxes
const groundGroup = new THREE.Group();
const groundCount = 10; // Number of tiles
const groundLength = 50; // Length of each tile
const groundWidth = 50; // Width of each tile
const boxCountPerTile = 5; // Number of boxes per tile
const groundSpeed = 0.6; // Speed at which the ground moves

const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 }); // Green color for the ground
const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown color for boxes

for (let i = 0; i < groundCount; i++) {
    const groundTile = new THREE.Mesh(
        new THREE.PlaneGeometry(groundWidth, groundLength),
        groundMaterial
    );
    groundTile.rotation.x = -Math.PI / 2; // Make the plane horizontal
    groundTile.position.z = i * groundLength; // Stack tiles

    // Add random boxes to each tile
    for (let j = 0; j < boxCountPerTile; j++) {
        const box = new THREE.Mesh(
            new THREE.BoxGeometry(2, 2, 2),
            boxMaterial
        );
        box.position.x = Math.random() * groundWidth - groundWidth / 2; // Random x position within tile
        box.position.z = Math.random() * groundLength - groundLength / 2; // Random z position within tile
        box.position.y = 1; // Elevate box slightly above the ground
        groundTile.add(box); // Attach box to the tile
    }

    groundGroup.add(groundTile);
}
scene.add(groundGroup);

// Player Model
let player;
const loader = new GLTFLoader();
loader.setPath("Resource/3Dmodels/");
loader.load(
    "pod.glb",
    (gltf) => {
        player = gltf.scene;
        player.scale.set(0.05, 0.05, 0.05);
        player.position.y = 2; // Float above the ground
        player.rotation.y = Math.PI; // Rotate player to face the correct direction
        scene.add(player);
    },
    undefined,
    (error) => {
        console.error("Error loading model:", error);
        const geometry1 = new THREE.BoxGeometry(1, 1, 1);
        const material1 = new THREE.MeshStandardMaterial({ color: 0xadd8e6 }); // Light blue color
        player = new THREE.Mesh(geometry1, material1);
        player.position.y = 2; // Float above the ground
        player.rotation.y = Math.PI; // Rotate fallback player model
        scene.add(player);
    }
);

// Lights
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
scene.add(directionalLight);
const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
scene.add(ambientLight);

// Movement control variables
const keyState = { 'w': false, 's': false, 'a': false, 'd': false };

// Key Event Listeners
document.addEventListener('keydown', (event) => {
    if (keyState.hasOwnProperty(event.key)) keyState[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    if (keyState.hasOwnProperty(event.key)) keyState[event.key] = false;
});

// Bullets
const bullets = [];
document.addEventListener('mousedown', () => {
    if (player) {
        const bulletGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
        bullet.position.copy(player.position);
        bullet.quaternion.copy(player.quaternion); // Match rotation of the player
        scene.add(bullet);
        bullets.push(bullet);
    }
});

// Animation Loop
function animate() {
    if (player) {
        // Move the ground instead of the player
        if (keyState['w']) {
            groundGroup.position.z -= groundSpeed;

            // Loop the ground tiles
            groundGroup.children.forEach((tile) => {
                if (tile.position.z + groundGroup.position.z < -groundLength) {
                    tile.position.z += groundCount * groundLength;
                }
            });
        }
        if (keyState['s']) {
            groundGroup.position.z += groundSpeed;

            // Loop the ground tiles
            groundGroup.children.forEach((tile) => {
                if (tile.position.z + groundGroup.position.z > groundLength * (groundCount - 1)) {
                    tile.position.z -= groundCount * groundLength;
                }
            });
        }
        if (keyState['a']) {
            player.position.x -= 0.6; // Move left
        }
        if (keyState['d']) {
            player.position.x += 0.6; // Move right
        }

        // Update camera position to follow the player
        const offset = 18; // Distance between player and camera
        camera.position.x = player.position.x;
        camera.position.z = player.position.z - offset;
        camera.position.y = 10; // Fixed height for the camera
        camera.lookAt(player.position);
    }

    // Update bullets
    bullets.forEach((bullet, index) => {
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(bullet.quaternion); // Get forward direction from quaternion
        bullet.position.addScaledVector(forward, 1); // Move bullet forward

        // Remove bullets if out of bounds
        if (bullet.position.z < -100 || bullet.position.z > 100 || 
            bullet.position.x < -100 || bullet.position.x > 100) {
            scene.remove(bullet);
            bullets.splice(index, 1);
        }
    });

    // Rotate the skybox
    if (skybox) skybox.rotation.y += 0.001;

    // Render the scene
    renderer.render(scene, camera);
}
