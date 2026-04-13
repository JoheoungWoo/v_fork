import { Environment, Line as DreiLine, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import * as THREE from "three";

const DISK_Y = 0.15;
const DISK_R = 0.42;
/** 말굽 극 중심 X (원판 외연이 극 사이 자기장을 통과하도록) */
const POLE_X = DISK_R + 0.06;
const MAX_RPM = 240;
/** 최대 RPM일 때 파형 위상이 한 스로틀 프레임당 진행하는 라디안 (주파수 ∝ |RPM|) */
const WAVE_PHASE_STEP_AT_MAX_RPM = 0.118;
/** 패널에 표시하는 가시 주파수 스케일 (Hz, 최대 RPM에서 이 값) */
const WAVE_FREQ_HZ_AT_MAX_RPM = 3.2;

/** 목재 베이스 + 절연 받침 느낌 */
function WoodenBase() {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, -0.038, 0]}>
        <boxGeometry args={[2.35, 0.076, 1.65]} />
        <meshStandardMaterial color="#5c3d2e" metalness={0.08} roughness={0.78} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, -0.001, 0]}>
        <boxGeometry args={[2.28, 0.012, 1.58]} />
        <meshStandardMaterial color="#78716c" metalness={0.12} roughness={0.65} />
      </mesh>
    </group>
  );
}

/** 직류 배터리: + 단자(상단), − 단자(하단) */
function BatteryPack({ position = [-0.78, 0.085, 0.52] }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.065, 0.068, 0.15, 28]} />
        <meshStandardMaterial color="#334155" metalness={0.35} roughness={0.55} />
      </mesh>
      <mesh castShadow position={[0, 0.082, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.028, 20]} />
        <meshStandardMaterial color="#dc2626" metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh position={[0, -0.078, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.022, 0.038, 20]} />
        <meshStandardMaterial color="#0f172a" metalness={0.4} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      <Text position={[0.1, 0.06, 0]} fontSize={0.045} color="#fca5a5" anchorX="left">
        +
      </Text>
      <Text position={[0.1, -0.05, 0]} fontSize={0.045} color="#94a3b8" anchorX="left">
        −
      </Text>
    </group>
  );
}

/**
 * 말굽자석: 원판 외연이 N–S 사이 수직 자기장을 통과하도록 배치.
 * magnetDirection 반전 시 N/S 색·라벨 교환.
 */
function HorseshoeMagnet({ magnetDirection }) {
  const nOnTop = magnetDirection > 0;
  const topColor = nOnTop ? "#b91c1c" : "#1d4ed8";
  const botColor = nOnTop ? "#1d4ed8" : "#b91c1c";
  const topLabel = nOnTop ? "N극" : "S극";
  const botLabel = nOnTop ? "S극" : "N극";

  return (
    <group position={[POLE_X, 0, 0]}>
      <mesh position={[0, DISK_Y - 0.13, 0]} castShadow>
        <cylinderGeometry args={[0.085, 0.095, 0.22, 26]} />
        <meshStandardMaterial color={botColor} metalness={0.42} roughness={0.38} />
      </mesh>
      <mesh position={[0, DISK_Y + 0.13, 0]} castShadow>
        <cylinderGeometry args={[0.085, 0.095, 0.22, 26]} />
        <meshStandardMaterial color={topColor} metalness={0.42} roughness={0.38} />
      </mesh>
      <mesh position={[0.14, DISK_Y, 0]} castShadow>
        <boxGeometry args={[0.22, 0.34, 0.16]} />
        <meshStandardMaterial color="#64748b" metalness={0.5} roughness={0.45} />
      </mesh>
      <Text position={[0.22, DISK_Y + 0.13, 0.12]} fontSize={0.048} color="#fecaca" anchorX="center">
        {topLabel}
      </Text>
      <Text position={[0.22, DISK_Y - 0.13, 0.12]} fontSize={0.048} color="#bfdbfe" anchorX="center">
        {botLabel}
      </Text>
    </group>
  );
}

/** 브러시: 외연 접촉 블록 */
function BrushContact({ diskY = DISK_Y }) {
  const x = DISK_R - 0.015;
  return (
    <mesh castShadow position={[x, diskY, 0]}>
      <boxGeometry args={[0.055, 0.06, 0.11]} />
      <meshStandardMaterial color="#292524" metalness={0.25} roughness={0.72} />
    </mesh>
  );
}

function WireHarness({ batteryPos }) {
  const [bx, by, bz] = batteryPos;
  const axisTop = [0, 0.26, 0];
  const plusStart = [bx, by + 0.08, bz];
  const brushPoint = [DISK_R - 0.02, DISK_Y, 0];

  const plusPath = useMemo(
    () => [
      plusStart,
      [bx * 0.4, 0.2, bz * 0.35],
      [0.08, 0.24, 0.12],
      axisTop,
    ],
    [bx, by, bz],
  );

  const minusPath = useMemo(
    () => [
      [bx, by - 0.06, bz],
      [0.15, DISK_Y - 0.02, 0.22],
      [brushPoint[0] - 0.04, brushPoint[1], brushPoint[2] + 0.06],
      brushPoint,
    ],
    [bx, by, bz],
  );

  return (
    <group>
      <DreiLine points={plusPath} color="#ef4444" lineWidth={2.5} />
      <DreiLine points={minusPath} color="#64748b" lineWidth={2.5} />
    </group>
  );
}

/** 균형 3상 정현파 u,v,w (120° 위상차). 스크롤 속도·부호 = 원판 RPM과 동일 비율(정지 시 0 Hz). */
function ThreePhaseWaveformPanel({ isRunning, voltage, magnetDirection }) {
  const [phase, setPhase] = useState(0);
  const speedRef = useRef(0);

  const motorRpm = isRunning ? (voltage / 10) * MAX_RPM * magnetDirection : 0;
  const rpmAbs = Math.abs(motorRpm);
  const fVis = (rpmAbs / MAX_RPM) * WAVE_FREQ_HZ_AT_MAX_RPM;

  speedRef.current =
    rpmAbs < 1e-6
      ? 0
      : (rpmAbs / MAX_RPM) * WAVE_PHASE_STEP_AT_MAX_RPM * Math.sign(motorRpm);

  useEffect(() => {
    let raf = 0;
    let last = 0;
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 36) return;
      last = now;
      setPhase((p) => p + speedRef.current);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const data = useMemo(() => {
    const pts = [];
    for (let deg = 0; deg <= 360; deg += 3) {
      const rad = (deg * Math.PI) / 180 + phase;
      pts.push({
        theta: deg,
        u: Math.sin(rad),
        v: Math.sin(rad - (2 * Math.PI) / 3),
        w: Math.sin(rad + (2 * Math.PI) / 3),
      });
    }
    return pts;
  }, [phase]);

  return (
    <div
      style={{
        position: "absolute",
        top: 14,
        right: 14,
        zIndex: 2,
        width: "min(340px, calc(100% - 28px))",
        padding: "12px 12px 10px",
        borderRadius: 12,
        background: "rgba(15, 23, 42, 0.94)",
        border: "1px solid rgba(148, 163, 184, 0.32)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.04em",
          color: "#94a3b8",
          marginBottom: 4,
        }}
      >
        3상 교류 파형 (RPM 연동)
      </div>
      <div
        style={{
          fontSize: 10,
          color: "#64748b",
          marginBottom: 6,
          lineHeight: 1.4,
        }}
      >
        표시 주파수 약 <strong style={{ color: "#38bdf8" }}>{fVis.toFixed(2)}</strong> Hz
        {rpmAbs < 1e-6 ? " (정지)" : ` · 원판 ${Math.round(rpmAbs)} RPM에 비례`}
        {motorRpm < 0 ? " · 역방향" : ""}
      </div>
      <div style={{ height: 172, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 2, right: 4, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="#334155" strokeDasharray="4 4" />
            <XAxis
              dataKey="theta"
              type="number"
              domain={[0, 360]}
              tick={{ fill: "#64748b", fontSize: 9 }}
              ticks={[0, 90, 180, 270, 360]}
              label={{
                value: "전기각 θ (°)",
                position: "insideBottomRight",
                offset: -4,
                fill: "#64748b",
                fontSize: 10,
              }}
            />
            <YAxis
              domain={[-1.15, 1.15]}
              tick={{ fill: "#64748b", fontSize: 9 }}
              width={34}
              tickCount={5}
            />
            <Tooltip
              contentStyle={{
                background: "#0f172a",
                border: "1px solid #475569",
                borderRadius: 8,
                fontSize: 11,
                color: "#e2e8f0",
              }}
              labelFormatter={(v) => `θ = ${v}°`}
              formatter={(value) => [Number(value).toFixed(3), ""]}
            />
            <Legend
              wrapperStyle={{ fontSize: 10, color: "#cbd5e1", paddingTop: 4 }}
              iconType="line"
            />
            <Line
              name="U상"
              type="monotone"
              dataKey="u"
              stroke="#f87171"
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
            <Line
              name="V상"
              type="monotone"
              dataKey="v"
              stroke="#4ade80"
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
            <Line
              name="W상"
              type="monotone"
              dataKey="w"
              stroke="#60a5fa"
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p
        style={{
          margin: "6px 0 0",
          fontSize: 10,
          color: "#64748b",
          lineHeight: 1.45,
        }}
      >
        3개 상은 120° 위상차·동일 크기입니다. 파형이 흐르는 속도(주파수)는 위 원판의 회전 속도(RPM)에
        비례하며, 자기장 반전 시 진행 방향도 같이 바뀝니다. 유도전동기 3상 급전 참고용이며 실험대 전원은
        DC입니다.
      </p>
    </div>
  );
}

/** 원판 상면 표식 — 대칭 원판만 있으면 회전이 육안으로 거의 안 보입니다. */
function DiskSurfaceMarkers() {
  const r = DISK_R * 0.88;
  const y = 0.027;
  return (
    <group>
      <mesh position={[r, y, 0]} castShadow>
        <boxGeometry args={[0.09, 0.012, 0.05]} />
        <meshStandardMaterial color="#ef4444" metalness={0.2} roughness={0.5} />
      </mesh>
      <mesh position={[r * -0.5, y, r * 0.866]} castShadow>
        <boxGeometry args={[0.06, 0.012, 0.06]} />
        <meshStandardMaterial color="#22c55e" metalness={0.2} roughness={0.5} />
      </mesh>
      <mesh position={[r * -0.5, y, r * -0.866]} castShadow>
        <boxGeometry args={[0.05, 0.012, 0.08]} />
        <meshStandardMaterial color="#3b82f6" metalness={0.2} roughness={0.5} />
      </mesh>
    </group>
  );
}

function HomopolarScene({ driveRef, magnetDirection }) {
  const diskRef = useRef(null);

  useFrame((_, delta) => {
    const g = diskRef.current;
    if (!g) return;
    const { isRunning, voltage, magnetDirection } = driveRef.current;
    const rpm = isRunning ? (voltage / 10) * MAX_RPM * magnetDirection : 0;
    const radPerSec = (Math.PI * 2 * rpm) / 60;
    g.rotation.y += radPerSec * delta;
  });

  const batteryPos = useMemo(() => [-0.78, 0.085, 0.52], []);

  return (
    <>
      <ambientLight intensity={0.32} />
      <directionalLight castShadow position={[3.5, 5.5, 2.5]} intensity={1.2} />
      <directionalLight position={[-4, 2.5, -2]} intensity={0.38} color="#bfdbfe" />
      <directionalLight position={[0, -2, 4]} intensity={0.22} color="#fde68a" />

      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>

      <WoodenBase />
      <BatteryPack position={batteryPos} />
      <WireHarness batteryPos={batteryPos} />

      {/* 중심 금속축 (베이스 고정) */}
      <mesh castShadow position={[0, 0.11, 0]} receiveShadow>
        <cylinderGeometry args={[0.038, 0.042, 0.24, 20]} />
        <meshStandardMaterial color="#57534e" metalness={0.65} roughness={0.35} />
      </mesh>

      <HorseshoeMagnet magnetDirection={magnetDirection} />
      <BrushContact />

      {/* 동판 + 축 상부: 회전체 */}
      <group ref={diskRef} position={[0, DISK_Y, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[DISK_R, DISK_R, 0.048, 64]} />
          <meshStandardMaterial color="#b45309" metalness={0.75} roughness={0.28} />
        </mesh>
        <DiskSurfaceMarkers />
        <mesh castShadow position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.032, 0.028, 0.07, 18]} />
          <meshStandardMaterial color="#a8a29e" metalness={0.7} roughness={0.32} />
        </mesh>
      </group>

      <OrbitControls
        makeDefault
        minDistance={1.35}
        maxDistance={7.5}
        target={[0, DISK_Y, 0]}
        enablePan
      />
    </>
  );
}

/**
 * 호모폴라(패러데이 원판) 실험대: 베이스·배터리·전선·브러시·말굽자석·동판.
 * 전원·전압·자기장 반전으로 회전 방향·속도를 확인합니다.
 */
export default function HorseshoeMagnetDiskWidget() {
  const [isRunning, setIsRunning] = useState(false);
  const [voltage, setVoltage] = useState(5);
  const [magnetDirection, setMagnetDirection] = useState(1);

  const driveRef = useRef({
    isRunning: false,
    voltage: 5,
    magnetDirection: 1,
  });
  driveRef.current = { isRunning, voltage, magnetDirection };

  const displayRpm = useMemo(() => {
    if (!isRunning) return 0;
    return Math.round((voltage / 10) * MAX_RPM * magnetDirection);
  }, [isRunning, voltage, magnetDirection]);

  const panel = {
    position: "absolute",
    left: "50%",
    bottom: 16,
    transform: "translateX(-50%)",
    width: "min(440px, calc(100% - 24px))",
    padding: "14px 16px",
    borderRadius: 14,
    background: "rgba(15, 23, 42, 0.94)",
    border: "1px solid rgba(148, 163, 184, 0.35)",
    color: "#e2e8f0",
    fontFamily: "system-ui, sans-serif",
    fontSize: 13,
    zIndex: 2,
    boxShadow: "0 16px 48px rgba(0,0,0,0.45)",
  };

  const label = { display: "block", fontWeight: 600, color: "#cbd5e1", marginBottom: 8 };

  const powerBtnStyle = {
    padding: "10px 16px",
    borderRadius: 10,
    border: "1px solid rgba(148,163,184,0.4)",
    background: isRunning ? "rgba(21,128,61,0.5)" : "rgba(30,41,59,0.9)",
    color: "#f8fafc",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "system-ui, sans-serif",
  };

  const secondaryBtnStyle = {
    padding: "10px 16px",
    borderRadius: 10,
    border: "1px solid rgba(56,189,248,0.35)",
    background: "rgba(30,41,59,0.9)",
    color: "#e2e8f0",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "system-ui, sans-serif",
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "min(750px, 88vh)",
        minHeight: 560,
        borderRadius: 14,
        overflow: "hidden",
        background: "linear-gradient(165deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        border: "1px solid rgba(51, 65, 85, 0.55)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 14,
          left: 14,
          zIndex: 2,
          maxWidth: "min(320px, calc(100% - 28px))",
          padding: "12px 14px",
          borderRadius: 12,
          background: "rgba(15, 23, 42, 0.92)",
          border: "1px solid rgba(148, 163, 184, 0.32)",
          color: "#cbd5e1",
          fontSize: 12,
          lineHeight: 1.55,
        }}
      >
        <div style={{ fontWeight: 700, color: "#94a3b8", marginBottom: 8, fontSize: 11 }}>
          호모폴라 · 패러데이 원판 실험대
        </div>
        <strong style={{ color: "#e2e8f0" }}>베이스</strong> 위에{" "}
        <strong style={{ color: "#e2e8f0" }}>축·동판</strong>이 서고,{" "}
        <strong style={{ color: "#e2e8f0" }}>말굽자석</strong>이 원판 외연을 끼고 있습니다.{" "}
        <strong style={{ color: "#fca5a5" }}>+</strong> 전선은 축(중심),{" "}
        <strong style={{ color: "#64748b" }}>−</strong> 전선은{" "}
        <strong style={{ color: "#e2e8f0" }}>브러시</strong>로 외연에 닿아 회로가 닫힙니다. 전원을 켜면
        로렌츠 힘에 의해 동판이 돕니다(속도는 전압에 비례, 자기장 반전 시 방향 반대).
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(71,85,105,0.45)" }}>
          <span style={{ color: "#94a3b8" }}>표시 RPM(시뮬): </span>
          <strong style={{ color: "#38bdf8" }}>{displayRpm}</strong>
          <span style={{ color: "#64748b", fontSize: 11 }}> · 원판 위 색 띠가 돌아가면 정상입니다.</span>
        </div>
      </div>

      <ThreePhaseWaveformPanel
        isRunning={isRunning}
        voltage={voltage}
        magnetDirection={magnetDirection}
      />

      <Canvas
        shadows
        frameloop="always"
        camera={{ position: [1.85, 1.05, 1.85], fov: 42 }}
        gl={{ antialias: true, alpha: false }}
        style={{ width: "100%", height: "100%" }}
      >
        <color attach="background" args={["#0b1220"]} />
        <Suspense fallback={null}>
          <HomopolarScene driveRef={driveRef} magnetDirection={magnetDirection} />
        </Suspense>
      </Canvas>

      <div style={panel}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <button
            type="button"
            style={powerBtnStyle}
            onClick={() => setIsRunning((v) => !v)}
          >
            {isRunning ? "전원 끄기" : "전원 켜기"}
          </button>
          <button
            type="button"
            style={secondaryBtnStyle}
            onClick={() => setMagnetDirection((d) => -d)}
          >
            자기장 방향 반전 (N↔S)
          </button>
          <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 4 }}>
            상태: {isRunning ? "가동 중" : "정지"} · 자기장 계수: {magnetDirection > 0 ? "+1" : "−1"}
          </span>
        </div>
        <label style={label}>
          전압 (Voltage → 회전 속도): {voltage} V (1 ~ 10)
        </label>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={voltage}
          onChange={(e) => setVoltage(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#38bdf8" }}
        />
      </div>
    </div>
  );
}
