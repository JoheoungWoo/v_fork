/**
 * DcMotorDynamicsWidget.jsx
 *
 * React Three Fiber(R3F)를 활용하여 직류 전동기의 기계적 부하 시스템(동역학)을
 * 시각화하고, 실시간으로 변화하는 변수들이 운동 방정식에 어떻게 대입되는지
 * 수식 풀이 과정을 함께 보여주는 시뮬레이션 위젯입니다.
 */

import { OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";

const C = {
  bg: "#0f1117",
  surface: "#1a1d27",
  surfaceLight: "#23283b",
  border: "#2a2e3e",
  text: "#e2e0d8",
  muted: "#7a7872",
  accent: "#4facf7",
  success: "#9cffb5",
  danger: "#ff7a7a",
  highlight: "#ffe66d",
};

/**
 * 💡 회전 확인을 위해 표면에 마커(줄무늬)를 추가한 3D 원통 컴포넌트
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
      {/* 본체 */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius, radius, height, radialSegments]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* 회전 마커 */}
      {markers}
      {/* 3D 라벨 (부품 이름) */}
      <Text position={[0, radius + 0.6, 0]} fontSize={0.4} color="white">
        {nameText}
      </Text>
    </group>
  );
}

/**
 * 💡 핵심: 물리 엔진 및 모델 렌더링 (dω/dt 계산)
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

  // 상태 대신 Ref를 사용하여 useFrame 내에서 빠르게 적분 계산
  const omega = useRef(0);
  const angle = useRef(0);

  useFrame((_, dt) => {
    // 1. 발생 토크 (Te)
    const Te = kt * currentI;

    // 2. 마찰 손실 토크 (Tf)
    const Tf = frictionB * omega.current;

    // 3. 알짜 토크 (T_net)
    let netTorque = Te - loadTl - Tf;
    let alpha = 0;

    // 모터가 정지 상태(또는 매우 느린 상태)이고 부하(Tl)를 이길 힘이 없는 경우 기동 실패
    if (omega.current < 0.05 && Te <= loadTl) {
      alpha = 0;
      omega.current = 0;
      netTorque = 0;
    } else {
      // 4. 각가속도 (alpha = T_net / J)
      alpha = netTorque / inertiaJ;

      // 5. 각속도 적분
      omega.current += alpha * dt;

      // (단순화를 위해 부하가 모터를 거꾸로 돌리는 역회전은 없다고 가정)
      if (omega.current < 0) omega.current = 0;
    }

    // 6. 회전 각도 업데이트
    angle.current += omega.current * dt;
    if (systemRef.current) {
      systemRef.current.rotation.x = angle.current;
    }

    // 7. 실시간 풀이 과정 패널 업데이트를 위해 상위 컴포넌트로 값 전달
    setMetrics({
      Te: Te,
      Tf: Tf,
      netTorque: netTorque,
      alpha: alpha,
      omega: omega.current,
      rpm: (omega.current * 30) / Math.PI,
    });
  });

  return (
    <group ref={systemRef}>
      {/* 전동기 측 */}
      <StripedCylinder
        args={[1.0, 2.0, 32]}
        color="#007aff"
        position={[-2, 0, 0]}
        nameText="전동기 (Motor)"
      />

      {/* 연결 축 */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 3, 16]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.8} roughness={0.2} />
      </mesh>
      <Text position={[0, 0.5, 0]} fontSize={0.3} color="#cccccc">
        축 (Shaft)
      </Text>

      {/* 부하 측 */}
      <StripedCylinder
        args={[1.2, 2.0, 32]}
        color="#555555"
        position={[2, 0, 0]}
        nameText="부하 (Load)"
      />
    </group>
  );
}

/**
 * 메인 위젯 컴포넌트
 */
export default function DcMotorDynamicsWidget() {
  // 슬라이더 입력 상태
  const [currentI, setCurrentI] = useState(5.0);
  const [kt, setKt] = useState(1.0);
  const [inertiaJ, setInertiaJ] = useState(2.0);
  const [frictionB, setFrictionB] = useState(0.5);
  const [loadTl, setLoadTl] = useState(2.0);

  // 물리 시뮬레이션에서 계산되어 올라오는 실시간 지표
  const [metrics, setMetrics] = useState({
    Te: 0,
    Tf: 0,
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
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          padding: 12,
          borderBottom: `1px solid ${C.border}`,
          fontWeight: 600,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>직류 전동기 기계적 부하 동역학 시뮬레이션</span>
        <span style={{ fontSize: 13, color: C.muted, fontWeight: "normal" }}>
          T<sub>M</sub> = J(dω/dt) + Bω + T<sub>L</sub>
        </span>
      </div>

      {/* 1. 3D 캔버스 영역 */}
      <div style={{ height: 350 }}>
        <Canvas
          camera={{ position: [0, 4, 8], fov: 50 }}
          shadows
          gl={{ antialias: true }}
        >
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

      {/* 2. 주요 결과 요약 대시보드 */}
      <div
        style={{
          padding: "12px 20px",
          background: "#0a0c10",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          gap: "20px",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: C.muted }}>현재 RPM</div>
          <div style={{ fontSize: 20, fontWeight: "bold", color: C.highlight }}>
            {Math.round(metrics.rpm)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.muted }}>각속도 (ω)</div>
          <div style={{ fontSize: 16, fontWeight: "bold", color: C.highlight }}>
            {metrics.omega.toFixed(2)} rad/s
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
                  ? C.success
                  : metrics.alpha < 0
                    ? C.danger
                    : C.text,
            }}
          >
            {metrics.alpha.toFixed(2)} rad/s²
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.muted }}>발생 토크 (Te)</div>
          <div style={{ fontSize: 16, fontWeight: "bold", color: C.accent }}>
            {metrics.Te.toFixed(2)} Nm
          </div>
        </div>
      </div>

      {/* 3. 컨트롤 패널 (입력 파라미터) */}
      <div
        style={{
          padding: 16,
          background: C.surfaceLight,
          borderBottom: `1px solid ${C.border}`,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
        }}
      >
        {/* 전류 (Ia) */}
        <div>
          <div
            style={{
              marginBottom: 4,
              fontSize: 13,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>
              전기자 전류 (
              <strong style={{ color: C.accent }}>
                I<sub>a</sub>
              </strong>
              )
            </span>
            <strong>{currentI.toFixed(1)} A</strong>
          </div>
          <input
            type="range"
            min="0"
            max="15"
            step="0.5"
            value={currentI}
            onChange={(e) => setCurrentI(Number(e.target.value))}
            style={{ width: "100%", accentColor: C.accent }}
          />
        </div>

        {/* 부하 토크 (Tl) */}
        <div>
          <div
            style={{
              marginBottom: 4,
              fontSize: 13,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>
              부하 토크 (
              <strong style={{ color: C.danger }}>
                T<sub>L</sub>
              </strong>
              )
            </span>
            <strong>{loadTl.toFixed(1)} Nm</strong>
          </div>
          <input
            type="range"
            min="0"
            max="15"
            step="0.5"
            value={loadTl}
            onChange={(e) => setLoadTl(Number(e.target.value))}
            style={{ width: "100%", accentColor: C.danger }}
          />
        </div>

        {/* 관성 (J) */}
        <div>
          <div
            style={{
              marginBottom: 4,
              fontSize: 13,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>
              관성 모멘트 (<strong style={{ color: C.text }}>J</strong>)
            </span>
            <strong>{inertiaJ.toFixed(1)} kg·m²</strong>
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
        </div>

        {/* 마찰 (B) */}
        <div>
          <div
            style={{
              marginBottom: 4,
              fontSize: 13,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>
              마찰 계수 (<strong style={{ color: C.muted }}>B</strong>)
            </span>
            <strong>{frictionB.toFixed(2)} Nm·s/rad</strong>
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
        </div>
      </div>

      {/* 4. 💡 실시간 수식 풀이 과정 (NEW) */}
      <div
        style={{
          padding: 16,
          background: C.surface,
          fontFamily: "monospace",
          fontSize: 14,
          lineHeight: "1.6",
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            fontSize: 13,
            color: C.muted,
            marginBottom: 12,
            borderBottom: `1px solid ${C.border}`,
            paddingBottom: 6,
          }}
        >
          [실시간 운동 방정식 풀이 과정]
        </div>

        <div style={{ marginBottom: 8 }}>
          <span style={{ color: C.muted }}>① 모터 발생 토크 (Te):</span>
          <br />
          &nbsp;&nbsp;T<sub>e</sub> = K<sub>T</sub> ×{" "}
          <span style={{ color: C.accent }}>
            I<sub>a</sub>
          </span>
          <br />
          &nbsp;&nbsp;T<sub>e</sub> = {kt.toFixed(1)} ×{" "}
          <span style={{ color: C.accent }}>{currentI.toFixed(2)}</span> ={" "}
          <strong>{metrics.Te.toFixed(2)} Nm</strong>
        </div>

        <div style={{ marginBottom: 8 }}>
          <span style={{ color: C.muted }}>② 마찰 손실 토크 (Tf):</span>
          <br />
          &nbsp;&nbsp;T<sub>f</sub> = B × ω<br />
          &nbsp;&nbsp;T<sub>f</sub> = {frictionB.toFixed(2)} ×{" "}
          {metrics.omega.toFixed(2)} ={" "}
          <strong>{metrics.Tf.toFixed(2)} Nm</strong>
        </div>

        <div style={{ marginBottom: 8 }}>
          <span style={{ color: C.muted }}>③ 알짜 토크 (T_net = 남은 힘):</span>
          <br />
          &nbsp;&nbsp;T<sub>net</sub> = T<sub>e</sub> -{" "}
          <span style={{ color: C.danger }}>
            T<sub>L</sub>
          </span>{" "}
          - T<sub>f</sub>
          <br />
          &nbsp;&nbsp;T<sub>net</sub> = {metrics.Te.toFixed(2)} -{" "}
          <span style={{ color: C.danger }}>{loadTl.toFixed(2)}</span> -{" "}
          {metrics.Tf.toFixed(2)} ={" "}
          <strong>{metrics.netTorque.toFixed(2)} Nm</strong>
        </div>

        <div>
          <span style={{ color: C.muted }}>④ 가속력 (각가속도 α):</span>
          <br />
          &nbsp;&nbsp;α = T<sub>net</sub> / J<br />
          &nbsp;&nbsp;α = {metrics.netTorque.toFixed(2)} / {inertiaJ.toFixed(2)}{" "}
          ={" "}
          <strong
            style={{
              color:
                metrics.alpha > 0
                  ? C.success
                  : metrics.alpha < 0
                    ? C.danger
                    : C.text,
            }}
          >
            {metrics.alpha.toFixed(3)} rad/s²
          </strong>
        </div>

        {metrics.alpha === 0 &&
          metrics.Te <= loadTl &&
          metrics.omega < 0.05 && (
            <div
              style={{
                marginTop: 8,
                padding: 8,
                background: "rgba(255, 122, 122, 0.1)",
                color: C.danger,
                borderRadius: 4,
                fontSize: 12,
              }}
            >
              ⚠️ 발생 토크(T<sub>e</sub>)가 부하 토크(T<sub>L</sub>)보다 작거나
              같아 모터가 회전할 수 없습니다. 전류를 높이거나 부하를 줄이세요.
            </div>
          )}
      </div>
    </div>
  );
}
