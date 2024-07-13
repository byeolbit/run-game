import { initScene, animate } from './scene';
import { loadPlayer } from './player';
import { createObstacles } from './osbstacles';

const { scene, camera, renderer } = initScene();

loadPlayer(scene).then(player => {
  createObstacles(scene);
  animate(scene, camera, renderer, player);
});