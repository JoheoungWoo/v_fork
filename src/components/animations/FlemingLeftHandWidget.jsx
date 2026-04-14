import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const FlemingLeftHandWidget = () => {
  const mountRef = useRef(null);
  const [bField, setBField] = useState(1.5); // 자속밀도 (T)
  const [current, setCurrent] = useState(2.0); // 전류 (A)
  const [length, setLength] = useState(0.5); // 도체 길이 (m)

  // 힘 계산: F = B * I * L (90도 가정)
  const force = (bField * current * length).toFixed(2);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(8, 8, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 조명 세팅
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(10, 10, 10);
    scene.add(dirLight);

    // 바닥 그리드
    const grid = new THREE.GridHelper(15, 30, 0x334155, 0x1e293b);
    scene.add(grid);

    // --- 벡터 화살표 생성 (F, B, I) ---
    // 1. 전류 (I) - X축 (Blue)
    const dirI = new THREE.Vector3(1, 0, 0);
    const arrowI = new THREE.ArrowHelper(
      dirI,
      new THREE.Vector3(0, 0, 0),
      3,
      0x3b82f6,
      1,
      0.5,
    );
    scene.add(arrowI);

    // 2. 자속밀도 (B) - Z축 (Green)
    const dirB = new THREE.Vector3(0, 0, 1);
    const arrowB = new THREE.ArrowHelper(
      dirB,
      new THREE.Vector3(0, 0, 0),
      3,
      0x10b981,
      1,
      0.5,
    );
    scene.add(arrowB);

    // 3. 힘 (F) - Y축 (Red)
    const dirF = new THREE.Vector3(0, 1, 0);
    const arrowF = new THREE.ArrowHelper(
      dirF,
      new THREE.Vector3(0, 0, 0),
      3,
      0xef4444,
      1,
      0.5,
    );
    scene.add(arrowF);

    // 도체 (Wire) 표현
    const wireGeo = new THREE.CylinderGeometry(0.1, 0.1, 10, 32);
    const wireMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    wire.rotation.z = Math.PI / 2;
    scene.add(wire);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize 대응
    const resizeObserver = new ResizeObserver(() => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    resizeObserver.observe(mountRef.current);

    mountRef.current.arrows = { arrowI, arrowB, arrowF };

    return () => {
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []);

  // 데이터 변경 시 화살표 길이 업데이트
  useEffect(() => {
    if (!mountRef.current?.arrows) return;
    const { arrowI, arrowB, arrowF } = mountRef.current.arrows;

    arrowI.setLength(1 + current, 1, 0.5);
    arrowB.setLength(1 + bField, 1, 0.5);
    arrowF.setLength(1 + bField * current * length, 1, 0.5);
  }, [bField, current, length]);

  return (
    <div className="relative w-full h-[600px] bg-[#0f172a] rounded-2xl overflow-hidden border border-slate-800 font-sans">
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* 왼쪽 컨트롤 패널 */}
      <div className="absolute top-4 left-4 w-72 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl z-10 space-y-4">
        <h2 className="text-lg font-black text-gray-800 border-b pb-2">
          👋 플레밍의 왼손 법칙
        </h2>

        <div>
          <label className="flex justify-between text-xs font-bold text-blue-600 mb-1">
            <span>전류 (I)</span> <span>{current} A</span>
          </label>
          <input
            type="range"
            min="0.5"
            max="4"
            step="0.1"
            value={current}
            onChange={(e) => setCurrent(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>

        <div>
          <label className="flex justify-between text-xs font-bold text-green-600 mb-1">
            <span>자속밀도 (B)</span> <span>{bField} T</span>
          </label>
          <input
            type="range"
            min="0.5"
            max="4"
            step="0.1"
            value={bField}
            onChange={(e) => setBField(Number(e.target.value))}
            className="w-full accent-green-500"
          />
        </div>

        <div>
          <label className="flex justify-between text-xs font-bold text-slate-600 mb-1">
            <span>도체 길이 (l)</span> <span>{length} m</span>
          </label>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-slate-500"
          />
        </div>
      </div>

      {/* 오른쪽 결과 패널 (거대 수식) */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl z-10 w-80 text-center">
        <div className="text-2xl font-serif mb-4 flex items-center justify-center gap-2 border-b pb-4">
          <span className="font-bold text-red-600">F</span> =
          <span className="text-green-600">B</span>
          <span className="text-blue-600">I</span>
          <span className="text-slate-600">l</span>
          <span className="text-sm ml-1 text-gray-400">sinθ</span>
        </div>

        <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-tighter">
          Generated Force (Newton)
        </p>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-6xl font-black text-gray-900">{force}</span>
          <span className="text-xl font-bold text-gray-400">N</span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-1">
          <div className="text-[10px] bg-blue-50 text-blue-700 p-1 rounded font-bold">
            중지: 전류
          </div>
          <div className="text-[10px] bg-green-50 text-green-700 p-1 rounded font-bold">
            검지: 자기장
          </div>
          <div className="text-[10px] bg-red-50 text-red-700 p-1 rounded font-bold">
            엄지: 힘
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-1.5 rounded-full text-[10px] backdrop-blur-sm pointer-events-none">
        마우스 드래그로 회전하며 FBI의 수직 관계를 확인하세요
      </div>
    </div>
  );
};

export default FlemingLeftHandWidget;
