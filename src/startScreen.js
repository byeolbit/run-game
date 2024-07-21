import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const getAspect = () => window.innerWidth / window.innerHeight;

const frustumSize = 1;

const getCameraValues = (aspect = getAspect()) => {
  return {
    left: (frustumSize * aspect) / -2,
    right: (frustumSize * aspect) / 2,
    top: frustumSize / 2,
    bottom: frustumSize / -2,
    near: 0.1,
    far: 1000,
  };
};

export function createStartScreen(onStartGame) {
  const canvas = document.getElementById("gameCanvas");
  const startElement = document.getElementById("gameIntroContainer");
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
  });

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const {
    left: cameraLeft,
    right: cameraRight,
    top: cameraTop,
    bottom: cameraBottom,
    near: cameraNear,
    far: cameraFar,
  } = getCameraValues();

  const camera = new THREE.OrthographicCamera(
    cameraLeft,
    cameraRight,
    cameraTop,
    cameraBottom,
    cameraNear,
    cameraFar
  );

  const scene = new THREE.Scene();

  camera.position.setFromSphericalCoords(5, -Math.PI * 1.6, Math.PI / 1.5);
  camera.lookAt(0, 0.15, 0);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 10, -10);
  directionalLight.castShadow = true;
  scene.add(directionalLight);
  scene.add(directionalLight.target);

  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.left = -10;
  directionalLight.shadow.camera.right = 10;
  directionalLight.shadow.camera.top = 10;
  directionalLight.shadow.camera.bottom = -10;

  const floorGeometry = new THREE.PlaneGeometry(100, 100);
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xa7c7e7 });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.castShadow = true;
  floor.receiveShadow = true;
  scene.add(floor);

  const loader = new GLTFLoader();
  loader.load("/resources/models/sb.gltf", (gltf) => {
    const playerModel = gltf.scene;
    playerModel.scale.set(0.5, 0.5, 0.5);
    playerModel.position.set(0, 0, 0);
    scene.add(playerModel);

    playerModel.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });

    const animate = () => {
      requestAnimationFrame(animate);
      playerModel.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();
  });

  function onWindowResize() {
    const isPortrait = window.innerHeight > window.innerWidth;
    const targetAspect = 9 / 16;

    let width, height;
    if (isPortrait) {
      width = window.innerWidth;
      height = window.innerHeight;
    } else {
      if (window.innerWidth / window.innerHeight > targetAspect) {
        height = window.innerHeight;
        width = height * targetAspect;
      } else {
        width = window.innerWidth;
        height = width / targetAspect;
      }
    }

    const aspect = width / height;
    const { left, right, top, bottom } = getCameraValues(aspect);
    camera.left = left;
    camera.right = right;
    camera.top = top;
    camera.bottom = bottom;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    startElement.style.width = `${width}px`;
    startElement.style.height = `${height}px`;

    const pixelRatio = window.devicePixelRatio;
    renderer.setPixelRatio(pixelRatio);
  }

  window.addEventListener("resize", onWindowResize);
  onWindowResize();

  const destroy = () => {
    window.removeEventListener("resize", onWindowResize);
    startElement.style.display = "none";
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }
  };

  const startButton = document.getElementById("startButton");
  startButton.addEventListener("click", () => {
    destroy();
    onStartGame();
  });

  return destroy;
}
