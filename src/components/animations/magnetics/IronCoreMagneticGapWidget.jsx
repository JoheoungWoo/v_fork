import { Environment, Line, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/**
 * 단순 직류 전동기 3D (도면형): N–S 자석, 직사각형 전枢, 축, 분할 정류자·브러시, 배터리, 풀리·벨트.
 * 전류 입자 + 회전(슬라이더로 RPM), 정류자에 맞춰 루프 전류 방향 반전.
 * DB lecture_id 예: iron_core_magnetic_gap, simple_dc_motor
 */

const COL = {
  N: "#dc2626",
  S: "#2563eb",
  battery: "#22c55e",
  commutator: "#ea580c",
  brush: "#1e293b",
  flux: "#f472b6",
  pulse: "#fb923c",
};

const COIL_Y = 0.2;
const HALF_W = 0.2;
const HALF_H = 0.16;
const WIRE_R = 0.018;

/** 직사각형 권선 꼭짓점 (XZ 평면, 중심 0) */
const coilCorners = () => {
  const y = COIL_Y;
  const w = HALF_W;
  const h = HALF_H;
  return [
    new THREE.Vector3(-w, y, -h),
    new THREE.Vector3(w, y, -h),
    new THREE.Vector3(w, y, h),
    new THREE.Vector3(-w, y, h),
  ];
};

/** 둘레 비율 u∈[0,1) → 세계 좌표 (회전 전, XZ 평면) */
function coilPointAtU(u) {
  const c = coilCorners();
  const w = HALF_W * 2;
  const h2 = HALF_H * 2;
  const L = 2 * w + 2 * h2;
  let s = (u % 1 + 1) % 1;
  const d = s * L;
  // (-w,-h)→(w,-h)→(w,h)→(-w,h)→(-w,-h)
  const e0 = w;
  const e1 = e0 + h2;
  const e2 = e1 + w;
  const e3 = e2 + h2;
  if (d < e0) {
    const t = d / e0;
    return new THREE.Vector3().lerpVectors(c[0], c[1], t);
  }
  if (d < e1) {
    const t = (d - e0) / h2;
    return new THREE.Vector3().lerpVectors(c[1], c[2], t);
  }
  if (d < e2) {
    const t = (d - e1) / w;
    return new THREE.Vector3().lerpVectors(c[2], c[3], t);
  }
  const t = (d - e2) / h2;
  return new THREE.Vector3().lerpVectors(c[3], c[0], t);
}

function Magnets() {
  return (
    <group>
      <mesh castShadow position={[-1.02, 0.22, 0]} receiveShadow>
        <boxGeometry args={[0.32, 0.72, 0.58]} />
        <meshStandardMaterial color={COL.N} metalness={0.25} roughness={0.45} />
      </mesh>
      <Text position={[-1.22, 0.55, 0.35]} fontSize={0.11} color="#fecaca" anchorX="center">
        N
      </Text>
      <mesh castShadow position={[1.02, 0.22, 0]} receiveShadow>
        <boxGeometry args={[0.32, 0.72, 0.58]} />
        <meshStandardMaterial color={COL.S} metalness={0.25} roughness={0.45} />
      </mesh>
      <Text position={[1.22, 0.55, 0.35]} fontSize={0.11} color="#bfdbfe" anchorX="center">
        S
      </Text>
    </group>
  );
}

function FluxArrows() {
  const ys = [-0.08, 0.12, 0.32];
  return (
    <group>
      {ys.map((y, i) => (
        <Line
          key={i}
          points={[
            [-0.78, y, 0],
            [0.78, y, 0],
          ]}
          color={COL.flux}
          lineWidth={1.5}
          dashed
          dashSize={0.06}
          gapSize={0.04}
          opacity={0.75}
          transparent
        />
      ))}
    </group>
  );
}

/** 얇은 원통으로 권선 한 변 */
function WireSegment({ from, to, color, emissiveIntensity = 0.15 }) {
  const mid = useMemo(() => new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5), [from, to]);
  const len = useMemo(() => from.distanceTo(to), [from, to]);
  const quat = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(to, from).normalize();
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    return q;
  }, [from, to]);

  return (
    <mesh position={mid} quaternion={quat} castShadow>
      <cylinderGeometry args={[WIRE_R, WIRE_R, len, 10]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissiveIntensity}
        metalness={0.2}
        roughness={0.55}
        toneMapped={false}
      />
    </mesh>
  );
}

function RectangularCoil() {
  const c = useMemo(() => coilCorners(), []);
  const blue = "#2563eb";
  const red = "#dc2626";
  const grey = "#64748b";
  return (
    <group>
      <WireSegment from={c[0]} to={c[1]} color={grey} />
      <WireSegment from={c[1]} to={c[2]} color={red} emissiveIntensity={0.22} />
      <WireSegment from={c[2]} to={c[3]} color={grey} />
      <WireSegment from={c[3]} to={c[0]} color={blue} emissiveIntensity={0.22} />
    </group>
  );
}

/** Y축 분할 정류자 (반원통 2개) */
function Commutator() {
  const h = 0.09;
  const r = 0.11;
  return (
    <group position={[0, -0.02, 0]}>
      <mesh>
        <cylinderGeometry args={[r, r, h, 24, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color={COL.commutator} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[r, r, h, 24, 1, false, Math.PI, Math.PI]} />
        <meshStandardMaterial color="#c2410c" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}

function AxleAndPulley() {
  return (
    <group>
      <mesh castShadow position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.028, 0.028, 0.95, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh castShadow position={[0, 0.58, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.04, 24]} />
        <meshStandardMaterial color="#475569" metalness={0.35} roughness={0.5} />
      </mesh>
    </group>
  );
}

function Brushes() {
  return (
    <group>
      <mesh position={[0, -0.02, 0.13]} castShadow>
        <boxGeometry args={[0.07, 0.1, 0.06]} />
        <meshStandardMaterial color={COL.brush} metalness={0.3} roughness={0.65} />
      </mesh>
      <mesh position={[0, -0.02, -0.13]} castShadow>
        <boxGeometry args={[0.07, 0.1, 0.06]} />
        <meshStandardMaterial color={COL.brush} metalness={0.3} roughness={0.65} />
      </mesh>
    </group>
  );
}

function BatteryPack() {
  return (
    <group position={[0.35, -0.62, 0.42]}>
      <mesh castShadow>
        <boxGeometry args={[0.22, 0.34, 0.16]} />
        <meshStandardMaterial color={COL.battery} metalness={0.15} roughness={0.55} />
      </mesh>
      <mesh position={[0.11, 0.2, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.04, 12]} />
        <meshStandardMaterial color="#ef4444" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[-0.11, -0.2, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.04, 12]} />
        <meshStandardMaterial color="#0f172a" metalness={0.4} roughness={0.45} />
      </mesh>
      <Text position={[0, -0.28, 0.12]} fontSize={0.045} color="#bbf7d0" anchorX="center">
        배터리
      </Text>
    </group>
  );
}

function StationaryWires() {
  return (
    <group>
      <Line
        points={[
          [0.35, -0.45, 0.42],
          [0, -0.02, 0.13],
        ]}
        color="#ef4444"
        lineWidth={2}
      />
      <Line
        points={[
          [0.25, -0.78, 0.42],
          [0, -0.02, -0.13],
        ]}
        color="#1e293b"
        lineWidth={2}
      />
    </group>
  );
}

function LargePulleyAndBelt() {
  const bigY = 0.58;
  const bigX = -0.58;
  return (
    <group>
      <mesh position={[bigX, bigY, 0]} castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.035, 28]} />
        <meshStandardMaterial color="#52525b" metalness={0.3} roughness={0.55} />
      </mesh>
      <Line
        points={[
          [0, bigY, 0.1],
          [bigX * 0.92, bigY, 0.18],
          [bigX, bigY, 0.1],
          [bigX * 0.92, bigY, -0.18],
          [0, bigY, -0.1],
          [0, bigY, 0.1],
        ]}
        color="#3f3f46"
        lineWidth={2.5}
      />
    </group>
  );
}

function CurrentPulse({ angleRef, rpmRef, runningRef }) {
  const meshRef = useRef(null);
  const uRef = useRef(0);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const rpm = rpmRef.current;
    const running = runningRef.current;
    const theta = angleRef.current;
    const half = Math.floor(theta / Math.PI) % 2;
    const dir = half === 0 ? 1 : -1;
    const speed = running ? 0.35 + rpm * 0.022 : 0;
    uRef.current = (uRef.current + delta * speed * dir + 10) % 1;
    const u = uRef.current;
    tmp.copy(coilPointAtU(u));
    mesh.position.copy(tmp);
    mesh.scale.setScalar(0.085 + rpm * 0.0012);
    const m = mesh.material;
    if (m && "emissiveIntensity" in m) {
      m.emissiveIntensity = 1.2 + rpm * 0.04;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshStandardMaterial
        color={COL.pulse}
        emissive={COL.pulse}
        emissiveIntensity={1.4}
        toneMapped={false}
      />
    </mesh>
  );
}

function RotorAssembly({ angleRef, rpmRef, runningRef }) {
  const groupRef = useRef(null);

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;
    if (runningRef.current) {
      angleRef.current += delta * (rpmRef.current * Math.PI) / 30;
    }
    g.rotation.y = angleRef.current;
  });

  return (
    <group ref={groupRef}>
      <AxleAndPulley />
      <RectangularCoil />
      <Commutator />
      <CurrentPulse angleRef={angleRef} rpmRef={rpmRef} runningRef={runningRef} />
    </group>
  );
}

function MotorScene({ rpmRef, runningRef }) {
  const angleRef = useRef(0);

  return (
    <>
      <ambientLight intensity={0.38} />
      <directionalLight position={[3.5, 5, 2]} intensity={1.05} castShadow />
      <directionalLight position={[-2, 2, -2]} intensity={0.22} />
      <Environment preset="city" />

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.78, 0]}>
        <planeGeometry args={[4.2, 3.2]} />
        <meshStandardMaterial color="#0f172a" metalness={0.08} roughness={0.92} />
      </mesh>

      <Magnets />
      <FluxArrows />
      <Brushes />
      <BatteryPack />
      <StationaryWires />
      <LargePulleyAndBelt />
      <RotorAssembly angleRef={angleRef} rpmRef={rpmRef} runningRef={runningRef} />

      <OrbitControls
        enablePan={false}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI / 2 + 0.15}
        minDistance={2.4}
        maxDistance={6}
        target={[0, 0.15, 0]}
      />
    </>
  );
}

export default function IronCoreMagneticGapWidget() {
  const [rpm, setRpm] = useState(90);
  const [running, setRunning] = useState(true);
  const rpmRef = useRef(rpm);
  const runningRef = useRef(running);
  rpmRef.current = rpm;
  runningRef.current = running;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-[#020617] p-5 font-sans shadow-2xl md:p-8">
      <div className="pointer-events-none absolute left-1/4 top-0 h-80 w-80 rounded-full bg-red-900/12 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-blue-900/12 blur-[100px]" />

      <div className="relative z-10 mb-6 border-b border-slate-800 pb-4">
        <h3 className="text-2xl font-black tracking-tight text-white">
          단순{" "}
          <span className="bg-gradient-to-r from-green-400 via-amber-300 to-blue-400 bg-clip-text text-transparent">
            직류 전동기
          </span>{" "}
          3D
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
          N–S 자석 사이 직사각형 권선이 축·정류자·브러시와 함께 회전합니다. 분홍 점선은 자속(개략), 주황 구체는
          권선을 도는 전류 표시이며 반바퀴마다 정류자에 맞춰 방향이 바뀝니다.
        </p>
      </div>

      <div className="relative z-10 mb-4 flex flex-wrap items-end gap-4 rounded-xl border border-slate-700 bg-slate-900/60 p-4 backdrop-blur-md">
        <div className="min-w-[200px] flex-1">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">
            회전 속도 (RPM)
          </label>
          <input
            type="range"
            min={0}
            max={240}
            step={5}
            value={rpm}
            onChange={(e) => setRpm(parseInt(e.target.value, 10))}
            className="w-full accent-amber-500"
          />
          <div className="mt-1 font-mono text-xs text-amber-400">{rpm} RPM</div>
        </div>
        <button
          type="button"
          onClick={() => setRunning((v) => !v)}
          className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${
            running
              ? "border border-green-500/50 bg-green-500/15 text-green-300"
              : "border border-slate-600 bg-slate-800 text-slate-400"
          }`}
        >
          {running ? "회전 ON" : "회전 일시정지"}
        </button>
      </div>

      <div className="relative z-10 h-[min(52vh,440px)] min-h-[280px] w-full overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1120] shadow-inner md:min-h-[360px]">
        <Canvas
          shadows
          frameloop="always"
          camera={{ position: [0.35, 1.15, 3.15], fov: 42 }}
          gl={{ antialias: true, alpha: false }}
          className="h-full w-full touch-none"
        >
          <Suspense fallback={null}>
            <MotorScene rpmRef={rpmRef} runningRef={runningRef} />
          </Suspense>
        </Canvas>
        <p className="pointer-events-none absolute bottom-2 left-1/2 z-10 max-w-[94%] -translate-x-1/2 rounded-full bg-black/45 px-3 py-1 text-center text-[10px] text-slate-400 backdrop-blur-sm">
          드래그로 회전 · 스크롤로 확대 · 파란/빨간 다리 = 권선 양측(도면과 동일)
        </p>
      </div>
    </div>
  );
}
