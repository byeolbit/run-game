import { createStartScreen } from "./startScreen";
import { initScene, animate } from "./scene";
import { createObstacles } from "./obstacles";
import { initPlayer } from "./player";

export class Game {
  constructor(obstacleModels, playerModel) {
    this.score = 0;
    this.isGameOver = false;
    this.gameOverReason = "";
    this.startTime = Date.now();
    this.gameStartTime = Date.now();
    this.playerSpeed = 0.01;
    this.scoreElement = document.getElementById("scoreContainer");
    this.scoreElement.style.display = "none";
    this.onGameOver = () => {};
    this.beforeGameReset = () => {};
    this.gameOverScreen = document.getElementById("gameOverScreen");
    this.gameOverReasonElement = document.getElementById("gameOverReason");
    this.finalScoreElement = document.getElementById("finalScore");
    this.lastFrameEl = document.getElementById("gameOverImage");
    this.restartButton = document.getElementById("restartButton");
    this.restartButton.addEventListener("click", () => this.restart());
    this.obstacleModels = obstacleModels;
    this.playerModel = playerModel;
  }

  async initGame() {
    const { scene, camera, renderer, directionalLight, destroyScene } =
      initScene();
    const destroyPlayerControl = initPlayer(this.playerModel, scene);
    const obstacleController = await createObstacles(
      scene,
      this.obstacleModels
    );
    const endAnimate = animate(
      scene,
      camera,
      renderer,
      this.playerModel,
      directionalLight,
      obstacleController,
      this
    );

    this.scoreElement.style.display = "block";
    this.onGameOver = () => {
      this.scoreElement.style.display = "none";
      destroyPlayerControl();
    };
    this.beforeGameReset = () => {
      endAnimate();
      destroyScene();
    };
  }

  showStartScreen() {
    createStartScreen(() => this.initGame());
  }

  updateScore() {
    if (this.isGameOver) return;
    this.score = Math.floor((Date.now() - this.startTime) / 100);
    this.scoreElement.textContent = this.score + " M";
  }

  gameOver(reason = "Collision") {
    this.isGameOver = true;
    this.gameOverReason = reason;
    this.showGameOverScreen(reason);
    this.onGameOver();
  }

  getElapsedTime() {
    if (this.gameStartTime === null) return 0;
    return Date.now() - this.gameStartTime;
  }

  showGameOverScreen(reason) {
    this.gameOverReasonElement.textContent = `Reason: ${reason}`;
    this.finalScoreElement.textContent = `${this.score} M`;
    this.gameOverScreen.style.display = "flex";
  }

  restart() {
    this.score = 0;
    this.isGameOver = false;
    this.startTime = Date.now();
    this.gameStartTime = Date.now();
    this.gameOverScreen.style.display = "none";
    this.scoreElement.textContent = "0 M";
    this.beforeGameReset();
    this.initGame();
  }
}
