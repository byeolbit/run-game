import * as THREE from 'three';

export function createObstacles(scene) {
  function createObstacle(x, z) {
    const obstacleGeometry = new THREE.BoxGeometry(1, 1, 1);
    const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
    obstacle.position.set(x, 0.5, z);
    scene.add(obstacle);
  }

  createObstacle(2, -5);
  createObstacle(-3, -10);
  createObstacle(4, -15);
}
