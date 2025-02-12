import * as THREE from 'three';
import { getBody, getMouseBall } from './getBodies.js';
import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat@0.11.2';
import { EffectComposer } from "jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "jsm/postprocessing/UnrealBloomPass.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let mousePos=new THREE.Vector2();
await RAPIER.init();
const gravity = {x: 0.0, y: 0, z: 0.0};
const world = new RAPIER.World(gravity);

const renderScene = new RenderPass(scene, camera);
const bloomPass=new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 2.0, 0.0, 0.005);
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

const numBodies = 400;
const bodies=[];
for(let i=0;i<numBodies;i++){
  const body = getBody(RAPIER, world);
  bodies.push(body);
  scene.add(body.mesh);
}

const mouseBall = getMouseBall(RAPIER, world);
scene.add(mouseBall.mesh);

const hemiLight = new THREE.HemisphereLight(0xFF0000, 0xFF69B4);
hemiLight.intensity=1;
scene.add(hemiLight);

function animate() {
  requestAnimationFrame(animate);
  world.step();
  for(let i=0;i<numBodies;i++){
    bodies[i].update();
  }
  mouseBall.update(mousePos);
  composer.render(scene, camera);
}

animate();

function handleWindowsResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowsResize, false);

function handleMouseMove(event) {
  mousePos.x = (event.clientX / window.innerWidth) * 2 - 1;
  mousePos.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
window.addEventListener('mousemove', handleMouseMove, false);