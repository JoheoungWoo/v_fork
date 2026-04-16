import { Cone, Line, OrbitControls, Sphere, Text } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import * as THREE from "three";

// 전하 입자 렌더링 컴포넌트
function Particle({ position, color, label }) {
  return (
    <group position={position}>
      <Sphere args={[0.4, 32, 32]}>
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
      </Sphere>
      <Text
        position={[0, 0.7, 0]}
        fontSize={0.25}
        color="white"
        outlineWidth={0.02}
        outlineColor="#0f172a"
      >
        {label}
      </Text>
    </group>
  );
}

// 힘의 크기와 방향을 나타내는 3D 화살표 컴포넌트
function ForceArrow({ start, direction, forceMagnitude, color }) {
  // 시각적 한계를 위해 화살표 길이 스케일링 및 제한
  const visualLength = Math.min(Math.max(forceMagnitude * 0.5, 0.5), 3);
  const vecDir = new THREE.Vector3(...direction);

  // 화살표가 입자 표면에서 시작되도록 오프셋 적용
  const offset = vecDir.clone().multiplyScalar(0.5);
  const startPos = new THREE.Vector3(...start).add(offset);
  const endPos = startPos
    .clone()
    .add(vecDir.clone().multiplyScalar(visualLength));

  // 화살촉 회전 계산
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0), // ConeGeometry 기본 방향 (Up)
    vecDir,
  );

  return (
    <group>
      <Line
        points={[startPos.toArray(), endPos.toArray()]}
        color={color}
        lineWidth={4}
      />
      <Cone
        args={[0.15, 0.4, 16]}
        position={endPos.toArray()}
        quaternion={quaternion}
      >
        <meshBasicMaterial color={color} />
      </Cone>
    </group>
  );
}

export default function Coulomb3DWidget({
  initialQ1 = 3,
  initialQ2 = -2,
  initialR = 2,
}) {
  const [q1, setQ1] = useState(initialQ1);
  const [q2, setQ2] = useState(initialQ2);
  const [r, setR] = useState(initialR);

  // 물리량 계산
  // 실제 힘 F = k * (|q1 * q2| / r^2). 여기서는 비례 시각화를 위해 계수 생략
  const forceMagnitude = Math.abs(q1 * q2) / (r * r);
  const isAttraction = q1 * q2 < 0;
  const isRepulsion = q1 * q2 > 0;

  // 상태별 색상 (양전하: 빨강, 음전하: 파랑, 중성: 회색)
  const getColor = (q) => (q > 0 ? "#ef4444" : q < 0 ? "#3b82f6" : "#94a3b8");

  // 3D 공간상의 입자 위치 (원점을 기준으로 양옆으로 r/2 만큼 배치)
  const pos1 = [-r / 2, 0, 0];
  const pos2 = [r / 2, 0, 0];

  return (
    <div className="w-full flex flex-col bg-slate-900 rounded-xl overflow-hidden font-sans border border-slate-700">
      {/* 1. 3D 시각화 영역 */}
      <div className="w-full h-[350px] relative">
        <Canvas camera={{ position: [0, 2, 6], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 2 + 0.2}
          />

          {/* 중앙 거리 표시 선 */}
          <Line
            points={[pos1, pos2]}
            color="#64748b"
            lineWidth={2}
            dashed
            dashSize={0.2}
            gapSize={0.1}
          />
          <Text position={[0, -0.6, 0]} fontSize={0.3} color="#94a3b8">
            r = {r}m
          </Text>

          {/* 두 전하 입자 */}
          <Particle
            position={pos1}
            color={getColor(q1)}
            label={`q1: ${q1 > 0 ? "+" + q1 : q1}μC`}
          />
          <Particle
            position={pos2}
            color={getColor(q2)}
            label={`q2: ${q2 > 0 ? "+" + q2 : q2}μC`}
          />

          {/* 힘 화살표 (전하량이 0이 아닐 때만 렌더링) */}
          {forceMagnitude > 0 && (
            <>
              <ForceArrow
                start={pos1}
                direction={isAttraction ? [1, 0, 0] : [-1, 0, 0]} // 인력이면 우측, 척력이면 좌측
                forceMagnitude={forceMagnitude}
                color={getColor(q1)}
              />
              <ForceArrow
                start={pos2}
                direction={isAttraction ? [-1, 0, 0] : [1, 0, 0]} // 인력이면 좌측, 척력이면 우측
                forceMagnitude={forceMagnitude}
                color={getColor(q2)}
              />
            </>
          )}
        </Canvas>

        {/* 오버레이 상태 패널 */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md p-4 rounded-lg border border-slate-600">
          <div className="text-sm text-slate-300 mb-1">
            상대적 힘의 크기 (F)
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {forceMagnitude.toFixed(2)} N
          </div>
          <div className="text-xs text-slate-400 mt-1">
            상태:{" "}
            {isAttraction
              ? "인력 (서로 당김)"
              : isRepulsion
                ? "척력 (서로 밀어냄)"
                : "힘 없음"}
          </div>
        </div>
      </div>

      {/* 2. 조작 컨트롤 패널 */}
      <div className="p-6 bg-slate-800">
        <h4 className="text-white font-bold mb-4 flex items-center justify-between">
          <span>변수 조절 패널</span>
          <span className="text-xs font-normal text-slate-400 bg-slate-700 px-2 py-1 rounded">
            F ∝ |q₁·q₂| / r²
          </span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* q1 슬라이더 */}
          <div className="bg-slate-700 p-4 rounded-lg">
            <label className="flex justify-between text-sm text-slate-300 mb-2 font-bold">
              <span>전하 1 (q₁)</span>
              <span
                className={
                  q1 > 0
                    ? "text-red-400"
                    : q1 < 0
                      ? "text-blue-400"
                      : "text-slate-400"
                }
              >
                {q1 > 0 ? "+" + q1 : q1} μC
              </span>
            </label>
            <input
              type="range"
              min="-5"
              max="5"
              value={q1}
              onChange={(e) => setQ1(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* q2 슬라이더 */}
          <div className="bg-slate-700 p-4 rounded-lg">
            <label className="flex justify-between text-sm text-slate-300 mb-2 font-bold">
              <span>전하 2 (q₂)</span>
              <span
                className={
                  q2 > 0
                    ? "text-red-400"
                    : q2 < 0
                      ? "text-blue-400"
                      : "text-slate-400"
                }
              >
                {q2 > 0 ? "+" + q2 : q2} μC
              </span>
            </label>
            <input
              type="range"
              min="-5"
              max="5"
              value={q2}
              onChange={(e) => setQ2(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* r 슬라이더 */}
          <div className="bg-slate-700 p-4 rounded-lg border border-amber-500/30">
            <label className="flex justify-between text-sm text-amber-200 mb-2 font-bold">
              <span>거리 (r)</span>
              <span>{r} m</span>
            </label>
            <input
              type="range"
              min="1"
              max="6"
              step="0.5"
              value={r}
              onChange={(e) => setR(Number(e.target.value))}
              className="w-full accent-amber-400"
            />
            <p className="text-[10px] text-amber-400/70 mt-2 leading-tight">
              * 거리를 2배로 늘리면 힘은 1/4로 줄어듭니다 (역제곱 법칙).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
