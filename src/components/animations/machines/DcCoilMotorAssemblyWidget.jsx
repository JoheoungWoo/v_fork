/**
 * DcMotorDynamicsWidget.jsx
 *
 * 조명(Lighting)과 재질(Material)을 밝게 개선한 직류 전동기 동역학 시뮬레이션
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
        <meshStandardMaterial color="#ffffff" emissive="#333333" />
      </mesh>,
    );
  }

  return (
    <group position={position}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius, radius, height, radialSegments]} />
        {/* 💡 metalness를 낮추고 roughness를 높여 빛 반사를 부드럽게(밝게) 만듦 */}
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.6} />
      </mesh>
      {markers}
      <Text position={[0, radius + 0.6, 0]} fontSize={0.4} color="white">
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
      {/* 💡 색상을 더 밝은 파란색(#3399ff)으로 변경 */}
      <StripedCylinder
        args={[1.0, 2.0, 32]}
        color="#3399ff"
        position={[-2, 0, 0]}
        nameText="전동기 (Motor)"
      />

      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 3, 16]} />
        <meshStandardMaterial color="#dddddd" metalness={0.5} roughness={0.3} />
      </mesh>
      <Text position={[0, 0.5, 0]} fontSize={0.3} color="#eeeeee">
        축 (Shaft)
      </Text>

      {/* 💡 색상을 더 밝은 회색(#888888)으로 변경 */}
      <StripedCylinder
        args={[1.2, 2.0, 32]}
        color="#888888"
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

      <div style={{ height: 350 }}>
        <Canvas
          camera={{ position: [0, 4, 8], fov: 50 }}
          shadows
          gl={{ antialias: true }}
        >
          {/* 💡 3D 캔버스 배경색을 추가하여 공간이 너무 까맣지 않게 만듦 */}
          <color attach="background" args={["#1a1f2e"]} />

          {/* 💡 조명 세팅 대폭 강화 */}
          <ambientLight intensity={1.5} />
          <hemisphereLight
            skyColor="#ffffff"
            groundColor="#444444"
            intensity={1.0}
          />
          <directionalLight
            position={[10, 15, 10]}
            intensity={2.0}
            castShadow
          />
          <directionalLight position={[-10, 5, -10]} intensity={1.2} />

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
