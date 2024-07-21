import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

export function loadPlayer(scene) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      "/resources/models/sb.gltf",
      function (gltf) {
        const playerModel = gltf.scene;

        playerModel.rotation.y = Math.PI / 2; // 모델의 회전 설정

        // 부모 객체 생성
        const playerWrapper = new THREE.Object3D();
        playerWrapper.add(playerModel);

        // 부모 객체의 위치 설정
        playerWrapper.position.set(0, 0, 0);

        // 그림자 설정
        playerModel.traverse(function (node) {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
            node.material.needsUpdate = true;

            // 텍스처 필터링 설정
            if (node.material.map) {
              node.material.map.anisotropy = 16;
              node.material.map.minFilter = THREE.LinearMipMapLinearFilter;
              node.material.map.magFilter = THREE.LinearFilter;
            }
          }
        });

        scene.add(playerWrapper);
        const destroyPlayerInputEvent = setupControls(
          playerWrapper,
          playerModel
        );
        resolve({ player: playerWrapper, onDestroy: destroyPlayerInputEvent });
      },
      undefined,
      function (error) {
        console.error(error);
        reject(error);
      }
    );
  });
}

function setupControls(player) {
  let velocityX = 0;
  let velocityZ = 0;
  const maxSpeed = 0.15;
  const acceleration = 0.004;
  const deceleration = 0.003;
  let leftPressed = false;
  let rightPressed = false;
  let upPressed = false;
  let downPressed = false;

  // 터치 관련 변수
  let touchStartX = 0;
  let touchStartY = 0;
  let isTouching = false;
  const touchSensitivity = 0.08; // 터치 민감도 조절 (값이 작을수록 덜 민감)

  function keydownHandler(event) {
    switch (event.code) {
      case "ArrowLeft":
        leftPressed = true;
        break;
      case "ArrowRight":
        rightPressed = true;
        break;
      case "ArrowUp":
        upPressed = true;
        break;
      case "ArrowDown":
        downPressed = true;
        break;
    }
  }

  function keyupHandler(event) {
    switch (event.code) {
      case "ArrowLeft":
        leftPressed = false;
        break;
      case "ArrowRight":
        rightPressed = false;
        break;
      case "ArrowUp":
        upPressed = false;
        break;
      case "ArrowDown":
        downPressed = false;
        break;
    }
  }

  document.addEventListener("keydown", keydownHandler);
  document.addEventListener("keyup", keyupHandler);
  // 터치 이벤트 리스너 추가
  document.addEventListener("touchstart", handleTouchStart, false);
  document.addEventListener("touchmove", handleTouchMove, false);
  document.addEventListener("touchend", handleTouchEnd, false);

  function handleTouchStart(event) {
    event.preventDefault();
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    isTouching = true;
  }

  function handleTouchMove(event) {
    if (!isTouching) return;

    const touch = event.touches[0];
    const deltaX = (touch.clientX - touchStartX) * -touchSensitivity;
    const deltaY = (touch.clientY - touchStartY) * -touchSensitivity;

    // X축 (좌우) 속도 계산
    velocityX = Math.max(
      Math.min(velocityX - deltaX * acceleration, maxSpeed),
      -maxSpeed
    );

    // Z축 (상하) 속도 계산
    velocityZ = Math.max(
      Math.min(velocityZ - deltaY * acceleration, maxSpeed),
      -maxSpeed
    );

    // 터치 시작 위치 업데이트
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }

  function handleTouchEnd() {
    isTouching = false;
  }

  function updatePlayerPosition() {
    // 키보드 입력에 따른 속도 계산 (기존 코드 유지)
    if (leftPressed && !rightPressed) {
      velocityX = Math.max(velocityX - acceleration, -maxSpeed);
    } else if (rightPressed && !leftPressed) {
      velocityX = Math.min(velocityX + acceleration, maxSpeed);
    } else if (!isTouching) {
      velocityX = applyDeceleration(velocityX);
    }

    if (upPressed && !downPressed) {
      velocityZ = Math.max(velocityZ - acceleration, -maxSpeed);
    } else if (downPressed && !upPressed) {
      velocityZ = Math.min(velocityZ + acceleration, maxSpeed);
    } else if (!isTouching) {
      velocityZ = applyDeceleration(velocityZ);
    }

    // 위치 업데이트
    player.position.x -= velocityX;
    player.position.z -= velocityZ;

    // 기울기 적용 (기존 코드 유지)
    const maxTilt = Math.PI / 12;
    const targetTiltX = (velocityZ / maxSpeed) * maxTilt;
    const targetTiltZ = (-velocityX / maxSpeed) * maxTilt;

    const tiltSpeed = 0.1;
    player.rotation.x += (targetTiltX - player.rotation.x) * tiltSpeed;
    player.rotation.z += (targetTiltZ - player.rotation.z) * tiltSpeed;

    requestAnimationFrame(updatePlayerPosition);
  }

  function applyDeceleration(velocity) {
    if (Math.abs(velocity) < deceleration) {
      return 0;
    } else if (velocity > 0) {
      return velocity - deceleration;
    } else {
      return velocity + deceleration;
    }
  }

  function destroy() {
    velocityX = 0;
    velocityZ = 0;
    document.removeEventListener("keydown", keydownHandler);
    document.removeEventListener("keyup", keyupHandler);
    document.removeEventListener("touchstart", handleTouchStart);
    document.removeEventListener("touchmove", handleTouchMove);
    document.removeEventListener("touchend", handleTouchEnd);
  }

  updatePlayerPosition();

  return destroy;
}
