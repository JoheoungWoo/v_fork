import { Magnet } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const AmpereLawWidget = () => {
  const mountRef = useRef(null);
  const [current, setCurrent] = useState(2); // 전류 방향 및 크기 (+/-)
  const [turns, setTurns] = useState(10); // 코일 감은 횟수

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(10, 8, 10);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);

    // 조명
    scene.add(new THREE.AmbientLight(0xffffff, 1.0));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // 🌟 3D 솔레노이드 코일 생성
    const coilGeo = new THREE.TorusGeometry(2, 0.1, 16, 100);
    const coilMat = new THREE.MeshPhysicalMaterial({
      color: 0xb7791f,
      metalness: 1.0,
      roughness: 0.3,
    }); // 구리색
    const coils = [];

    // 코일 업데이트용 그룹
    const coilGroup = new THREE.Group();
    scene.add(coilGroup);

    // 🌟 자기장 파티클 (B-Field Flow) 생성
    const particleCount = 200;
    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
      // 솔레노이드 내부/외부에 골고루 배치
      positions[i * 3] = (Math.random() - 0.5) * 12; // X (길이방향)
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4; // Y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4; // Z
      velocities.push(0); // 초기 속도
    }
    particlesGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );

    const particlesMat = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.1,
      transparent: true,
      opacity: 0.8,
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);

    mountRef.current.sceneObjects = {
      coilGroup,
      coilGeo,
      coilMat,
      particlesGeo,
      velocities,
    };

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // 🌟 파티클 애니메이션 (자기장 흐름)
      const pos = particlesGeo.attributes.position;
      const velArr = velocities;
      const bDirection = current > 0 ? 1 : -1; // 전류 방향에 따른 자기장 방향
      const speedFactor = Math.abs(current) * (turns / 10) * 0.02; // 전계 세기 비례 속도

      for (let i = 0; i < particleCount; i++) {
        let px = pos.getX(i);
        let py = pos.getY(i);
        let pz = pos.getZ(i);

        // 💡 물리 모델링: 솔레노이드 내부(r < 코일반지름)는 직선, 외부는 도는 궤적
        const radiusSq = py * py + pz * pz;
        const coilLenHalf = turns * 0.25;

        if (Math.abs(px) < coilLenHalf && radiusSq < 4) {
          // 내부: 강한 직선 자계
          px += 0.2 * bDirection * speedFactor * 2;
        } else {
          // 외부: 약한 회귀 자계 (illustrative)
          px -= 0.1 * bDirection * speedFactor;
          // 리턴 궤적 연출을 위해 y, z값을 중심축방향으로 살짝 당김
          py *= 0.99;
          pz *= 0.99;
        }

        // 경계 조건 (무한 루프처럼 보이게)
        if (px > 6) px = -6;
        if (px < -6) px = 6;
        if (Math.abs(px) > 5.8) {
          // 끝단에서 외부로 퍼지는 연출
          py += (Math.random() - 0.5) * 0.2;
          pz += (Math.random() - 0.5) * 0.2;
        }

        pos.setXYZ(i, px, py, pz);
      }
      pos.needsUpdate = true; // 파티클 업데이트

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

  // 🌟 State 변경 시 솔레노이드 코일 갯수 업데이트
  useEffect(() => {
    if (!mountRef.current?.sceneObjects) return;
    const { coilGroup, coilGeo, coilMat } = mountRef.current.sceneObjects;

    // 기존 코일 삭제
    while (coilGroup.children.length > 0) {
      coilGroup.remove(coilGroup.children[0]);
    }

    // N번 감은 코일 새로 생성 및 배치
    for (let i = 0; i < turns; i++) {
      const mesh = new THREE.Mesh(coilGeo, coilMat);
      mesh.rotation.y = Math.PI / 2;
      // 코일 간격 조절 (x축 방향 배치)
      mesh.position.x = (i - turns / 2) * 0.5;
      coilGroup.add(mesh);
    }
  }, [turns]);

  return (
    <div className="relative w-full h-[600px] bg-[#0f172a] rounded-2xl overflow-hidden border border-slate-800 font-sans">
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* 왼쪽 컨트롤 패널 */}
      <div className="absolute top-4 left-4 w-72 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl z-10 space-y-4">
        <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
          <Magnet className="text-emerald-600" /> 솔레노이드 자기장 실습
        </h2>
        <div>
          <label className="flex justify-between text-xs font-bold text-gray-600 mb-1">
            <span>전류 방향/크기 (I)</span>{" "}
            <span className={current > 0 ? "text-red-600" : "text-blue-600"}>
              {current > 0 ? "N극 ⬅" : "N극 ➡"} ({current})
            </span>
          </label>
          <input
            type="range"
            min="-5"
            max="5"
            step="0.1"
            value={current}
            onChange={(e) => setCurrent(Number(e.target.value))}
            className="w-full h-1.5 accent-slate-800"
          />
        </div>
        <div>
          <label className="flex justify-between text-xs font-bold text-amber-800 mb-1">
            <span>코일 감은 횟수 (N)</span> <span>{turns} 회</span>
          </label>
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={turns}
            onChange={(e) => setTurns(Number(e.target.value))}
            className="w-full h-1.5 accent-amber-600"
          />
        </div>
      </div>

      {/* 오른쪽 결과 패널 (거대 수식) */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl z-10 w-80 text-center">
        <div className="text-3xl font-serif mb-3 border-b pb-4 w-full justify-center flex items-center gap-2">
          <span className="font-bold text-cyan-700">B</span> =
          <span className="italic text-gray-600">μ₀</span>
          <span className="text-2xl mx-1">·</span>
          <div className="flex flex-col items-center justify-center text-3xl font-bold text-amber-800">
            <span className="border-b-2 border-amber-800 px-2 pb-0.5">N</span>
            <span className="px-2 pt-0.5 italic text-lg text-gray-800">l</span>
          </div>
          <span className="text-2xl mx-1">·</span>
          <span className="italic text-3xl text-red-600 font-bold">I</span>
        </div>

        <p className="text-xs font-bold text-gray-400 mb-2 tracking-tighter">
          솔레노이드 내부 자기장 식 (B)
        </p>
        <p className="text-sm bg-slate-50 text-slate-900 p-3 rounded-lg font-medium leading-relaxed">
          💡 코일을 <span className="font-bold">많이 감을수록(N)</span>,{" "}
          <span className="text-red-600 font-bold">전류(I)가 강할수록</span>{" "}
          내부 자기장(<span className="text-cyan-700 font-bold">B</span>, 하늘색
          파티클 흐름)은 더 강하고 밀집됩니다.
        </p>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-1.5 rounded-full text-[10px] backdrop-blur-sm pointer-events-none">
        마우스 조작으로 회전/줌하여 입체적인 자력선 흐름을 관찰하세요. (하늘색
        점 = 자기장)
      </div>
    </div>
  );
};

export default AmpereLawWidget;
