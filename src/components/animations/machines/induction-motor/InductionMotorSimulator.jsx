import { Cylinder, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

// 제어 방식별 설명 데이터
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
function MotorModel({ nrSpeed, nsSpeed, poles }) {
  const rotorRef = useRef();
  const fieldRef = useRef();

  useFrame((state, delta) => {
    // 시각적 편의를 위해 스케일을 0.05로 증가 (속도 변화가 더 잘 보이도록)
    if (rotorRef.current) rotorRef.current.rotation.y -= nrSpeed * 0.05 * delta;
    if (fieldRef.current) fieldRef.current.rotation.y -= nsSpeed * 0.05 * delta;
  });

  // 극수(Poles)에 맞춰 N극(빨강), S극(파랑) 조각 생성
  const poleSegments = [];
  const angle = (Math.PI * 2) / poles;
  for (let i = 0; i < poles; i++) {
    const isNorth = i % 2 === 0;
    poleSegments.push(
      <mesh key={i} rotation={[0, i * angle, 0]}>
        {/* 원기둥의 일부만 렌더링하여 호(Arc) 모양 생성 (틈새를 위해 angle * 0.85 적용) */}
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
      {/* 회전 자기장 (동적으로 쪼개진 N/S 극) */}
      <group ref={fieldRef}>{poleSegments}</group>

      {/* 고정자 (Stator) */}
      <Cylinder
        args={[2, 2, 3.8, 32, 1, true]}
        material-color="#64748b"
        material-side={THREE.DoubleSide}
        material-transparent
        material-opacity={0.2}
      />

      {/* 회전자 (Rotor) */}
      <group ref={rotorRef}>
        <Cylinder
          args={[1.8, 1.8, 3.8, 32]}
          material-color="#f59e0b"
          material-metalness={0.6}
          material-roughness={0.4}
        />
        {/* 축 (Shaft) */}
        <Cylinder
          args={[0.3, 0.3, 6, 16]}
          material-color="#cbd5e1"
          material-metalness={0.8}
        />
        {/* 회전 확인용 마커 */}
        <mesh position={[0, 1.9, 1.5]}>
          <boxGeometry args={[0.2, 0.2, 0.5]} />
          <meshStandardMaterial color="#22c55e" />
        </mesh>
      </group>

      <Text
        position={[0, 3.5, 0]}
        fontSize={0.4}
        color="#1e293b"
        anchorX="center"
        anchorY="middle"
      >
        N/S 자극 분할 3D 모델
      </Text>
    </group>
  );
}

export default function InductionMotorSimulator() {
  const [method, setMethod] = useState("pole");

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

  return (
    <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden font-sans border border-slate-200">
      <div className="h-[400px] bg-slate-50 relative">
        <Canvas>
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          {/* 변경점: poles 값을 MotorModel에 전달 */}
          <MotorModel nrSpeed={Nr} nsSpeed={Ns} poles={poles} />
          <OrbitControls enableZoom={false} />
        </Canvas>

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
          <div className="mt-2 text-xs text-slate-500 text-right">
            현재 슬립 (s): {(currentSlip * 100).toFixed(1)}%
          </div>
        </div>
      </div>

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
