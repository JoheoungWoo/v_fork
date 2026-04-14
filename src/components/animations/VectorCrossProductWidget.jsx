import { Axis3D, CheckCircle, HelpCircle, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const VectorCrossProductWidget = () => {
  const mountRef = useRef(null);

  // 상태 관리: 탐색 모드 vs 문제 풀이 모드
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [isSolved, setIsSolved] = useState(false);

  // 벡터 상태
  const [vecA, setVecA] = useState({ x: 2, y: 0, z: 0 });
  const [vecB, setVecB] = useState({ x: 0, y: 3, z: 0 });

  // 퀴즈 모드 사용자의 입력값
  const [userAns, setUserAns] = useState({ x: "", y: "", z: "" });

  // 외적 결과 계산 (A x B)
  const crossProduct = {
    x: vecA.y * vecB.z - vecA.z * vecB.y,
    y: vecA.z * vecB.x - vecA.x * vecB.z,
    z: vecA.x * vecB.y - vecA.y * vecB.x,
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Scene 설정
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 2. Camera 설정
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 10, 15);

    // 3. Renderer 설정
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 4. 조명
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // 5. 그리드 및 축 (X: Red, Y: Green, Z: Blue)
    const gridHelper = new THREE.GridHelper(20, 20, 0x334155, 0x1e293b);
    scene.add(gridHelper);
    const axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper);

    // 6. 화살표(벡터) 객체 보관용 그룹
    const vectorGroup = new THREE.Group();
    scene.add(vectorGroup);

    mountRef.current.sceneObjects = { vectorGroup, scene };

    // 애니메이션 루프
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

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
      renderer.dispose();
    };
  }, []);

  // 🌟 벡터 데이터 변경 시 3D 화면 업데이트
  useEffect(() => {
    if (!mountRef.current?.sceneObjects) return;
    const { vectorGroup } = mountRef.current.sceneObjects;

    // 기존 벡터 삭제
    while (vectorGroup.children.length > 0) {
      vectorGroup.remove(vectorGroup.children[0]);
    }

    const origin = new THREE.Vector3(0, 0, 0);
    const dirA = new THREE.Vector3(vecA.x, vecA.y, vecA.z);
    const dirB = new THREE.Vector3(vecB.x, vecB.y, vecB.z);
    const dirC = new THREE.Vector3(
      crossProduct.x,
      crossProduct.y,
      crossProduct.z,
    );

    // 벡터 A 생성 (주황색)
    const lengthA = dirA.length();
    if (lengthA > 0) {
      const arrowA = new THREE.ArrowHelper(
        dirA.clone().normalize(),
        origin,
        lengthA,
        0xf59e0b,
        0.5,
        0.3,
      );
      vectorGroup.add(arrowA);
    }

    // 벡터 B 생성 (파란색)
    const lengthB = dirB.length();
    if (lengthB > 0) {
      const arrowB = new THREE.ArrowHelper(
        dirB.clone().normalize(),
        origin,
        lengthB,
        0x3b82f6,
        0.5,
        0.3,
      );
      vectorGroup.add(arrowB);
    }

    // 결과 벡터 C 생성 (초록색) - 탐색 모드이거나, 퀴즈 모드에서 정답을 맞췄을 때만 표시
    if (!isQuizMode || isSolved) {
      const lengthC = dirC.length();
      if (lengthC > 0) {
        const arrowC = new THREE.ArrowHelper(
          dirC.clone().normalize(),
          origin,
          lengthC,
          0x10b981,
          0.5,
          0.3,
        );
        vectorGroup.add(arrowC);
      }

      // 두 벡터가 이루는 평행사변형 면적 시각화 (반투명)
      if (lengthA > 0 && lengthB > 0) {
        const shapeGeometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([
          0,
          0,
          0,
          vecA.x,
          vecA.y,
          vecA.z,
          vecA.x + vecB.x,
          vecA.y + vecB.y,
          vecA.z + vecB.z,
          0,
          0,
          0,
          vecA.x + vecB.x,
          vecA.y + vecB.y,
          vecA.z + vecB.z,
          vecB.x,
          vecB.y,
          vecB.z,
        ]);
        shapeGeometry.setAttribute(
          "position",
          new THREE.BufferAttribute(vertices, 3),
        );
        const shapeMaterial = new THREE.MeshBasicMaterial({
          color: 0x10b981,
          transparent: true,
          opacity: 0.15,
          side: THREE.DoubleSide,
        });
        const plane = new THREE.Mesh(shapeGeometry, shapeMaterial);
        vectorGroup.add(plane);
      }
    }
  }, [vecA, vecB, isQuizMode, isSolved, crossProduct]);

  // 백엔드 통신을 모사한 랜덤 문제 생성기
  const generateRandomProblem = () => {
    // 실제 구현 시: fetch('/api/math/vector/cross-product') 로 교체
    const randomInt = () => Math.floor(Math.random() * 9) - 4; // -4 ~ 4
    setVecA({ x: randomInt(), y: randomInt(), z: randomInt() });
    setVecB({ x: randomInt(), y: randomInt(), z: randomInt() });
    setUserAns({ x: "", y: "", z: "" });
    setIsSolved(false);
  };

  const handleCheckAnswer = () => {
    if (
      Number(userAns.x) === crossProduct.x &&
      Number(userAns.y) === crossProduct.y &&
      Number(userAns.z) === crossProduct.z
    ) {
      setIsSolved(true);
    } else {
      alert("틀렸습니다. 공식을 다시 확인해보세요!");
    }
  };

  return (
    <div className="relative w-full h-[700px] bg-[#0f172a] rounded-2xl overflow-hidden border border-slate-800 font-sans">
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* 모드 전환 탭 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md p-1 rounded-xl z-20 flex gap-1">
        <button
          onClick={() => {
            setIsQuizMode(false);
            setIsSolved(false);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${!isQuizMode ? "bg-white text-slate-900 shadow-md" : "text-white hover:bg-white/20"}`}
        >
          자유 탐색 모드
        </button>
        <button
          onClick={() => {
            setIsQuizMode(true);
            generateRandomProblem();
          }}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${isQuizMode ? "bg-emerald-500 text-white shadow-md" : "text-white hover:bg-white/20"}`}
        >
          문제 풀이 모드
        </button>
      </div>

      {/* 왼쪽 컨트롤 패널 */}
      <div className="absolute top-20 left-4 w-72 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl z-10 space-y-5">
        <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
          <Axis3D className="text-indigo-600" /> 벡터 A x B 설정
        </h2>

        {/* 벡터 A 컨트롤 */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-amber-600">
            벡터 A (주황색)
          </label>
          <div className="flex gap-2">
            {["x", "y", "z"].map((axis) => (
              <input
                key={`a-${axis}`}
                type="number"
                disabled={isQuizMode}
                value={vecA[axis]}
                onChange={(e) =>
                  setVecA({ ...vecA, [axis]: Number(e.target.value) })
                }
                className="w-full bg-slate-100 text-center border-b-2 border-amber-500 focus:outline-none py-1 font-mono disabled:opacity-50"
              />
            ))}
          </div>
        </div>

        {/* 벡터 B 컨트롤 */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-blue-600">
            벡터 B (파란색)
          </label>
          <div className="flex gap-2">
            {["x", "y", "z"].map((axis) => (
              <input
                key={`b-${axis}`}
                type="number"
                disabled={isQuizMode}
                value={vecB[axis]}
                onChange={(e) =>
                  setVecB({ ...vecB, [axis]: Number(e.target.value) })
                }
                className="w-full bg-slate-100 text-center border-b-2 border-blue-500 focus:outline-none py-1 font-mono disabled:opacity-50"
              />
            ))}
          </div>
        </div>

        {isQuizMode && (
          <button
            onClick={generateRandomProblem}
            className="w-full py-2 bg-indigo-100 text-indigo-700 font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-200 transition"
          >
            <RefreshCw size={16} /> 새로운 문제 생성
          </button>
        )}
      </div>

      {/* 오른쪽 결과/풀이 패널 */}
      <div className="absolute top-20 right-4 bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl z-10 w-[340px]">
        {isQuizMode ? (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
              <HelpCircle className="text-emerald-500" /> 외적을 계산하세요
            </h3>
            <p className="text-sm text-slate-600 font-mono bg-slate-100 p-2 rounded">
              A = ({vecA.x}, {vecA.y}, {vecA.z})<br />B = ({vecB.x}, {vecB.y},{" "}
              {vecB.z})
            </p>
            {!isSolved ? (
              <div className="space-y-3">
                <div className="flex gap-2 items-center">
                  <span className="font-bold text-emerald-600">A x B = </span>
                  {["x", "y", "z"].map((axis) => (
                    <input
                      key={`ans-${axis}`}
                      type="number"
                      placeholder={axis}
                      value={userAns[axis]}
                      onChange={(e) =>
                        setUserAns({ ...userAns, [axis]: e.target.value })
                      }
                      className="w-16 bg-white border border-slate-300 rounded text-center py-1.5 focus:border-emerald-500 outline-none font-mono"
                    />
                  ))}
                </div>
                <button
                  onClick={handleCheckAnswer}
                  className="w-full py-2 bg-emerald-600 text-white font-bold rounded-lg shadow hover:bg-emerald-700 transition"
                >
                  정답 확인
                </button>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 font-bold mb-2">
                  <CheckCircle size={20} /> 정답입니다!
                </div>
                {/* 풀이 과정 렌더링 */}
                <div className="text-xs text-slate-700 space-y-1 font-mono tracking-tight">
                  <p>
                    x = ({vecA.y})×({vecB.z}) - ({vecA.z})×({vecB.y}) ={" "}
                    {crossProduct.x}
                  </p>
                  <p>
                    y = ({vecA.z})×({vecB.x}) - ({vecA.x})×({vecB.z}) ={" "}
                    {crossProduct.y}
                  </p>
                  <p>
                    z = ({vecA.x})×({vecB.y}) - ({vecA.y})×({vecB.x}) ={" "}
                    {crossProduct.z}
                  </p>
                </div>
                <div className="text-center font-bold text-emerald-600 text-lg mt-2">
                  ({crossProduct.x}, {crossProduct.y}, {crossProduct.z})
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-4">
            <h3 className="font-bold text-emerald-600 text-lg border-b pb-3">
              결과 벡터 C (A × B)
            </h3>
            <div className="text-3xl font-mono font-bold text-slate-800 tracking-tighter">
              ({crossProduct.x}, {crossProduct.y}, {crossProduct.z})
            </div>

            <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4 space-y-2">
              <p className="text-xs font-bold text-slate-500 mb-2">
                계산 공식 (행렬식)
              </p>
              <div className="text-sm font-mono text-slate-700 space-y-1">
                <p>Cx = Ay·Bz - Az·By</p>
                <p>Cy = Az·Bx - Ax·Bz</p>
                <p>Cz = Ax·By - Ay·Bx</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-1.5 rounded-full text-xs backdrop-blur-sm pointer-events-none">
        마우스 우클릭으로 이동, 좌클릭 드래그로 회전, 스크롤로 확대/축소하세요.
      </div>
    </div>
  );
};

export default VectorCrossProductWidget;
