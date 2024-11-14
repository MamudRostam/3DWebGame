import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.169.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.169.0/examples/jsm/loaders/GLTFLoader.js';

// Scene and Camera Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

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
    "low_poly_helicopter.glb",
    (gltf) => {
        player = gltf.scene;
        player.scale.set(0.3, 0.3, 0.3);
        player.position.y = 1;
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
let changed = false;

// Button Control Logic
window.moveUp = function() {
    upstate = true;
    downstate = false;
};

window.moveDown = function() {
    upstate = false;
    downstate = true;
};

window.stopMovement = function() {
    upstate = false;
    downstate = false;
};

// Cubes
const cub1 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
scene.add(cub1);

const group2 = new THREE.Group();
const cube2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshStandardMaterial({ color: 0x0000ff }));
group2.add(cube2);
scene.add(group2);

// Animation Loop
function animate() {
    if (player) {
        if (upstate) {
            player.position.y += 0.02;
        } else if (downstate) {
            player.position.y -= 0.02;
        }

        if (player.position.y > 1 && !changed) {
            player.material.color.setHex(0xFFA500);
            changed = true;
        }
    }

    cub1.rotation.y += 0.02;
    group2.rotation.y += 0.01;
    group2.rotation.x += 0.01;

    controls.update();
    renderer.render(scene, camera);

    
}
