import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

const obstacleModels = [
  { name: "basket", path: "/resources/models/obstacles/bascket.gltf" },
  { name: "ball", path: "/resources/models/obstacles/ball.gltf" },
  { name: "drawer", path: "/resources/models/obstacles/drawer.gltf" },
  { name: "plant2", path: "/resources/models/obstacles/plant2.gltf" },
  { name: "table", path: "/resources/models/obstacles/table.gltf" },
];

function getRandomX() {
  const values = [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8];
  const randomIndex = Math.floor(Math.random() * values.length);
  return values[randomIndex];
}

export async function loadAllObstacleModels() {
  const loadedModels = {};

  console.log("Starting to load all models...");
  const promises = obstacleModels.map(
    (model) =>
      new Promise((resolve, reject) => {
        console.log(`Loading model: ${model.name}`);
        loader.load(
          model.path,
          (gltf) => {
            console.log(`Model loaded: ${model.name}`);
            const obsModel = gltf.scene;
            obsModel.traverse((node) => {
              if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
              }
            });
            obsModel.scale.set(0.5, 0.5, 0.5);
            loadedModels[model.name] = obsModel;
            resolve();
          },
          undefined,
          (error) => {
            console.error(`Error loading model ${model.name}:`, error);
            reject(error);
          }
        );
      })
  );
  await Promise.all(promises);
  console.log("All models loaded successfully.");
  return loadedModels;
}

export function createObstaclesPool(obstacleModels) {
  const obstaclesPool = [];
  const maxObstaclesInPool = 40;

  for (let i = 0; i < maxObstaclesInPool / obstacleModels.length; i++) {
    obstacleModels.forEach((model) => {
      const obstacle = model.clone();
      obstaclesPool.push(obstacle);
    });
  }

  return obstaclesPool;
}

export async function createObstacles(scene, loadedModels) {
  const obstacles = [];
  const obstaclePool = createObstaclesPool(loadedModels);
  let lastObstacleZ = 0;
  const minObstacleDistance = 5;

  let obstacleReleaseInterval = 0.1;
  let lastObstacleReleaseTime = 0;

  let lastDifficultyUpdate = 0;
  let currentDifficultyFactor = 1;
  const difficultyUpdateInterval = 1000; // 1초마다 난이도 업데이트

  function createObstacle(z) {
    let obstacle;
    if (obstaclePool.length > 0) {
      obstacle = obstaclePool.shift();
    } else {
      const randomModel =
        obstacleModels[Math.floor(Math.random() * obstacleModels.length)];
      obstacle = loadedModels[randomModel.name].clone();
    }
    obstacle.position.set(getRandomX(), 0, z);
    scene.add(obstacle);
    obstacles.push(obstacle);
    lastObstacleZ = z;

    return obstacle;
  }

  return {
    update(playerZ, elapsedTime) {
      const currentTime = elapsedTime / 10000;

      if (currentTime - lastObstacleReleaseTime <= obstacleReleaseInterval) {
        return;
      }

      // 난이도 업데이트 (1초마다)
      if (elapsedTime - lastDifficultyUpdate > difficultyUpdateInterval) {
        currentDifficultyFactor = 1 + Math.floor(elapsedTime / 1000) * 0.1;
        lastDifficultyUpdate = elapsedTime;
      }

      let screenEdgeZ = playerZ - 16;

      const maxObstacles = Math.min(8, Math.floor(currentDifficultyFactor));

      if (screenEdgeZ - lastObstacleZ < minObstacleDistance) {
        for (let i = 0; i < maxObstacles; i++) {
          createObstacle(screenEdgeZ - i * 2);
        }
        lastObstacleReleaseTime = currentTime;
      }
    },
    removeObstacles(playerZ) {
      // 지나간 장애물 제거
      while (obstacles.length > 0 && obstacles[0].position.z > playerZ + 16) {
        const removedObstacle = obstacles.shift();
        scene.remove(removedObstacle);
        obstaclePool.push(removedObstacle);
      }
    },
    getNearbyObstacles(playerZ) {
      return obstacles.filter((obs) => Math.abs(obs.position.z - playerZ) < 3);
    },
  };
}
