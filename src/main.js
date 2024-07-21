import { loadPlayerModel } from "./player";
import { loadAllObstacleModels } from "./obstacles";
import { Game } from "./game";

const startGame = async () => {
  const [loadedObstacleModels, loadedPlayerModel] = await Promise.all([
    loadAllObstacleModels(),
    loadPlayerModel(),
  ]);

  const game = new Game(loadedObstacleModels, loadedPlayerModel);

  game.showStartScreen();
};

startGame();
