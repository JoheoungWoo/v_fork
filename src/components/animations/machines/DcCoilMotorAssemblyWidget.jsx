/**
 * DcMotorDynamicsWidget.jsx
 *
 * 직류 전동기 동역학 시뮬레이션 (라이트 테마 + LaTeX 수식 렌더링 적용)
 */

import { OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";

// 💡 LaTeX 렌더링을 위한 패키지 임포트
import "katex/dist/katex.min.css";
import { BlockMath, InlineMath } from "react-katex";

const C = {
  bg: "#ffffff",
  surface: "#f8f9fa",
  surfaceLight: "#ffffff",
  border: "#dee2e6",
  text: "#212529",
  muted: "#6c757d",
  accent: "#0d6efd", // Ia (파란색)
  success: "#198754", // 알파 양수 (초록색)
  danger: "#dc3545", // Tl (빨간색)
  highlight: "#fd7e14", // 오렌지색
};

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
        <meshStandardMaterial color="#ffffff" emissive="#dddddd" />
      </mesh>,
    );
  }

  return (
    <group position={position}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius, radius, height, radialSegments]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.7} />
      </mesh>
      {markers}
      <Text
        position={[0, radius + 0.6, 0]}
        fontSize={0.4}
        color="#343a40"
        fontWeight="bold"
      >
        {nameText}
      </Text>
    </group>
  );
}

function DynamicsSimulation({
  currentI,
  kt,
  inertiaJ,
  frictionB,
  loadTl,
  setMetrics,
}) {
  const systemRef = useRef(null);
  const omega = useRef(0);
  const angle = useRef(0);

  useFrame((_, dt) => {
    const Te = kt * currentI;
    const Tf = frictionB * omega.current;
    let netTorque = Te - loadTl - Tf;
    let alpha = 0;

    if (omega.current < 0.05 && Te <= loadTl) {
      alpha = 0;
      omega.current = 0;
      netTorque = 0;
    } else {
      alpha = netTorque / inertiaJ;
      omega.current += alpha * dt;
      if (omega.current < 0) omega.current = 0;
    }

    angle.current += omega.current * dt;
    if (systemRef.current) {
      systemRef.current.rotation.x = angle.current;
    }

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
      <StripedCylinder
        args={[1.0, 2.0, 32]}
        color="#4dabf7"
        position={[-2, 0, 0]}
        nameText="전동기 (Motor)"
      />

      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 3, 16]} />
        <meshStandardMaterial color="#cccccc" metalness={0.4} roughness={0.5} />
      </mesh>
      <Text position={[0, 0.5, 0]} fontSize={0.3} color="#495057">
        축 (Shaft)
      </Text>

      <StripedCylinder
        args={[1.2, 2.0, 32]}
        color="#adb5bd"
        position={[2, 0, 0]}
        nameText="부하 (Load)"
      />
    </group>
  );
}

export default function DcMotorDynamicsWidget() {
  const [currentI, setCurrentI] = useState(5.0);
  const [kt, setKt] = useState(1.0);
  const [inertiaJ, setInertiaJ] = useState(2.0);
  const [frictionB, setFrictionB] = useState(0.5);
  const [loadTl, setLoadTl] = useState(2.0);

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
      <div
        style={{
          padding: 12,
          background: C.surface,
          borderBottom: `1px solid ${C.border}`,
          fontWeight: 600,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>직류 전동기 기계적 부하 동역학 시뮬레이션</span>
        {/* 💡 헤더에 LaTeX 수식 적용 */}
        <span style={{ fontSize: 14, color: C.muted, fontWeight: "normal" }}>
          <InlineMath math="T_M = J \frac{d\omega_m}{dt} + B\omega_m + T_L" />
        </span>
      </div>

      <div style={{ height: 350 }}>
        <Canvas
          camera={{ position: [0, 4, 8], fov: 50 }}
          shadows
          gl={{ antialias: true }}
        >
          <color attach="background" args={["#f1f3f5"]} />
          <ambientLight intensity={1.8} />
          <directionalLight
            position={[10, 15, 10]}
            intensity={1.5}
            castShadow
          />
          <directionalLight position={[-10, -5, -10]} intensity={0.5} />

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

      <div
        style={{
          padding: "16px 20px",
          background: C.surfaceLight,
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          gap: "20px",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>
            현재 RPM
          </div>
          <div style={{ fontSize: 22, fontWeight: "bold", color: C.highlight }}>
            {Math.round(metrics.rpm)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>
            각속도 (ω)
          </div>
          <div style={{ fontSize: 18, fontWeight: "bold", color: C.highlight }}>
            {metrics.omega.toFixed(2)}{" "}
            <span style={{ fontSize: 12, fontWeight: "normal" }}>rad/s</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>
            각가속도 (α)
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color:
                metrics.alpha > 0
                  ? C.success
                  : metrics.alpha < 0
                    ? C.danger
                    : C.text,
            }}
          >
            {metrics.alpha.toFixed(2)}{" "}
            <span style={{ fontSize: 12, fontWeight: "normal" }}>rad/s²</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>
            발생 토크 (Te)
          </div>
          <div style={{ fontSize: 18, fontWeight: "bold", color: C.accent }}>
            {metrics.Te.toFixed(2)}{" "}
            <span style={{ fontSize: 12, fontWeight: "normal" }}>Nm</span>
          </div>
        </div>
      </div>

      <div
        style={{
          padding: 20,
          background: C.bg,
          borderBottom: `1px solid ${C.border}`,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}
      >
        <div>
          <div
            style={{
              marginBottom: 8,
              fontSize: 14,
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
        <div>
          <div
            style={{
              marginBottom: 8,
              fontSize: 14,
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
        <div>
          <div
            style={{
              marginBottom: 8,
              fontSize: 14,
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
        <div>
          <div
            style={{
              marginBottom: 8,
              fontSize: 14,
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

      {/* 💡 완전히 LaTeX로 렌더링된 실시간 수식 풀이 과정 */}
      <div
        style={{
          padding: "20px 24px",
          background: C.surface,
          fontSize: 15,
          lineHeight: "1.8",
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            fontSize: 14,
            color: C.text,
            marginBottom: 12,
            borderBottom: `2px solid ${C.border}`,
            paddingBottom: 8,
          }}
        >
          📝 실시간 운동 방정식 풀이 과정
        </div>

        <div style={{ marginBottom: 16 }}>
          <span style={{ color: C.muted, fontWeight: "bold", fontSize: 13 }}>
            ① 모터 발생 토크 (Te):
          </span>
          <BlockMath
            math={`T_e = K_T \\cdot \\color{${C.accent}}{I_a} = ${kt.toFixed(1)} \\cdot \\color{${C.accent}}{${currentI.toFixed(2)}} = \\mathbf{${metrics.Te.toFixed(2)} \\text{ Nm}}`}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <span style={{ color: C.muted, fontWeight: "bold", fontSize: 13 }}>
            ② 마찰 손실 토크 (Tf):
          </span>
          <BlockMath
            math={`T_f = B \\cdot \\omega_m = ${frictionB.toFixed(2)} \\cdot ${metrics.omega.toFixed(2)} = \\mathbf{${metrics.Tf.toFixed(2)} \\text{ Nm}}`}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <span style={{ color: C.muted, fontWeight: "bold", fontSize: 13 }}>
            ③ 알짜 토크 (T_net = 남은 힘):
          </span>
          <BlockMath
            math={`T_{net} = T_e - \\color{${C.danger}}{T_L} - T_f = ${metrics.Te.toFixed(2)} - \\color{${C.danger}}{${loadTl.toFixed(2)}} - ${metrics.Tf.toFixed(2)} = \\mathbf{${metrics.netTorque.toFixed(2)} \\text{ Nm}}`}
          />
        </div>

        <div>
          <span style={{ color: C.muted, fontWeight: "bold", fontSize: 13 }}>
            ④ 가속력 (각가속도 α):
          </span>
          <BlockMath
            math={`\\alpha = \\frac{T_{net}}{J} = \\frac{${metrics.netTorque.toFixed(2)}}{${inertiaJ.toFixed(2)}} = \\mathbf{\\color{${metrics.alpha > 0 ? C.success : metrics.alpha < 0 ? C.danger : C.text}}{${metrics.alpha.toFixed(3)}} \\text{ rad/s}^2}`}
          />
        </div>

        {metrics.alpha === 0 &&
          metrics.Te <= loadTl &&
          metrics.omega < 0.05 && (
            <div
              style={{
                marginTop: 16,
                padding: 12,
                background: "#ffe3e3",
                color: C.danger,
                borderLeft: `4px solid ${C.danger}`,
                borderRadius: 4,
                fontSize: 13,
                fontWeight: "bold",
              }}
            >
              ⚠️ 발생 토크 <InlineMath math="(T_e)" />가 부하 토크{" "}
              <InlineMath math="(T_L)" />
              보다 작거나 같아 모터가 회전할 수 없습니다. 전류를 높이거나 부하를
              줄이세요.
            </div>
          )}
      </div>
    </div>
  );
}
