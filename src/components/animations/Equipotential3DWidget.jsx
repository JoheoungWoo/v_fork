import { AreaChart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const Equipotential3DWidget = () => {
  const mountRef = useRef(null);
  const [q1, setQ1] = useState(5); // 전하량
  const [q2, setQ2] = useState(-5);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 15, 20); // 위에서 내려다보는 각도

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 조명
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // 🌟 등전위 지형 (Terrain) 생성 로직
    const nx = 60,
      ny = 60; // 그리드 밀도
    const geometry = new THREE.PlaneGeometry(20, 20, nx, ny);
    geometry.rotateX(-Math.PI / 2); // 바닥에 눕힘

    // 고광택 그라데이션 재질 (높이에 따라 색상 변화 예정)
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      vertexColors: true, // 정점 색상 사용
      wireframe: false,
      flatShading: false,
      roughness: 0.1,
      metalness: 0.2,
      clearcoat: 1.0,
    });

    const terrain = new THREE.Mesh(geometry, material);
    scene.add(terrain);

    // 전하 위치 표시용 구체
    const sphereGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const charge1 = new THREE.Mesh(
      sphereGeo,
      new THREE.MeshBasicMaterial({ color: 0xff0000 }),
    );
    scene.add(charge1);
    const charge2 = new THREE.Mesh(
      sphereGeo,
      new THREE.MeshBasicMaterial({ color: 0x0000ff }),
    );
    scene.add(charge2);

    mountRef.current.sceneObjects = { terrain, geometry, charge1, charge2 };

    const animate = () => {
      requestAnimationFrame(animate);
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
      renderer.dispose();
    };
  }, []);

  // 🌟 전하량 변경 시 3D 지형 실시간 계산 및 색상 업데이트
  useEffect(() => {
    if (!mountRef.current?.sceneObjects) return;
    const { terrain, geometry, charge1, charge2 } =
      mountRef.current.sceneObjects;

    const pos = geometry.attributes.position;
    const colors = [];
    const color = new THREE.Color();

    // 전하 고정 위치 (illustrative)
    const x1 = -4,
      z1 = 0;
    const x2 = 4,
      z2 = 0;
    charge1.position.set(x1, 0, z1);
    charge2.position.set(x2, 0, z2);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // 💡 물리 수식 구현: V = k*Q/r
      const r1 = Math.sqrt(Math.pow(x - x1, 2) + Math.pow(z - z1, 2)) + 0.5; // singularity 방지
      const r2 = Math.sqrt(Math.pow(x - x2, 2) + Math.pow(z - z2, 2)) + 0.5;

      // 전위 합산 (V_total = V1 + V2)
      let v = q1 / r1 + q2 / r2;

      // 시각적 연출을 위해 전위값 제한 및 매핑
      const h = Math.max(-4, Math.min(4, v * 0.8));
      pos.setY(i, h); // 높이값 세팅 (V가 높으면 높게)

      // 🎨 높이에 따른 색상 그라데이션 (양: 빨강, 0: 흰색, 음: 파랑)
      const ratio = (h + 4) / 8; // 0 ~ 1
      color.setHSL(0.66 * (1 - ratio), 1.0, 0.5 + 0.4 * Math.abs(ratio - 0.5)); // 양극단일수록 진하게
      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    pos.needsUpdate = true; // 지형 업데이트
    geometry.computeVertexNormals(); // 조명 계산 다시
  }, [q1, q2]);

  return (
    <div className="relative w-full h-[600px] bg-[#0f172a] rounded-2xl overflow-hidden border border-slate-800 font-sans">
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute top-4 left-4 w-72 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl z-10 space-y-4">
        <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
          <AreaChart className="text-indigo-600" /> 3D 등전위면 지형도
        </h2>
        <div>
          <label className="flex justify-between text-xs font-bold text-red-600 mb-1">
            <span>전하 1 (Q₁)</span> <span>{q1}</span>
          </label>
          <input
            type="range"
            min="-10"
            max="10"
            value={q1}
            onChange={(e) => setQ1(Number(e.target.value))}
            className="w-full accent-red-500"
          />
        </div>
        <div>
          <label className="flex justify-between text-xs font-bold text-blue-600 mb-1">
            <span>전하 2 (Q₂)</span> <span>{q2}</span>
          </label>
          <input
            type="range"
            min="-10"
            max="10"
            value={q2}
            onChange={(e) => setQ2(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
      </div>
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl z-10 w-80 text-center">
        <div className="text-3xl font-serif mb-3 border-b pb-4 w-full justify-center flex items-center gap-2">
          <span className="font-bold text-gray-900">V = </span>
          <div className="flex flex-col items-center justify-center text-xl">
            <span className="border-b border-gray-800 px-2 pb-0.5">1</span>
            <span className="px-2 pt-0.5 italic text-sm">4πε₀</span>
          </div>
          <span className="text-2xl mx-1">·</span>
          <div className="flex flex-col items-center justify-center text-2xl font-bold text-indigo-700">
            <span className="border-b-2 border-indigo-700 px-2 pb-0.5">Q</span>
            <span className="px-2 pt-0.5 italic text-lg text-gray-800">r</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 font-bold mb-2 tracking-tighter">
          전위 공식 (V)
        </p>
        <p className="text-sm bg-indigo-50 text-indigo-900 p-3 rounded-lg font-medium leading-relaxed">
          💡 양전하는 산처럼{" "}
          <span className="text-red-600 font-bold">솟아오르고</span>, 음전하는
          계곡처럼 <span className="text-blue-600 font-bold">깊어집니다.</span>{" "}
          높이가 같은 지점이 등전위면입니다.
        </p>
      </div>
    </div>
  );
};

export default Equipotential3DWidget;
