import { initScene, animate } from "./scene";
import { loadPlayer } from "./player";
import { createObstacles } from "./obstacles";
import { Game } from "./game";
import { createStartScreen } from "./startScreen";

let currentGame;

import { createInspector } from "three-inspect/vanilla";

const targetElement = document.querySelector("body");

export async function initGame() {
  if (currentGame) {
    // 이전 게임 정리
    currentGame.isGameOver = true;
    // 필요한 경우 씬 정리 로직 추가
  }

  const { scene, camera, renderer, directionalLight, destory } = initScene();

  // const inspector = createInspector(targetElement, {
  //   scene,
  //   camera,
  //   renderer,
  // });

  const { player, onDestroy } = await loadPlayer(scene);

  const game = new Game(() => {
    destory();
    onDestroy();
  });
  currentGame = game;

  const obstacleController = await createObstacles(scene, camera);
  animate(
    scene,
    camera,
    renderer,
    player,
    directionalLight,
    obstacleController,
    game
  );

  return game;
}

function startGame() {
  createStartScreen(() => {
    initGame();
  });
}

startGame();
