import { OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";

const C = {
  bg: "#0f1117",
  surface: "#1a1d27",
  border: "#2a2e3e",
  text: "#e2e0d8",
  muted: "#7a7872",
};

/**
 * 💡 회전하는 물체를 뚜렷하게 볼 수 있도록 원통 표면에 줄무늬(마커)를 추가한 컴포넌트
 */
function StripedCylinder({ args, color, position, nameText }) {
  const [radius, height, radialSegments] = args;
  const markerCount = 8;
  const markers = [];

  for (let i = 0; i < markerCount; i++) {
    const angle = (i / markerCount) * Math.PI * 2;
    markers.push(
      <mesh
        key={i}
        position={[
          0,
          Math.cos(angle) * (radius + 0.02),
          Math.sin(angle) * (radius + 0.02),
        ]}
        rotation={[angle, 0, 0]}
      >
        <boxGeometry args={[height + 0.05, 0.05, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>,
    );
  }

  return (
    <group position={position}>
      {/* 본체 원통 */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius, radius, height, radialSegments]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* 회전 확인용 마커 */}
      {markers}
      {/* 텍스트 라벨 */}
      <Text position={[0, radius + 0.5, 0]} fontSize={0.4} color="white">
        {nameText}
      </Text>
    </group>
  );
}

/**
 * 💡 물리 엔진 및 3D 렌더링을 담당하는 핵심 컴포넌트
 */
function DynamicsSimulation({
  currentI,
  kt,
  inertiaJ,
  frictionB,
  loadTl,
  setMetrics,
}) {
  const systemRef = useRef(null);

  // 상태 저장을 위한 Ref (useFrame 내부에서 빠른 계산을 위해 state 대신 ref 사용)
  const omega = useRef(0); // 각속도 (rad/s)
  const angle = useRef(0); // 현재 회전 각도 (rad)

  useFrame((_, dt) => {
    // 1. 발생 토크 계산 (Te = Kt * Ia)
    const Te = kt * currentI;

    // 2. 알짜 토크 계산 (T_net = Te - Tl - B*omega)
    let netTorque = Te - loadTl - frictionB * omega.current;
    let alpha = 0; // 각가속도

    // 3. 정지 상태에서 부하 토크(Tl)를 이길 수 없는 경우 (기동 불가)
    if (omega.current < 0.05 && Te <= loadTl) {
      alpha = 0;
      omega.current = 0;
      netTorque = 0;
    } else {
      // 4. 운동 방정식 적용 (알짜 토크 = 관성 * 각가속도 -> alpha = T_net / J)
      alpha = netTorque / inertiaJ;

      // 5. 각속도 적분 (omega = omega + alpha * dt)
      omega.current += alpha * dt;

      // 단순화를 위해 부하에 의해 역회전하는 것은 막음
      if (omega.current < 0) omega.current = 0;
    }

    // 6. 각도 적분 및 3D 모델에 적용
    angle.current += omega.current * dt;
    if (systemRef.current) {
      systemRef.current.rotation.x = angle.current;
    }

    // 7. UI 업데이트를 위해 상위 컴포넌트로 데이터 전송 (과도한 렌더링 방지를 위해 가끔씩만 업데이트해도 되지만 부드러움을 위해 전달)
    setMetrics({
      Te: Te,
      netTorque: netTorque,
      alpha: alpha,
      omega: omega.current,
      rpm: (omega.current * 30) / Math.PI,
    });
  });

  return (
    <group ref={systemRef}>
      {/* 전동기 (Motor) - 파란색 */}
      <StripedCylinder
        args={[1.0, 2.0, 32]}
        color="#007aff"
        position={[-2, 0, 0]}
        nameText="전동기 (Motor)"
      />

      {/* 축 (Shaft) - 은색 */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 3, 16]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.8} roughness={0.2} />
      </mesh>
      <Text position={[0, 0.5, 0]} fontSize={0.3} color="#cccccc">
        커플링 축
      </Text>

      {/* 부하 (Load) - 회색 */}
      <StripedCylinder
        args={[1.2, 2.0, 32]}
        color="#555555"
        position={[2, 0, 0]}
        nameText="부하 (Load)"
      />
    </group>
  );
}

export default function DcCoilMotorAssemblyWidget() {
  // 물리 파라미터 상태
  const [currentI, setCurrentI] = useState(5.0); // 전기자 전류 (A)
  const [kt, setKt] = useState(1.0); // 토크 상수 (Nm/A)
  const [inertiaJ, setInertiaJ] = useState(2.0); // 관성 모멘트 J (kg·m^2)
  const [frictionB, setFrictionB] = useState(0.5); // 마찰 계수 B (Nm·s/rad)
  const [loadTl, setLoadTl] = useState(2.0); // 부하 토크 Tl (Nm)

  // 실시간 계산 결과 출력용 상태
  const [metrics, setMetrics] = useState({
    Te: 0,
    netTorque: 0,
    alpha: 0,
    omega: 0,
    rpm: 0,
  });

  return (
    <div
      style={{
        background: C.bg,
        color: C.text,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        overflow: "hidden",
        fontFamily: "Segoe UI,sans-serif",
      }}
    >
      <div
        style={{
          padding: 12,
          borderBottom: `1px solid ${C.border}`,
          fontWeight: 600,
        }}
      >
        직류 전동기 기계적 부하 시스템 (동역학 시뮬레이션)
      </div>

      {/* 3D 캔버스 영역 */}
      <div style={{ height: 400 }}>
        <Canvas camera={{ position: [0, 4, 8], fov: 50 }} shadows>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
          <OrbitControls target={[0, 0, 0]} minDistance={3} maxDistance={20} />
          <Suspense fallback={null}>
            <DynamicsSimulation
              currentI={currentI}
              kt={kt}
              inertiaJ={inertiaJ}
              frictionB={frictionB}
              loadTl={loadTl}
              setMetrics={setMetrics}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* 실시간 대시보드 영역 */}
      <div
        style={{
          padding: "12px",
          background: "#0a0c10",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          gap: "20px",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: C.muted }}>발생 토크 (Te)</div>
          <div style={{ fontSize: 16, fontWeight: "bold", color: "#4facf7" }}>
            {metrics.Te.toFixed(2)} Nm
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.muted }}>각가속도 (α)</div>
          <div
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color:
                metrics.alpha > 0
                  ? "#9cffb5"
                  : metrics.alpha < 0
                    ? "#ff7a7a"
                    : C.text,
            }}
          >
            {metrics.alpha.toFixed(2)} rad/s²
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.muted }}>회전 속도 (ω)</div>
          <div style={{ fontSize: 16, fontWeight: "bold", color: "#ffe66d" }}>
            {metrics.omega.toFixed(2)} rad/s
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.muted }}>RPM</div>
          <div style={{ fontSize: 16, fontWeight: "bold", color: "#ffe66d" }}>
            {Math.round(metrics.rpm)}
          </div>
        </div>
      </div>

      {/* 컨트롤 패널 영역 */}
      <div
        style={{
          padding: 16,
          background: C.surface,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
        }}
      >
        {/* 전류 조절 */}
        <div>
          <div style={{ marginBottom: 4, fontSize: 13 }}>
            전기자 전류 (Ia): <strong>{currentI.toFixed(1)} A</strong>
          </div>
          <input
            type="range"
            min="0"
            max="15"
            step="0.5"
            value={currentI}
            onChange={(e) => setCurrentI(Number(e.target.value))}
            style={{ width: "100%" }}
          />
          <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
            모터의 힘을 결정 (Te = Kt * Ia)
          </div>
        </div>

        {/* 부하 토크 조절 */}
        <div>
          <div style={{ marginBottom: 4, fontSize: 13 }}>
            부하 토크 (Tl): <strong>{loadTl.toFixed(1)} Nm</strong>
          </div>
          <input
            type="range"
            min="0"
            max="15"
            step="0.5"
            value={loadTl}
            onChange={(e) => setLoadTl(Number(e.target.value))}
            style={{ width: "100%" }}
          />
          <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
            모터가 끌어야 하는 무게/저항
          </div>
        </div>

        {/* 관성 조절 */}
        <div>
          <div style={{ marginBottom: 4, fontSize: 13 }}>
            관성 모멘트 (J): <strong>{inertiaJ.toFixed(1)} kg·m²</strong>
          </div>
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.5"
            value={inertiaJ}
            onChange={(e) => setInertiaJ(Number(e.target.value))}
            style={{ width: "100%" }}
          />
          <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
            가속/감속 시 둔감한 정도 (무거울수록 늦게 돔)
          </div>
        </div>

        {/* 마찰 조절 */}
        <div>
          <div style={{ marginBottom: 4, fontSize: 13 }}>
            마찰 계수 (B): <strong>{frictionB.toFixed(2)} Nm·s/rad</strong>
          </div>
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={frictionB}
            onChange={(e) => setFrictionB(Number(e.target.value))}
            style={{ width: "100%" }}
          />
          <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
            속도에 비례하여 깎아먹는 저항 (B * ω)
          </div>
        </div>
      </div>
    </div>
  );
}
