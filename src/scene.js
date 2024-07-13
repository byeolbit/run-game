import * as THREE from 'three';

export function initScene() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera.position.set(0, 5, 10);
  camera.lookAt(0, 0, 0);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 10, 7.5).normalize();
  scene.add(directionalLight);

  return { scene, camera, renderer };
}

export function animate(scene, camera, renderer, player) {
  function detectCollisions() {
    const playerBox = new THREE.Box3().setFromObject(player);

    scene.children.forEach((child) => {
      if (child !== player && child.geometry && child.material) {
        const obstacleBox = new THREE.Box3().setFromObject(child);
        if (playerBox.intersectsBox(obstacleBox)) {
          console.log('Collision detected!');
          // 충돌 처리 로직
        }
      }
    });
  }

  function render() {
    requestAnimationFrame(render);
    detectCollisions();
    renderer.render(scene, camera);
  }
  render();
}
