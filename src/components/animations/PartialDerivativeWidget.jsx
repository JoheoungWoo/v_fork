import { Activity } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const PartialDerivativeWidget = () => {
  const mountRef = useRef(null);
  const [sliceX, setSliceX] = useState(2); // X=2 고정 (슬라이스 평면 위치)
  const [pointY, setPointY] = useState(0); // Y 지점 (접선을 그릴 위치)

  // 3차원 함수 정의 (z = x^2 - y^2 형태의 말안장 곡면, 시각화를 위해 스케일 조정)
  const calculateZ = (x, y) => (Math.pow(x, 2) - Math.pow(y, 2)) * 0.2;

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // slate-900
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 카메라 설정
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 12, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);

    // 조명 설정
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // 축 도우미 (X: Red, Y: Green, Z: Blue)
    const axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper);

    // 🌟 1. 3D 곡면(Surface) 생성
    const gridSize = 10;
    const segments = 40;
    const geometry = new THREE.PlaneGeometry(
      gridSize,
      gridSize,
      segments,
      segments,
    );

    // PlaneGeometry의 꼭짓점의 Z값을 함수에 맞게 변형
    const posAttribute = geometry.attributes.position;
    for (let i = 0; i < posAttribute.count; i++) {
      const x = posAttribute.getX(i);
      const y = posAttribute.getY(i);
      const z = calculateZ(x, y);
      posAttribute.setZ(i, z);
    }
    geometry.computeVertexNormals();

    // 곡면 매트리얼 (양면 렌더링, 약간 투명하게)
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x3b82f6, // blue-500
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
      wireframe: false,
      roughness: 0.4,
    });

    // Three.js는 Y가 위쪽이므로, Plane을 눕힙니다 (X-Z 평면이 수학적 X-Y 평면이 되도록)
    const surface = new THREE.Mesh(geometry, material);
    surface.rotation.x = -Math.PI / 2;
    scene.add(surface);

    // 🌟 2. 잘라내는 평면 (Slicing Plane: X = C)
    const planeGeo = new THREE.PlaneGeometry(gridSize, gridSize * 2);
    const planeMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b, // amber-500
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3,
      depthWrite: false, // 다른 객체 위에 예쁘게 렌더링되도록
    });
    const slicePlane = new THREE.Mesh(planeGeo, planeMat);
    slicePlane.rotation.y = Math.PI / 2; // X축과 수직이 되도록 회전
    scene.add(slicePlane);

    // 🌟 3. 교선 (Intersection Curve)
    const curveMat = new THREE.LineBasicMaterial({
      color: 0xff0000,
      linewidth: 3,
    });
    let curveLine = new THREE.Line(new THREE.BufferGeometry(), curveMat);
    scene.add(curveLine);

    // 🌟 4. 접점 및 접선 (Tangent Line)
    const pointGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const pointMat = new THREE.MeshBasicMaterial({ color: 0x10b981 }); // emerald-500
    const tangentPoint = new THREE.Mesh(pointGeo, pointMat);
    scene.add(tangentPoint);

    const tangentMat = new THREE.LineBasicMaterial({
      color: 0x10b981,
      linewidth: 4,
    });
    let tangentLine = new THREE.Line(new THREE.BufferGeometry(), tangentMat);
    scene.add(tangentLine);

    // 객체들을 ref에 저장하여 업데이트 시 접근
    mountRef.current.sceneObjects = {
      slicePlane,
      curveLine,
      tangentPoint,
      tangentLine,
    };

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 리사이즈 처리
    const resizeObserver = new ResizeObserver(() => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    resizeObserver.observe(mountRef.current);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // 🌟 State(X, Y) 변경 시 기하학 업데이트
  useEffect(() => {
    if (!mountRef.current?.sceneObjects) return;
    const { slicePlane, curveLine, tangentPoint, tangentLine } =
      mountRef.current.sceneObjects;

    // 1. 슬라이스 평면 위치 업데이트 (수학적 X축은 Three.js 씬에서 X축)
    slicePlane.position.x = sliceX;

    // 2. 교선 업데이트 (X=sliceX 로 고정된 곡선 그리기)
    const curvePoints = [];
    for (let i = -5; i <= 5; i += 0.1) {
      // Three.js 좌표계: x = 수학적x, y = 수학적z, z = -수학적y
      // 수학적으로 z = calculateZ(sliceX, y)
      // 코딩 매핑: Three.X = sliceX, Three.Z = y, Three.Y = z
      curvePoints.push(new THREE.Vector3(sliceX, calculateZ(sliceX, i), -i));
    }
    curveLine.geometry.dispose();
    curveLine.geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);

    // 3. 접점 위치 업데이트
    const mathZ = calculateZ(sliceX, pointY);
    tangentPoint.position.set(sliceX, mathZ, -pointY);

    // 4. 접선 업데이트 (편미분 값 적용)
    // z = (x^2 - y^2) * 0.2 이므로, y에 대한 편미분 dz/dy = -2y * 0.2 = -0.4 * y
    const slopeY = -0.4 * pointY;

    // 접선의 방향 벡터 (X는 고정이므로 0, Y는 1 변할 때 Z는 slopeY 변함)
    // Three.js 맵핑: Three.X 변화량 0, Three.Z 변화량 -1(수학적 y 1증가), Three.Y 변화량 slopeY
    const tangentDir = new THREE.Vector3(0, slopeY, -1).normalize();

    const tangentLength = 4;
    const p1 = tangentPoint.position
      .clone()
      .add(tangentDir.clone().multiplyScalar(-tangentLength / 2));
    const p2 = tangentPoint.position
      .clone()
      .add(tangentDir.clone().multiplyScalar(tangentLength / 2));

    tangentLine.geometry.dispose();
    tangentLine.geometry = new THREE.BufferGeometry().setFromPoints([p1, p2]);
  }, [sliceX, pointY]);

  // 화면에 표시할 실제 편미분 값 (기울기)
  const currentSlope = (-0.4 * pointY).toFixed(2);

  return (
    <div className="relative w-full h-[600px] bg-[#0f172a] rounded-2xl overflow-hidden border border-slate-800 font-sans">
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* 왼쪽 컨트롤 패널 */}
      <div className="absolute top-4 left-4 w-72 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl z-10 space-y-4">
        <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
          <Activity className="text-blue-600" /> 편미분 시각화
        </h2>

        <div>
          <label className="flex justify-between text-xs font-bold text-gray-600 mb-1">
            <span>고정할 평면 위치 (X)</span>
            <span className="text-amber-600">X = {sliceX}</span>
          </label>
          <input
            type="range"
            min="-5"
            max="5"
            step="0.1"
            value={sliceX}
            onChange={(e) => setSliceX(Number(e.target.value))}
            className="w-full h-1.5 accent-amber-500"
          />
          <p className="text-[10px] text-gray-500 mt-1">
            이 값을 조절하여 곡면을 싹둑 자릅니다 (Slicing).
          </p>
        </div>

        <div>
          <label className="flex justify-between text-xs font-bold text-gray-600 mb-1">
            <span>단면에서의 위치 (Y)</span>
            <span className="text-emerald-600">Y = {pointY}</span>
          </label>
          <input
            type="range"
            min="-5"
            max="5"
            step="0.1"
            value={pointY}
            onChange={(e) => setPointY(Number(e.target.value))}
            className="w-full h-1.5 accent-emerald-500"
          />
        </div>
      </div>

      {/* 오른쪽 결과 패널 */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl z-10 w-80 text-center">
        <p className="text-sm font-bold text-gray-500 mb-2 border-b pb-2">
          편미분 계산 결과
        </p>
        <div className="text-3xl font-serif mb-4 flex items-center justify-center gap-2">
          <div className="flex flex-col items-center justify-center">
            <span className="border-b-2 border-black px-1 pb-0.5">∂z</span>
            <span className="px-1 pt-0.5">∂y</span>
          </div>
          <span>=</span>
          <span className="font-bold text-emerald-600">{currentSlope}</span>
        </div>

        <div className="text-left text-sm bg-slate-50 text-slate-900 p-3 rounded-lg font-medium leading-relaxed shadow-inner">
          <p>
            <span className="text-amber-600 font-bold">X={sliceX}</span>로
            고정했을 때 생성된 빨간색 교선 위에서,
          </p>
          <p className="mt-2">
            초록색 점(
            <span className="text-emerald-600 font-bold">Y={pointY}</span>)이
            가리키는 <b>접선의 기울기</b>가 바로 편미분 값입니다.
          </p>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-1.5 rounded-full text-[10px] backdrop-blur-sm pointer-events-none">
        마우스로 드래그하여 3차원 공간을 회전해 보세요.
      </div>
    </div>
  );
};

export default PartialDerivativeWidget;
