import * as THREE from "three";

export function initScene() {
  const canvas = document.getElementById("gameCanvas");
  const renderer = new THREE.WebGLRenderer({ canvas });
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const scene = new THREE.Scene();

  camera.position.set(0, 5, 10);
  camera.lookAt(0, 0, 0);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 10, 7.5).normalize();
  scene.add(directionalLight);

  window.addEventListener("resize", () => onWindowResize(camera, renderer));
  onWindowResize(camera, renderer); // 초기 크기 설정을 위해 호출

  return { scene, camera, renderer };
}

function onWindowResize(camera, renderer) {
  const canvas = renderer.domElement;
  const aspect = window.innerWidth / window.innerHeight;
  const maxAspect = 9 / 16;

  if (aspect > maxAspect) {
    // 가로가 너무 넓은 경우
    const height = window.innerHeight;
    const width = height * maxAspect;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  } else {
    // 세로가 너무 높은 경우
    const width = window.innerWidth;
    const height = width / maxAspect;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }

  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
}

export function animate(scene, camera, renderer, player) {
  function detectCollisions() {
    const playerBox = new THREE.Box3().setFromObject(player);

    scene.children.forEach((child) => {
      if (child !== player && child.geometry && child.material) {
        const obstacleBox = new THREE.Box3().setFromObject(child);
        if (playerBox.intersectsBox(obstacleBox)) {
          console.log("Collision detected!");
          // 충돌 처리 로직
        }
      }
    });
  }

  function render() {
    requestAnimationFrame(render);
    detectCollisions();
    renderer.render(scene, camera);
  }
  render();
}
