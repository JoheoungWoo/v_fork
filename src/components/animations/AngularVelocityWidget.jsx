import { Activity, Pause, Play, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const AngularVelocityWidget = () => {
  const mountRef = useRef(null);
  const [frequency, setFrequency] = useState(0.5); // 주파수 (Hz)
  const [isPlaying, setIsPlaying] = useState(true);

  // 실시간 데이터 표시용 상태
  const [sensorData, setSensorData] = useState({
    theta: "0.00",
    omega: "3.14",
    cos: "1.00",
    sin: "0.00",
  });

  // 애니메이션 제어용 Ref
  const timeRef = useRef(0);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene, Camera, Renderer 셋업
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // slate-900
    // 카메라 위치를 회전 궤도와 각속도 벡터가 잘 보이도록 조정
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(5, 4, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 2. 조명 및 축/그리드
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    const axesHelper = new THREE.AxesHelper(4);
    scene.add(axesHelper);
    const gridHelper = new THREE.GridHelper(10, 10, 0x334155, 0x1e293b);
    gridHelper.rotation.x = Math.PI / 2; // XY 평면에 그리드 배치
    scene.add(gridHelper);

    // 3. 3D 오브젝트 생성
    const RADIUS = 3;

    // 3.1 기준 원 궤도 (XY 평면)
    const circleGeo = new THREE.RingGeometry(RADIUS - 0.02, RADIUS + 0.02, 64);
    const circleMat = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      side: THREE.DoubleSide,
    });
    const orbit = new THREE.Mesh(circleGeo, circleMat);
    scene.add(orbit);

    // 3.2 회전하는 파티클 (질점)
    const particleGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const particleMat = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      metalness: 0.5,
      roughness: 0.2,
    });
    const particle = new THREE.Mesh(particleGeo, particleMat);
    scene.add(particle);

    // 3.3 벡터 화살표 (위치 벡터 및 투영 벡터)
    const origin = new THREE.Vector3(0, 0, 0);
    const posArrow = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      origin,
      RADIUS,
      0xf59e0b,
      0.3,
      0.2,
    );
    const cosArrow = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      origin,
      RADIUS,
      0xef4444,
      0.3,
      0.2,
    );
    const sinArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0),
      origin,
      RADIUS,
      0x3b82f6,
      0.3,
      0.2,
    );

    // [추가] 각속도(Omega) 벡터 화살표 - 물리학의 오른손 법칙에 따라 Z축으로 표시
    const omegaArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, 1),
      origin,
      1,
      0xa855f7,
      0.4,
      0.3,
    );

    scene.add(posArrow);
    scene.add(cosArrow);
    scene.add(sinArrow);
    scene.add(omegaArrow);

    // 4. 애니메이션 루프
    const clock = new THREE.Clock();
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (mountRef.current?.isPlaying) {
        timeRef.current += delta;
        const t = timeRef.current;
        const f = mountRef.current?.frequency || 0.5;

        // 핵심 물리 공식: ω = 2πf, θ = ωt
        const omega = 2 * Math.PI * f;
        const theta = omega * t;

        // 원운동 위치 계산
        const x = Math.cos(theta);
        const y = Math.sin(theta);
        const posX = x * RADIUS;
        const posY = y * RADIUS;

        // 파티클 업데이트
        particle.position.set(posX, posY, 0);

        // 벡터 화살표 업데이트
        posArrow.setDirection(new THREE.Vector3(x, y, 0).normalize());

        if (Math.abs(x) > 0.001) {
          cosArrow.setDirection(new THREE.Vector3(Math.sign(x), 0, 0));
          cosArrow.setLength(Math.abs(posX), 0.2, 0.1);
          cosArrow.visible = true;
        } else {
          cosArrow.visible = false;
        }

        if (Math.abs(y) > 0.001) {
          sinArrow.setDirection(new THREE.Vector3(0, Math.sign(y), 0));
          sinArrow.setLength(Math.abs(posY), 0.2, 0.1);
          sinArrow.visible = true;
        } else {
          sinArrow.visible = false;
        }

        // [추가] 각속도 벡터 길이 업데이트 (주파수에 비례하여 Z축으로 커짐)
        omegaArrow.setLength(f * 2.5, 0.4, 0.3);

        // UI 데이터 업데이트 (최적화)
        if (Math.floor(t * 60) % 5 === 0) {
          setSensorData({
            theta: (theta % (2 * Math.PI)).toFixed(2),
            omega: omega.toFixed(2),
            cos: x.toFixed(2),
            sin: y.toFixed(2),
          });
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 리사이즈 옵저버
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

  useEffect(() => {
    if (mountRef.current) {
      mountRef.current.frequency = frequency;
      mountRef.current.isPlaying = isPlaying;
    }
  }, [frequency, isPlaying]);

  return (
    <div className="relative w-full h-[700px] bg-[#0f172a] rounded-2xl overflow-hidden border border-slate-800 font-sans shadow-2xl">
      <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full cursor-move"
      />

      {/* 좌측 상단: 컨트롤 패널 */}
      <div className="absolute top-4 left-4 w-72 bg-slate-900/80 backdrop-blur-md border border-slate-700 p-5 rounded-2xl shadow-2xl z-10 space-y-5 text-slate-200">
        <h2 className="text-lg font-black text-white flex items-center gap-2 border-b border-slate-700 pb-3">
          <Settings className="text-emerald-400" /> 각도와 각속도 벡터
        </h2>

        {/* 주파수 슬라이더 */}
        <div className="space-y-2">
          <label className="flex justify-between text-xs font-bold text-slate-400 mb-1">
            <span>
              주파수 (Frequency, <span className="italic">f</span>)
            </span>
            <span className="text-emerald-400 text-sm">
              {frequency.toFixed(1)} Hz
            </span>
          </label>
          <input
            type="range"
            min="0.1"
            max="2.0"
            step="0.1"
            value={frequency}
            onChange={(e) => setFrequency(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <p className="text-[10px] text-slate-500 text-right">
            초당 회전 횟수
          </p>
        </div>

        <div className="flex gap-2 pt-2 border-t border-slate-700">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
              isPlaying
                ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
            }`}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? "일시정지" : "재생"}
          </button>
        </div>
      </div>

      {/* 우측 상단: 라이브 데이터 패널 */}
      <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md border border-slate-700 p-5 rounded-2xl shadow-2xl z-10 w-64 space-y-4">
        <h3 className="font-bold text-slate-300 flex items-center gap-2 text-sm border-b border-slate-700 pb-2">
          <Activity size={16} className="text-blue-400" /> 실시간 회전 데이터
        </h3>

        <div className="space-y-3 font-mono text-sm">
          {/* 각속도 (Omega) */}
          <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded border border-purple-900/30">
            <span className="text-slate-400">각속도 벡터 (Z축)</span>
            <span className="font-bold text-purple-400">
              {sensorData.omega}
            </span>
          </div>

          {/* 현재 각도 (Theta) */}
          <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded border border-amber-900/30">
            <span className="text-slate-400">
              각도 (<span className="italic text-amber-400">θ = ωt</span>)
            </span>
            <span className="font-bold text-amber-400">
              {sensorData.theta} <span className="text-[10px]">rad</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            {/* X 성분 (Cos) */}
            <div className="bg-red-900/20 border border-red-900/50 p-2 rounded flex flex-col items-center">
              <span className="text-xs text-red-400 font-sans mb-1">
                X 투영 (Cos)
              </span>
              <span className="font-bold text-red-400">{sensorData.cos}</span>
            </div>

            {/* Y 성분 (Sin) */}
            <div className="bg-blue-900/20 border border-blue-900/50 p-2 rounded flex flex-col items-center">
              <span className="text-xs text-blue-400 font-sans mb-1">
                Y 투영 (Sin)
              </span>
              <span className="font-bold text-blue-400">{sensorData.sin}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 설명 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/60 border border-slate-700 text-slate-300 px-6 py-2 rounded-full text-xs backdrop-blur-md pointer-events-none text-center shadow-lg">
        마우스로 화면을 드래그하여 시점을 3D로 회전해 보세요. XY 평면의{" "}
        <span className="text-amber-400 font-bold">각도(위치) 벡터</span>와 Z축
        방향의 <span className="text-purple-400 font-bold">각속도 벡터</span>를
        관찰할 수 있습니다.
      </div>
    </div>
  );
};

export default AngularVelocityWidget;
