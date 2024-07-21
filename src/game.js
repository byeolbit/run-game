import { initGame } from "./main.js";

export class Game {
  constructor(onGameOver) {
    this.score = 0;
    this.isGameOver = false;
    this.gameOverReason = "";
    this.startTime = Date.now();
    this.gameStartTime = Date.now();
    this.playerSpeed = 0.01;
    this.scoreElement = document.getElementById("scoreValue");
    this.scoreElement.style.display = "block";
    this.onGameOver = onGameOver;
    this.gameOverScreen = document.getElementById("gameOverScreen");
    this.gameOverReasonElement = document.getElementById("gameOverReason");
    this.finalScoreElement = document.getElementById("finalScore");
    this.restartButton = document.getElementById("restartButton");
    this.restartButton.addEventListener("click", () => this.restart());
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
    initGame();
  }
}
