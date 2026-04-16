import { Cylinder, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const CONTROL_METHODS = {
  vf: {
    title: "주파수 (V/f) 제어",
    desc: "인버터를 사용하여 주파수와 전압을 비례하게 제어합니다. 자속을 일정하게 유지하면서 동기 속도(Ns) 자체를 연속적으로 바꿀 수 있어 가장 널리 쓰입니다.",
  },
  pole: {
    title: "극수 변환 제어",
    desc: "고정자 권선의 접속을 변경하여 극수(P)를 바꿉니다. 자기장이 쪼개지면서 회전 속도가 계단식으로 변합니다.",
  },
  voltage: {
    title: "상전압 제어",
    desc: "주파수는 고정하고 고정자 전압만 낮춥니다. 토크가 전압의 제곱에 비례하여 감소하므로 슬립이 증가하여 속도가 떨어집니다.",
  },
  resistance: {
    title: "회전자 저항 제어",
    desc: "권선형 유도기에서 슬립링을 통해 회전자 회로에 외부 저항을 추가합니다. 비례추이 원리를 이용하여 속도를 제어합니다.",
  },
};

// 3D 모터 컴포넌트
function MotorModel({ nrSpeed, nsSpeed, poles, isPlaying }) {
  const rotorRef = useRef();
  const fieldRef = useRef();

  useFrame((state, delta) => {
    // isPlaying이 false면 회전을 멈춤 (Return)
    if (!isPlaying) return;

    if (rotorRef.current) rotorRef.current.rotation.y -= nrSpeed * 0.05 * delta;
    if (fieldRef.current) fieldRef.current.rotation.y -= nsSpeed * 0.05 * delta;
  });

  const poleSegments = [];
  const angle = (Math.PI * 2) / poles;
  for (let i = 0; i < poles; i++) {
    const isNorth = i % 2 === 0;
    poleSegments.push(
      <mesh key={i} rotation={[0, i * angle, 0]}>
        <cylinderGeometry
          args={[2.1, 2.1, 3.9, 16, 1, true, 0, angle * 0.85]}
        />
        <meshStandardMaterial
          color={isNorth ? "#ef4444" : "#3b82f6"}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>,
    );
  }

  return (
    <group rotation={[Math.PI / 8, -Math.PI / 6, 0]}>
      <group ref={fieldRef}>{poleSegments}</group>
      <Cylinder
        args={[2, 2, 3.8, 32, 1, true]}
        material-color="#64748b"
        material-side={THREE.DoubleSide}
        material-transparent
        material-opacity={0.2}
      />
      <group ref={rotorRef}>
        <Cylinder
          args={[1.8, 1.8, 3.8, 32]}
          material-color="#f59e0b"
          material-metalness={0.6}
          material-roughness={0.4}
        />
        <Cylinder
          args={[0.3, 0.3, 6, 16]}
          material-color="#cbd5e1"
          material-metalness={0.8}
        />
        <mesh position={[0, 1.9, 1.5]}>
          <boxGeometry args={[0.2, 0.2, 0.5]} />
          <meshStandardMaterial color="#22c55e" />
        </mesh>
      </group>
    </group>
  );
}

export default function InductionMotorSimulator() {
  const [method, setMethod] = useState("pole");
  const [isPlaying, setIsPlaying] = useState(true); // 재생 상태

  const [frequency, setFrequency] = useState(60);
  const [poles, setPoles] = useState(4);
  const [voltage, setVoltage] = useState(100);
  const [resistance, setResistance] = useState(0);

  const Ns = (120 * frequency) / poles;
  let baseSlip = 0.03;
  let currentSlip = baseSlip;

  if (method === "voltage") {
    const vRatio = voltage / 100;
    currentSlip = baseSlip / (vRatio * vRatio + 0.01);
  } else if (method === "resistance") {
    currentSlip = baseSlip * (1 + resistance * 2);
  } else if (method === "vf") {
    currentSlip = baseSlip;
  }
  currentSlip = Math.min(currentSlip, 0.99);
  const Nr = Math.max(0, Ns * (1 - currentSlip));

  // 스페이스바 이벤트 리스너 등록
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 입력창 등에서 스페이스바를 누를 때는 제외
      if (e.code === "Space" && e.target.tagName !== "INPUT") {
        e.preventDefault(); // 스페이스바로 인한 스크롤 방지
        setIsPlaying((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden font-sans border border-slate-200">
      <div className="h-[400px] bg-slate-50 relative">
        <Canvas>
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <MotorModel
            nrSpeed={Nr}
            nsSpeed={Ns}
            poles={poles}
            isPlaying={isPlaying}
          />
          <OrbitControls enableZoom={false} />
        </Canvas>

        {/* 재생/일시정지 버튼 */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute top-4 left-4 bg-white/90 hover:bg-white text-slate-800 px-4 py-2 rounded-lg font-bold shadow-md transition-colors flex items-center gap-2"
        >
          {isPlaying ? "⏸ 일시정지 (Space)" : "▶ 재생 (Space)"}
        </button>

        <div className="absolute top-4 right-4 bg-black/80 text-white p-4 rounded-xl backdrop-blur-sm border border-slate-700">
          <div className="mb-2">
            <span className="text-slate-400 text-sm">동기 속도 (Ns): </span>
            <span className="text-blue-400 font-mono text-xl font-bold">
              {Math.round(Ns)} RPM
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-sm">실제 속도 (Nr): </span>
            <span className="text-amber-400 font-mono text-xl font-bold">
              {Math.round(Nr)} RPM
            </span>
          </div>
        </div>

        {/* ⏸ 일시정지 시 나타나는 상태 표시 모달 (Modal) */}
        {!isPlaying && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 transform scale-100 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800">
                  ⏸ 시뮬레이션 일시정지
                </h3>
              </div>

              <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">제어 방식</span>
                  <span className="text-slate-800 font-bold">
                    {CONTROL_METHODS[method].title}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">
                    현재 극수 (P)
                  </span>
                  <span className="text-blue-600 font-bold">
                    {poles}극 (N/S {poles}분할)
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">
                    입력 주파수 (f)
                  </span>
                  <span className="text-slate-800 font-bold">
                    {frequency} Hz
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">
                    동기 속도 (Ns)
                  </span>
                  <span className="text-blue-600 font-bold">
                    {Math.round(Ns)} RPM
                  </span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-slate-500 font-medium">
                    현재 슬립 (s)
                  </span>
                  <span className="text-amber-500 font-bold">
                    {(currentSlip * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsPlaying(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md"
              >
                ▶ 계속하기
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 하단 컨트롤 영역 (기존과 동일하므로 생략 없이 포함) */}
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-4">
          {Object.entries(CONTROL_METHODS).map(([key, data]) => (
            <button
              key={key}
              onClick={() => setMethod(key)}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                method === key
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {data.title}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              {CONTROL_METHODS[method].title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed bg-blue-50 p-4 rounded-lg border border-blue-100">
              {CONTROL_METHODS[method].desc}
            </p>
          </div>

          <div className="flex flex-col justify-center gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
            {method === "vf" && (
              <div>
                <label className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                  <span>입력 주파수 (f)</span>
                  <span className="text-blue-600">{frequency} Hz</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="120"
                  value={frequency}
                  onChange={(e) => setFrequency(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>
            )}
            {method === "pole" && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  모터 극수 (P)
                </label>
                <div className="flex gap-2">
                  {[2, 4, 6, 8].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPoles(p)}
                      className={`flex-1 py-2 rounded font-bold border ${poles === p ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-300"}`}
                    >
                      {p}극
                    </button>
                  ))}
                </div>
              </div>
            )}
            {method === "voltage" && (
              <div>
                <label className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                  <span>고정자 인가 전압 (V)</span>
                  <span className="text-blue-600">{voltage}%</span>
                </label>
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={voltage}
                  onChange={(e) => setVoltage(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>
            )}
            {method === "resistance" && (
              <div>
                <label className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                  <span>외부 추가 저항 (R)</span>
                  <span className="text-blue-600">+{resistance} R</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={resistance}
                  onChange={(e) => setResistance(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
