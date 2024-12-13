import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.169.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.169.0/examples/jsm/loaders/GLTFLoader.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = -20; 


const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setAnimationLoop(animate);


const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};
window.addEventListener('resize', onWindowResize);


const controls = new OrbitControls(camera, renderer.domElement);

let skybox;


const createSkybox = () => {
    const loader = new THREE.TextureLoader();
    loader.load("Resource/images/Nebula.jpg", (texture) => {
        const sphereGeometry = new THREE.SphereGeometry(200, 60, 40); 
        const sphereMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        skybox = new THREE.Mesh(sphereGeometry, sphereMaterial);
        scene.add(skybox);
    });
};
createSkybox();


const groundGroup = new THREE.Group();
const groundCount = 10; 
const groundLength = 50; 
const groundWidth = 50; 
const boxCountPerTile = 5; 
const groundSpeed = 0.6; 

const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 }); 
const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); 

for (let i = 0; i < groundCount; i++) {
    const groundTile = new THREE.Mesh(
        new THREE.PlaneGeometry(groundWidth, groundLength),
        groundMaterial
    );
    groundTile.rotation.x = -Math.PI / 2; 
    groundTile.position.z = i * groundLength; 

    
    for (let j = 0; j < boxCountPerTile; j++) {
        const box = new THREE.Mesh(
            new THREE.BoxGeometry(2, 2, 2),
            boxMaterial
        );
        box.position.x = Math.random() * groundWidth - groundWidth / 2; 
        box.position.z = Math.random() * groundLength - groundLength / 2; 
        box.position.y = 1; 
        groundTile.add(box); 
    }

    groundGroup.add(groundTile);
}
scene.add(groundGroup);


let player;
const loader = new GLTFLoader();
loader.setPath("Resource/3Dmodels/");
loader.load(
    "pod.glb",
    (gltf) => {
        player = gltf.scene;
        player.scale.set(0.05, 0.05, 0.05);
        player.position.y = 2; 
        
        
        scene.add(player);
    },
    undefined,
    (error) => {
        console.error("Error loading model:", error);
        const geometry1 = new THREE.BoxGeometry(1, 1, 1);
        const material1 = new THREE.MeshStandardMaterial({ color: 0xadd8e6 }); 
        player = new THREE.Mesh(geometry1, material1);
        player.position.y = 2; 
        player.rotation.y = Math.PI; 
        scene.add(player);
    }
);


const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
scene.add(directionalLight);
const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
scene.add(ambientLight);


const keyState = { 'w': false, 's': false, 'a': false, 'd': false };

// Key Event Listeners
document.addEventListener('keydown', (event) => {
    if (keyState.hasOwnProperty(event.key)) keyState[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    if (keyState.hasOwnProperty(event.key)) keyState[event.key] = false;
});


let startTime = Date.now();
let timerElement = document.createElement("div");
timerElement.style.position = "absolute";
timerElement.style.top = "10px";
timerElement.style.right = "10px";
timerElement.style.color = "white";
timerElement.style.fontSize = "24px";
timerElement.style.fontFamily = "Arial, sans-serif";
document.body.appendChild(timerElement);


const bullets = [];
document.addEventListener('mousedown', () => {
    if (player) {
        const bulletGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);

        bullet.position.copy(player.position); 
        
       
        const reverseQuaternion = new THREE.Quaternion();
        reverseQuaternion.copy(player.quaternion); 
        reverseQuaternion.multiply(new THREE.Quaternion(0, 1, 0, 0)); 

        bullet.quaternion.copy(reverseQuaternion); 
        scene.add(bullet);
        bullets.push(bullet);
    }
});


function animate() {
    if (player) {
        
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
            player.position.x += 0.6; 
        }
        if (keyState['d']) {
            player.position.x -= 0.6; 
        }

        
        const offset = 18; 
        camera.position.x = player.position.x;
        camera.position.z = player.position.z - offset;
        camera.position.y = 10; 
        camera.lookAt(player.position);
    }

    // Update timer
    let elapsedTime = Math.floor((Date.now() - startTime) / 1000); 
    timerElement.textContent = `Time: ${elapsedTime}s`;

    // Update bullets
    bullets.forEach((bullet, index) => {
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(bullet.quaternion); 
        bullet.position.addScaledVector(forward, 1); 

        // Remove bullets if out of bounds
        if (bullet.position.z < -100 || bullet.position.z > 100 || 
            bullet.position.x < -100 || bullet.position.x > 100) {
            scene.remove(bullet);
            bullets.splice(index, 1);
        }
    });

    
    if (skybox) skybox.rotation.y += 0.001;

    
    renderer.render(scene, camera);
}
