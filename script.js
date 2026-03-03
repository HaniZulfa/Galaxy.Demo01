import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

//
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
camera.position.z = 30;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.zoomSpeed = 15;
controls.minDistance = 8;
controls.maxDistance = 200;

//
const starVertices = [];
for (let i = 0; i < 1000; i++) {
    const r = 700 + Math.random() * 1000;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    starVertices.push(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
}
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.15 }));
scene.add(stars);

const nebulas = [];
const palette = [0x0000ff, 0x0077ff, 0x00fbff, 0x4400ff, 0xffcc00, 0x0033ff];
const nCanvas = document.createElement('canvas');
nCanvas.width = 128; nCanvas.height = 128;
const nCtx = nCanvas.getContext('2d');
const nGrad = nCtx.createRadialGradient(64,64,0,64,64,64);
nGrad.addColorStop(0, 'white'); nGrad.addColorStop(1, 'transparent');
nCtx.fillStyle = nGrad; nCtx.fillRect(0,0,128,128);
const nebTex = new THREE.CanvasTexture(nCanvas);

for (let i = 0; i < 100; i++) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ 
        map: nebTex, transparent: true, opacity: 0.2, 
        color: palette[i % palette.length], blending: THREE.AdditiveBlending 
    }));
    const r = 600 + Math.random() * 900;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    sprite.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
    sprite.scale.set(400, 400, 1);
    scene.add(sprite);
    nebulas.push(sprite);
}

//
const planetGeo = new THREE.SphereGeometry(6, 64, 64);
const planetMat = new THREE.MeshBasicMaterial({ color: 0x89cff0 });
const planet = new THREE.Mesh(planetGeo, planetMat);
scene.add(planet);

const pointLight = new THREE.PointLight(0x89cff0, 25, 200);
scene.add(pointLight);

const gCanvas = document.createElement('canvas');
gCanvas.width = 128; gCanvas.height = 128;
const gCtx = gCanvas.getContext('2d');
const gGrad = gCtx.createRadialGradient(64,64,0,64,64,64);
gGrad.addColorStop(0, 'rgba(137, 207, 240, 1)'); 
gGrad.addColorStop(1, 'rgba(0,0,0,0)');
gCtx.fillStyle = gGrad; gCtx.fillRect(0,0,128,128);

const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(gCanvas),
    transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending
}));
glowSprite.scale.set(40, 40, 1);
planet.add(glowSprite);

//
const randomAsteroidGroup = new THREE.Group();
const asteroidGeo = new THREE.IcosahedronGeometry(1, 0);
for (let i = 0; i < 300; i++) {
    const mat = new THREE.MeshStandardMaterial({ color: 0x444444, emissive: 0x89cff0, emissiveIntensity: 0.1 });
    const mesh = new THREE.Mesh(asteroidGeo, mat);
    const dist = 30 + Math.random() * 50;
    const angle = Math.random() * Math.PI * 2;
    mesh.position.set(Math.cos(angle) * dist, (Math.random() - 0.5) * 15, Math.sin(angle) * dist);
    const s = 0.2 + Math.random() * 0.5;
    mesh.scale.set(s, s, s);
    randomAsteroidGroup.add(mesh);
}
scene.add(randomAsteroidGroup);

function createBelt(count, innerR, outerR, yVar) {
    const group = new THREE.Group();
    for (let i = 0; i < count; i++) {
        const mat = new THREE.MeshStandardMaterial({ color: 0x333333, emissive: 0x89cff0, emissiveIntensity: 0.05 });
        const mesh = new THREE.Mesh(asteroidGeo, mat);
        const dist = innerR + Math.random() * (outerR - innerR);
        const angle = Math.random() * Math.PI * 2;
        mesh.position.set(Math.cos(angle) * dist, (Math.random() - 0.5) * yVar, Math.sin(angle) * dist);
        const s = 0.1 + Math.random() * 0.4;
        mesh.scale.set(s, s, s);
        group.add(mesh);
    }
    scene.add(group);
    return group;
}

const belt1 = createBelt(150, 40, 70, 10);
const belt2 = createBelt(150, 90, 140, 20);

//
function createShootingStar() {
    const direction = new THREE.Vector3(-1.5, -1, -0.5);
    const startPos = new THREE.Vector3((Math.random()-0.5)*1500, (Math.random()-0.5)*1500, (Math.random()-0.5)*1000);
    const geo = new THREE.BufferGeometry().setFromPoints([startPos, startPos.clone().sub(direction.clone().multiplyScalar(50))]);
    const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true });
    const line = new THREE.Line(geo, mat);
    scene.add(line);
    function move() {
        line.position.add(direction.clone().multiplyScalar(15));
        line.material.opacity -= 0.02;
        if (line.material.opacity <= 0) { scene.remove(line); } 
        else { requestAnimationFrame(move); }
    }
    move();
}
setInterval(createShootingStar, 200);

//
const playlist = ['Lagu_Santai_01.mp3', 'Lagu_Santai_02.mp3', 'Lagu_Santai_03.mp3'];
let currentTrack = 0;

const lagu = document.getElementById('audioLagu');
const playStatus = document.getElementById('playStatus');
const trackTitle = document.getElementById('trackTitle');

function loadTrack(index) {
    if (playlist[index]) {
        lagu.src = playlist[index];
        if (trackTitle) trackTitle.innerText = playlist[index].replace(/_/g, ' ').replace('.mp3', '');
    }
}

loadTrack(currentTrack);

//
window.handleMusicClick = function() {
    if (lagu.paused) {
        lagu.play().catch(e => console.log("Klik dulu layarnya sekali, baru Play!"));
        if (playStatus) playStatus.innerText = 'II';
    } else {
        lagu.pause();
        if (playStatus) playStatus.innerText = '▶';
    }
};

lagu.addEventListener('ended', () => {
    currentTrack = (currentTrack + 1) % playlist.length;
    loadTrack(currentTrack);
    lagu.play();
});

//
const menuBtn = document.getElementById('menuBtn');
const navMenu = document.getElementById('navMenu');

if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
        console.log("Menu berhasil dibuka/tutup!");
    });
}

//
window.addEventListener('keydown', (e) => {
    switch (e.key.toLowerCase()) {
        //
        case 'f':
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.log("Gagal masuk mode serius, Jul!");
                });
            } else {
                document.exitFullscreen();
            }
            break;

        //
        case ' ':
            e.preventDefault();
            if (lagu.paused) {
                lagu.play().catch(e => console.log("Klik layar dulu sekali Jul!"));
                console.log("Musik jalan!");
            } else {
                lagu.pause();
                console.log("Musik berhenti!");
            }
            break;

        //
        case 'n':
            currentTrack = (currentTrack + 1) % playlist.length;
            loadTrack(currentTrack);
            lagu.play();
            console.log("Pindah ke: " + playlist[currentTrack]);
            break;
    }
});

//
const infoBtn = document.getElementById('infoBtn');
const infoOverlay = document.getElementById('infoOverlay');

//
infoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    infoOverlay.style.display = 'flex';
});

window.addEventListener('click', () => {
    if (infoOverlay.style.display === 'flex') {
        infoOverlay.style.display = 'none';
    }
});

//
infoOverlay.querySelector('.info-card').addEventListener('click', (e) => {
    e.stopPropagation();
});

//
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    const time = Date.now() * 0.0004;

    nebulas.forEach((neb, i) => {
        neb.material.opacity = 0.08 + Math.sin(time * 2 + i) * 0.05;
    });

    planet.rotation.y += 0.003;
    stars.rotation.y += 0.0001;

    randomAsteroidGroup.rotation.y += 0.0005;
    belt1.rotation.y += 0.0003;
    belt2.rotation.y -= 0.0002;

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

//
const isMobile = window.innerWidth < 768;
const isHighEnd = !isMobile && window.devicePixelRatio > 1.5;

//
const asteroidCount = isMobile ? 150 : (isHighEnd ? 400 : 250);
const belt1Count = isMobile ? 80 : 200;
const belt2Count = isMobile ? 150 : 400;


