import { RotateCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const DcRectificationWidget = () => {
  const mountRef = useRef(null);
  const [speed, setSpeed] = useState(1); // 회전 속도

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // 다크 배경

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(10, 8, 15); // 구조가 잘 보이는 각도

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 🌟 고광택 조명 세팅
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // 공간감 그리드
    const grid = new THREE.GridHelper(20, 40, 0x334155, 0x1e293b);
    grid.position.y = -4;
    scene.add(grid);

    // --- DC기 핵심 구조물 생성 ---
    const metalMat = new THREE.MeshPhysicalMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.2,
      clearcoat: 1.0,
    });
    const copperMat = new THREE.MeshPhysicalMaterial({
      color: 0xb7791f,
      metalness: 1.0,
      roughness: 0.3,
    }); // 구리 색상

    // 1. 회전 축 (Shaft)
    const shaftGeo = new THREE.CylinderGeometry(0.2, 0.2, 12, 32);
    const shaft = new THREE.Mesh(shaftGeo, metalMat);
    shaft.rotation.z = Math.PI / 2;
    scene.add(shaft);

    // 2. 🌟 정류자편 (Commutator) - 쪼개진 링
    const commutatorGroup = new THREE.Group();
    const segGeo = new THREE.CylinderGeometry(
      1,
      1,
      2,
      32,
      1,
      false,
      0,
      Math.PI * 0.95,
    ); // 살짝 틈을 둠

    const seg1 = new THREE.Mesh(segGeo, copperMat);
    seg1.rotation.z = Math.PI / 2;
    commutatorGroup.add(seg1);

    const seg2 = new THREE.Mesh(segGeo, copperMat);
    seg2.rotation.z = Math.PI / 2;
    seg2.rotation.x = Math.PI; // 반대편에 배치
    commutatorGroup.add(seg2);

    commutatorGroup.position.x = 3;
    scene.add(commutatorGroup);

    // 3. 전기자 코일 (Armature Coil)
    const coilGroup = new THREE.Group();
    const wireGeo = new THREE.CylinderGeometry(0.05, 0.05, 4, 16);
    const wireMat = new THREE.MeshStandardMaterial({ color: 0xffffff });

    for (let i = 0; i < 2; i++) {
      const wire = new THREE.Mesh(wireGeo, wireMat);
      wire.position.z = i === 0 ? 1 : -1;
      wire.rotation.x = Math.PI / 2;
      coilGroup.add(wire);
    }
    const connectGeo = new THREE.CylinderGeometry(0.05, 0.05, 2, 16);
    const connect = new THREE.Mesh(connectGeo, wireMat);
    connect.position.y = 2;
    coilGroup.add(connect);

    coilGroup.position.x = -1;
    scene.add(coilGroup);

    // 코일과 정류자 연결선
    const linkGeo = new THREE.CylinderGeometry(0.05, 0.05, 3, 16);
    const link1 = new THREE.Mesh(linkGeo, wireMat);
    link1.rotation.z = Math.PI / 2;
    link1.position.x = 1.5;
    link1.position.z = 1;
    scene.add(link1);
    const link2 = new THREE.Mesh(linkGeo, wireMat);
    link2.rotation.z = Math.PI / 2;
    link2.position.x = 1.5;
    link2.position.z = -1;
    scene.add(link2);

    // 4. 고정된 브러시 (Brushes)
    const brushMat = new THREE.MeshStandardMaterial({ color: 0x111111 }); // 탄소 브러시색
    const brushGeo = new THREE.BoxGeometry(0.5, 1, 0.5);

    const brushTop = new THREE.Mesh(brushGeo, brushMat);
    brushTop.position.set(3, 1.2, 0); // 정류자 위쪽에 고정
    scene.add(brushTop);

    const brushBottom = new THREE.Mesh(brushGeo, brushMat);
    brushBottom.position.set(3, -1.2, 0); // 정류자 아래쪽에 고정
    scene.add(brushBottom);

    // 5. 애니메이션 (회전 로직)
    let animationFrameId;
    let angle = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const rpm = speed * 0.01;
      angle += rpm;

      // 축, 코일, 정류자, 연결선 함께 회전
      shaft.rotation.y = angle;
      coilGroup.rotation.x = angle;
      commutatorGroup.rotation.x = angle;
      link1.rotation.x = angle;
      link2.rotation.x = angle;

      // 💡 정류자편과 브러시가 만나는 순간 색상 변화 (정류 시각화)
      const currentSegment = Math.sin(angle) > 0 ? seg1 : seg2;
      currentSegment.material.emissive.setHex(0xffaa00);
      currentSegment.material.emissiveIntensity = 0.5;

      const otherSegment = Math.sin(angle) > 0 ? seg2 : seg1;
      otherSegment.material.emissive.setHex(0x000000);

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // ResizeObserver (스크롤 방지)
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
  }, [speed]);

  return (
    <div className="relative w-full h-[600px] bg-[#0f172a] rounded-2xl overflow-hidden border border-slate-800 font-sans">
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* 왼쪽 컨트롤 패널 */}
      <div className="absolute top-4 left-4 w-72 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl z-10 space-y-4">
        <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
          <RotateCw className="text-bronze-600" /> DC기 정류 프로세스
        </h2>
        <div>
          <label className="flex justify-between text-xs font-bold text-slate-600 mb-1">
            <span>회전 속도 (RPM)</span> <span>{(speed * 100).toFixed(0)}</span>
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full accent-bronze-500"
          />
        </div>
      </div>

      {/* 오른쪽 결과 패널 (거대 수식) */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl z-10 w-80 text-center">
        <div className="text-2xl font-serif mb-3 border-b pb-3 flex items-center justify-center gap-2">
          <span className="font-bold text-gray-900">
            E<sub>dc</sub> ={" "}
          </span>
          <div className="flex flex-col items-center justify-center text-xl">
            <span className="border-b border-gray-800 px-2 pb-0.5">p·Z</span>
            <span className="px-2 pt-0.5 italic">60·a</span>
          </div>
          <span className="text-2xl mx-1">·</span>
          <span className="italic text-purple-700">Φ</span>
          <span className="italic text-blue-700">N</span>
        </div>

        <p className="text-xs font-bold text-gray-400 mb-2uppercase tracking-tighter">
          유도기전력 식 (DC)
        </p>
        <div className="bg-gray-50 p-3 rounded-lg border text-sm text-left text-gray-600 space-y-1">
          <p>
            💡 <span className="font-bold text-gray-800">정류자</span>: 회전하는
            코일의 <span className="text-amber-700 font-bold">AC</span>를{" "}
            <span className="text-blue-700 font-bold">DC</span>로 바꿈
          </p>
          <p>
            💡 <span className="font-bold text-gray-800">브러시</span>:
            정류자로부터 전기를 <span className="font-bold">외부로 인출</span>
          </p>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-1.5 rounded-full text-[10px] backdrop-blur-sm pointer-events-none">
        마우스로 돌려보며 브러시와 정류자가 만나는 순간을 관찰하세요.
      </div>
    </div>
  );
};

export default DcRectificationWidget;
