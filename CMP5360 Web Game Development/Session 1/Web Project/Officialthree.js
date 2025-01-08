import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.169.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.169.0/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = -18;
camera.position.y = 5;

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

// Skybox
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

// Ground Texture
const textureLoader = new THREE.TextureLoader();
const groundTexture = textureLoader.load(
    'Lava.jpg',
    () => console.log('Texture loaded successfully'),
    undefined,
    (err) => console.error('Error loading texture:', err)
);

groundTexture.wrapS = THREE.RepeatWrapping;
groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set(4, 4);

const groundMaterial = new THREE.MeshStandardMaterial({ 
    map: groundTexture,
    emissive: 0xaa0000,
    emissiveIntensity: 0.4
});

const groundGroup = new THREE.Group();
const groundWidth = 50;
const groundLength = 50;
const groundCount = 10;

for (let i = 0; i < groundCount; i++) {
    const groundTile = new THREE.Mesh(
        new THREE.PlaneGeometry(groundWidth, groundLength),
        groundMaterial
    );
    groundTile.rotation.x = -Math.PI / 2;
    groundTile.position.z = i * groundLength;
    groundGroup.add(groundTile);
}
scene.add(groundGroup);

// Custom Model for Player
let player;
const loader = new GLTFLoader();
loader.setPath("Resource/3Dmodels/");
loader.load(
    "UFO MODEL.glb",
    (gltf) => {
        player = gltf.scene;
        player.scale.set(0.60, 0.60, 0.60);
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

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
scene.add(directionalLight);
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// Movement
const keyState = { 'w': false, 's': false, 'a': false, 'd': false, ' ': false };

// Shooting
let canShoot = true;
const shootDelay = 300;
const bullets = [];

const shootBullet = () => {
    if (player && canShoot) {
        canShoot = false;
        setTimeout(() => canShoot = true, shootDelay);

        const bulletGeometry = new THREE.SphereGeometry(0.5, 16, 16);
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
};

document.addEventListener('keydown', (event) => {
    if (keyState.hasOwnProperty(event.key)) keyState[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    if (keyState.hasOwnProperty(event.key)) keyState[event.key] = false;
});

document.addEventListener('mousedown', shootBullet);

// Enemies
const enemies = [];
const spawnEnemy = () => {
    const enemyGeometry = new THREE.SphereGeometry(1, 32, 32);
    const enemyMaterial = new THREE.MeshStandardMaterial({ 
        map: textureLoader.load('Resource/images/astroid.jpg') 
    });

    const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);

    // Set enemy size (scale it up)
    enemy.scale.set(2, 2, 2);

    enemy.position.set(
        (Math.random() - 0.5) * groundWidth * 0.8,
        2,
        player.position.z + 50 + Math.random() * 50
    );

    scene.add(enemy);
    enemies.push(enemy);
};
setInterval(spawnEnemy, 2000);

//Only Move Left and right
const handleInput = () => {
    if (keyState['a']) {
        player.position.x += 0.6;
    }
    if (keyState['d']) {
        player.position.x -= 0.6;
    }

    if (keyState[' ']) {
        shootBullet();
    }
};
//UI
let startTime = Date.now();

const timerElement = document.createElement("div");
timerElement.style.position = "absolute";
timerElement.style.top = "10px";
timerElement.style.right = "10px";
timerElement.style.color = "white";
timerElement.style.fontSize = "48px";
timerElement.style.fontFamily = "sans-serif";
document.body.appendChild(timerElement);

const scoreLabel = document.createElement("div");
scoreLabel.style.position = "absolute";
scoreLabel.style.top = "10px";
scoreLabel.style.right = "320px";
scoreLabel.style.color = "white";
scoreLabel.style.fontSize = "48px";
scoreLabel.style.fontFamily = "sans-serif";
scoreLabel.textContent = "Score:";
document.body.appendChild(scoreLabel);

const scoreElement = document.createElement("div");
scoreElement.style.position = "absolute";
scoreElement.style.top = "10px";
scoreElement.style.right = "240px";
scoreElement.style.color = "white";
scoreElement.style.fontSize = "48px";
scoreElement.style.fontFamily = "sans-serif";
document.body.appendChild(scoreElement);

let score = 0;

//Health
let health = 5;
const healthBarContainer = document.createElement("div");
healthBarContainer.style.position = "absolute";
healthBarContainer.style.top = "10px";
healthBarContainer.style.left = "50%";
healthBarContainer.style.transform = "translateX(-50%)";
healthBarContainer.style.width = "300px"; 
healthBarContainer.style.height = "30px";
healthBarContainer.style.border = "3px solid white";
document.body.appendChild(healthBarContainer);

const healthBar = document.createElement("div");
healthBar.style.height = "100%";
healthBar.style.width = "100%";
healthBar.style.backgroundColor = "red";
healthBarContainer.appendChild(healthBar);

// Background Music 
const backgroundMusic = new Audio('./Moving In The Shadows - The Soundlings.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5; 
backgroundMusic.play();

function animate() {
    if (player) {
        handleInput();

        groundGroup.position.z -= 0.5;
        groundGroup.children.forEach((tile) => {
            if (tile.position.z + groundGroup.position.z < -groundLength) {
                tile.position.z += groundCount * groundLength;
            }
        });

        const halfWidth = groundWidth / 2;
        if (player.position.x > halfWidth) {
            player.position.x = halfWidth;
        }
        if (player.position.x < -halfWidth) {
            player.position.x = -halfWidth;
        }

        camera.position.x = player.position.x;
        camera.position.z = player.position.z - 18;
        camera.position.y = player.position.y + 3;
        camera.lookAt(player.position);
    }

    let elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    timerElement.textContent = `Time: ${elapsedTime}s`;

    bullets.forEach((bullet, bulletIndex) => {
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(bullet.quaternion);
        bullet.position.addScaledVector(forward, 1);

        if (bullet.position.z < -100 || bullet.position.z > 100 ||
            bullet.position.x < -100 || bullet.position.x > 100) {
            scene.remove(bullet);
            bullets.splice(bulletIndex, 1);
        }

        enemies.forEach((enemy, enemyIndex) => {
            if (bullet.position.distanceTo(enemy.position) < 1) {
                scene.remove(enemy);
                scene.remove(bullet);
                enemies.splice(enemyIndex, 1);
                bullets.splice(bulletIndex, 1);
                score += 10;
                scoreElement.textContent = `${score}`;
            }
        });
    });

    enemies.forEach((enemy, index) => {
        enemy.position.z -= 0.5;
        if (enemy.position.distanceTo(player.position) < 5) {
            health -= 1;
            healthBar.style.width = `${(health / 5) * 100}%`;
            scene.remove(enemy);
            enemies.splice(index, 1);
            if (health <= 0) {
                backgroundMusic.pause(); 
                alert("Game Over!");
                window.location.reload();
            }
        }
    });

    if (skybox) skybox.rotation.y += 0.001;
    renderer.render(scene, camera);
}
