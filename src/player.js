import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function loadPlayer(scene) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load('/resources/sb.gltf', function(gltf) {
      const player = gltf.scene;
      player.position.set(0, 0, 0);
      player.rotateY(-45);
      scene.add(player);
      setupControls(player);
      resolve(player);
    }, undefined, function(error) {
      console.error(error);
      reject(error);
    });
  });
}

function setupControls(player) {
  document.addEventListener('keydown', (event) => {
    switch(event.code) {
      case 'ArrowUp':
        player.position.z -= 0.1;
        break;
      case 'ArrowDown':
        player.position.z += 0.1;
        break;
      case 'ArrowLeft':
        player.position.x -= 0.1;
        break;
      case 'ArrowRight':
        player.position.x += 0.1;
        break;
    }
  });
}
