import * as THREE from "three";

export function initScene() {
  const canvas = document.getElementById("gameCanvas");
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true, // 안티 앨리어싱 활성화
  });

  renderer.shadowMap.enabled = true; // 그림자 활성화
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 부드러운 그림자

  const aspect = window.innerWidth / window.innerHeight;
  const frustumSize = 10;
  const camera = new THREE.OrthographicCamera(
    (frustumSize * aspect) / -2,
    (frustumSize * aspect) / 2,
    frustumSize / 2,
    frustumSize / -2,
    0.1,
    1000
  );

  const scene = new THREE.Scene();

  camera.position.setFromSphericalCoords(10, -Math.PI / 4, -Math.PI / 6);
  camera.lookAt(0, 0, 0);
  camera.position.x += 2;
  camera.position.z -= 4;

  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 10, -10); // 광원의 위치 조정
  directionalLight.castShadow = true; // 그림자 활성화
  scene.add(directionalLight);
  scene.add(directionalLight.target); // 목표를 장면에 추가

  // 그림자 설정
  directionalLight.shadow.mapSize.width = 1024; // 그림자 맵 해상도 증가
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50; // 그림자 카메라 범위 조정
  directionalLight.shadow.camera.left = -10;
  directionalLight.shadow.camera.right = 10;
  directionalLight.shadow.camera.top = 10;
  directionalLight.shadow.camera.bottom = -10;

  // 바닥 생성
  const floorGeometry = new THREE.PlaneGeometry(100000, 100000);
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xa7c7e7 }); // 파스텔톤 파란색

  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.1; // 바닥이 플레이어 위치보다 아래에 있도록 설정
  floor.castShadow = true;
  floor.receiveShadow = true; // 바닥이 그림자를 받도록 설정
  scene.add(floor);

  window.addEventListener("resize", () => onWindowResize(camera, renderer));
  onWindowResize(camera, renderer); // 초기 크기 설정을 위해 호출

  const destroyScene = (() => {
    window.removeEventListener("resize", onWindowResize);
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }
    while (ambientLight.children.length > 0) {
      ambientLight.remove(ambientLight.children[0]);
    }
    while (directionalLight.children.length > 0) {
      directionalLight.remove(directionalLight.children[0]);
    }
    renderer.dispose();
  }).bind(this);

  return { scene, camera, renderer, directionalLight, destroyScene };
}

function onWindowResize(camera, renderer) {
  const isPortrait = window.innerHeight > window.innerWidth;
  const targetAspect = 9 / 16;
  const frustumSize = 10;

  let width, height;
  if (isPortrait) {
    // 세로 모드: 전체 화면을 채움
    width = window.innerWidth;
    height = window.innerHeight;
  } else {
    // 가로 모드: 9:16 비율 유지
    if (window.innerWidth / window.innerHeight > targetAspect) {
      height = window.innerHeight;
      width = height * targetAspect;
    } else {
      width = window.innerWidth;
      height = width / targetAspect;
    }
  }

  // 카메라 뷰포트 조정
  const aspect = width / height;
  camera.left = (frustumSize * aspect) / -2;
  camera.right = (frustumSize * aspect) / 2;
  camera.top = frustumSize / 2;
  camera.bottom = frustumSize / -2;
  camera.updateProjectionMatrix();

  // 렌더러와 캔버스 크기 조정
  renderer.setSize(width, height);
  const canvas = renderer.domElement;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  // 픽셀 비율 고려
  const pixelRatio = window.devicePixelRatio;
  renderer.setPixelRatio(pixelRatio);
}

export function animate(
  scene,
  camera,
  renderer,
  player,
  directionalLight,
  obstacleController,
  game
) {
  let lastTime = 0;
  let playerSpeed = 0.03; // 초기 속도
  const maxSpeed = 0.03;
  const minSpeed = 0.01;
  const acceleration = 0.0001;
  const deceleration = 0.00005;

  let outOfBoundsTime = 0;
  const outOfBoundsLimit = 1000; // 1초 (밀리초 단위)

  function updatePlayerSpeed(deltaTime, isTouching) {
    if (isTouching) {
      playerSpeed = Math.min(playerSpeed + acceleration * deltaTime, maxSpeed);
    } else {
      playerSpeed = Math.max(playerSpeed - deceleration * deltaTime, minSpeed);
    }
  }

  function isPlayerOutOfBounds(player, camera) {
    const frustum = new THREE.Frustum();
    const matrix = new THREE.Matrix4().multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );
    frustum.setFromProjectionMatrix(matrix);

    const playerPosition = new THREE.Vector3();
    player.getWorldPosition(playerPosition);

    return !frustum.containsPoint(playerPosition);
  }

  function render(currentTime) {
    if (game.isGameOver) return;

    const playerRadius = 0.3; // 플레이어의 대략적인 반경

    requestAnimationFrame(render);

    if (!lastTime) {
      lastTime = currentTime;
      return;
    }

    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    game.updateScore();
    const elapsedTime = game.getElapsedTime();
    obstacleController.update(player.position.z, elapsedTime, camera);

    const nearbyObstacles = obstacleController.getNearbyObstacles(
      player.position.z
    );

    for (const obstacle of nearbyObstacles) {
      const distance = player.position.distanceTo(obstacle.position);
      if (distance < playerRadius + 0.5) {
        game.gameOver();
        return;
      }
    }

    // 플레이어의 터치 상태 확인 (player.js에서 관리하는 상태)
    const isTouching = player.isTouching || false;

    updatePlayerSpeed(deltaTime, isTouching);

    // 플레이어와 카메라 이동
    const moveDistance = playerSpeed * deltaTime;
    player.position.z -= moveDistance;
    camera.position.z -= moveDistance;

    // 광원 위치 업데이트
    directionalLight.position.set(
      player.position.x,
      player.position.y + 10,
      player.position.z - 10
    );
    directionalLight.target.position.set(
      player.position.x,
      player.position.y,
      player.position.z
    );

    // 플레이어가 카메라 밖에 있는지 확인
    if (isPlayerOutOfBounds(player, camera)) {
      outOfBoundsTime += deltaTime;
      if (outOfBoundsTime >= outOfBoundsLimit) {
        console.log("Player out of bounds for too long!");
        game.gameOver("Out of bounds");
        return;
      }
    } else {
      outOfBoundsTime = 0;
    }

    renderer.render(scene, camera);
  }

  requestAnimationFrame(render);
}
