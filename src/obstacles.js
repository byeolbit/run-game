import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

const loader = new GLTFLoader();

const obstacleModels = [
  { name: "basket", path: "/resources/models/obstacles/bascket.gltf" },
  { name: "ball", path: "/resources/models/obstacles/ball.gltf" },
  { name: "drawer", path: "/resources/models/obstacles/drawer.gltf" },
  { name: "plant2", path: "/resources/models/obstacles/plant2.gltf" },
  { name: "table", path: "/resources/models/obstacles/table.gltf" },
];

const loadedModels = {};

function getRandomX() {
  const values = [-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7];
  const randomIndex = Math.floor(Math.random() * values.length);
  return values[randomIndex];
}

async function loadAllModels() {
  console.log("Starting to load all models...");
  const promises = obstacleModels.map(
    (model) =>
      new Promise((resolve, reject) => {
        console.log(`Loading model: ${model.name}`);
        loader.load(
          model.path,
          (gltf) => {
            console.log(`Model loaded: ${model.name}`);
            loadedModels[model.name] = gltf.scene;
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
}

export async function createObstacles(scene) {
  await loadAllModels();

  const obstacles = [];
  const objectPool = [];
  let maxObstacles = 50;
  const obstacleDistance = 20;
  let difficultyFactor = 6; // 난이도 팩터 추가

  function createObstacle(z) {
    let obstacle;
    if (objectPool.length > 0) {
      obstacle = objectPool.pop();
    } else {
      const randomModel =
        obstacleModels[Math.floor(Math.random() * obstacleModels.length)];
      obstacle = loadedModels[randomModel.name].clone();
      obstacle.scale.set(0.5, 0.5, 0.5); // 크기 조정이 필요할 수 있습니다
      obstacle.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });
    }
    obstacle.position.set(getRandomX(), 0, z);
    scene.add(obstacle);
    obstacles.push(obstacle);
  }

  function removeObstacle(obstacle) {
    const index = obstacles.indexOf(obstacle);
    if (index > -1) {
      obstacles.splice(index, 1);
      scene.remove(obstacle);
      objectPool.push(obstacle);
    }
  }

  function increaseDifficulty(elapsedTime) {
    const elapsedSeconds = elapsedTime / 1000;
    const newDifficultyFactor = 1 + Math.floor(elapsedSeconds) * 0.1;
    difficultyFactor = newDifficultyFactor;
    return newDifficultyFactor;
  }

  return {
    update(playerZ, elapsedTime) {
      const difficultyFactor = increaseDifficulty(elapsedTime);

      const screenEdgeZ = playerZ - 15; // 플레이어로부터 10 유닛 앞에 장애물 생성

      // 새 장애물 생성
      const obstaclesNeeded = Math.min(80, Math.floor(difficultyFactor * 2));
      while (obstacles.length < obstaclesNeeded * 2 && playerZ < -10) {
        const newZ = screenEdgeZ;
        createObstacle(newZ - Math.floor(Math.random() * 10));
      }

      // 지나간 장애물 제거
      for (let i = obstacles.length - 1; i >= 0; i--) {
        if (obstacles[i].position.z > playerZ + 15) {
          removeObstacle(obstacles[i]);
        } else {
          break;
        }
      }
    },
    getNearbyObstacles(playerZ) {
      return obstacles.filter((obs) => Math.abs(obs.position.z - playerZ) < 10);
    },
  };
}
