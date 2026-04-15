import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react"; // 이 줄이 추가되었습니다.
import * as THREE from "three";

// 고정자의 코일(상)을 렌더링하는 컴포넌트
const Coil = ({ position, rotation, color, intensity }) => {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <cylinderGeometry args={[0.2, 0.2, 1, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.25 + intensity * 1.9}
          roughness={0.25}
          metalness={0.4}
        />
      </mesh>
    </group>
  );
};

const CurrentFlowRing = ({ radius, phaseOffset, color, speed, enabled }) => {
  const instancedRef = useRef();
  const count = 60;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const phases = useMemo(
    () => Array.from({ length: count }, (_, i) => i / count),
    [count]
  );

  useFrame(({ clock }) => {
    if (!instancedRef.current) return;
    const t = clock.getElapsedTime() * speed;
    const amp = enabled ? 1 : 0;

    phases.forEach((base, i) => {
      const flow = (base + t * 0.12 + phaseOffset / (Math.PI * 2)) % 1;
      const angle = flow * Math.PI * 2;
      const pulse = 0.35 + 0.65 * Math.max(0, Math.sin(t + angle * 2));
      const localRadius = radius + amp * pulse * 0.08;

      dummy.position.set(
        Math.cos(angle) * localRadius,
        Math.sin(angle) * localRadius,
        amp * Math.sin(t * 1.5 + i * 0.2) * 0.06
      );
      dummy.scale.setScalar(0.4 + amp * pulse * 1.1);
      dummy.updateMatrix();
      instancedRef.current.setMatrixAt(i, dummy.matrix);
    });

    instancedRef.current.visible = amp > 0;
    instancedRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={instancedRef} args={[null, null, count]}>
      <sphereGeometry args={[0.04, 8, 8]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </instancedMesh>
  );
};

const ElectricFieldRipples = ({ speed, fieldStrength }) => {
  const ripple1 = useRef();
  const ripple2 = useRef();
  const ripple3 = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    const s = 0.7 + fieldStrength * 0.65;

    if (ripple1.current) {
      ripple1.current.rotation.z = t * 0.9;
      ripple1.current.scale.setScalar(s + Math.sin(t * 2.1) * 0.12);
      ripple1.current.material.opacity = 0.15 + fieldStrength * 0.35;
    }
    if (ripple2.current) {
      ripple2.current.rotation.z = -t * 1.25;
      ripple2.current.scale.setScalar(s * 0.82 + Math.cos(t * 2.6) * 0.1);
      ripple2.current.material.opacity = 0.12 + fieldStrength * 0.28;
    }
    if (ripple3.current) {
      ripple3.current.rotation.z = t * 1.8;
      ripple3.current.scale.setScalar(s * 0.62 + Math.sin(t * 3.2) * 0.08);
      ripple3.current.material.opacity = 0.1 + fieldStrength * 0.24;
    }
  });

  return (
    <group>
      <mesh ref={ripple1}>
        <torusGeometry args={[1.2, 0.03, 16, 120]} />
        <meshBasicMaterial
          color="#f8f063"
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={ripple2} rotation={[0, 0, Math.PI / 3]}>
        <torusGeometry args={[0.95, 0.025, 16, 100]} />
        <meshBasicMaterial
          color="#65d9ff"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={ripple3} rotation={[0, 0, (Math.PI * 2) / 3]}>
        <torusGeometry args={[0.72, 0.02, 16, 90]} />
        <meshBasicMaterial
          color="#9cff57"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

// 회전 자기장 (중앙의 화살표) 및 전체 로직을 처리하는 컴포넌트
const MagneticField = ({ speed, phaseA, phaseB, phaseC }) => {
  const arrowRef = useRef();
  const rotorRef = useRef();
  const coreGlowRef = useRef();
  const [coilIntensity, setCoilIntensity] = useState({
    a: 0,
    b: 0,
    c: 0,
  });
  const [fieldStrength, setFieldStrength] = useState(0);

  // 3상의 각도 (0도, 120도, 240도)
  const angles = useMemo(() => [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3], []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;

    // 각 상의 교류 자기장 세기 계산 (sin 파)
    const magA = phaseA ? Math.sin(t) : 0;
    const magB = phaseB ? Math.sin(t - angles[1]) : 0;
    const magC = phaseC ? Math.sin(t - angles[2]) : 0;

    // x, y 축으로의 벡터 합성 (자기장의 중첩)
    const x =
      magA * Math.cos(angles[0]) +
      magB * Math.cos(angles[1]) +
      magC * Math.cos(angles[2]);
    const y =
      magA * Math.sin(angles[0]) +
      magB * Math.sin(angles[1]) +
      magC * Math.sin(angles[2]);

    // 합성 벡터의 크기와 방향 계산
    const length = Math.sqrt(x * x + y * y);
    const dir = new THREE.Vector3(x, y, 0).normalize();

    if (arrowRef.current) {
      if (length > 0.01) {
        arrowRef.current.setDirection(dir);
        arrowRef.current.setLength(length * 2, length * 0.5, length * 0.2);
        arrowRef.current.visible = true;
      } else {
        arrowRef.current.visible = false;
      }
    }

    if (rotorRef.current) {
      rotorRef.current.rotation.z -= (0.01 + length * 0.025) * Math.sign(speed || 1);
    }

    if (coreGlowRef.current) {
      coreGlowRef.current.material.emissiveIntensity = 0.35 + length * 1.7;
      coreGlowRef.current.scale.setScalar(0.9 + length * 0.24);
    }

    setCoilIntensity({
      a: Math.abs(magA),
      b: Math.abs(magB),
      c: Math.abs(magC),
    });
    setFieldStrength(Math.min(length / 1.6, 1));
  });

  return (
    <group>
      {/* 3상 코일 배치 */}
      <Coil
        position={[3, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        color="#ff3b3b"
        intensity={coilIntensity.a}
      />
      <Coil
        position={[-1.5, 2.6, 0]}
        rotation={[0, 0, -Math.PI / 6]}
        color="#3dff6a"
        intensity={coilIntensity.b}
      />
      <Coil
        position={[-1.5, -2.6, 0]}
        rotation={[0, 0, Math.PI / 6]}
        color="#39b4ff"
        intensity={coilIntensity.c}
      />

      {/* 3상 전류 흐름 시각화 */}
      <CurrentFlowRing
        radius={3.02}
        phaseOffset={0}
        color="#ff4545"
        speed={speed}
        enabled={phaseA}
      />
      <CurrentFlowRing
        radius={2.84}
        phaseOffset={(2 * Math.PI) / 3}
        color="#51ff70"
        speed={speed}
        enabled={phaseB}
      />
      <CurrentFlowRing
        radius={2.66}
        phaseOffset={(4 * Math.PI) / 3}
        color="#56bfff"
        speed={speed}
        enabled={phaseC}
      />

      {/* 고정자 외함 (Stator Ring) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.5, 0.2, 16, 100]} />
        <meshStandardMaterial color="#6e7888" metalness={0.55} roughness={0.3} />
      </mesh>

      {/* 회전자 */}
      <group ref={rotorRef}>
        <mesh>
          <cylinderGeometry args={[1.15, 1.15, 0.8, 42]} />
          <meshStandardMaterial color="#7f879a" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[2.1, 0.16, 0.85]} />
          <meshStandardMaterial color="#9ca4b5" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh rotation={[0, 0, 0]}>
          <boxGeometry args={[2.1, 0.16, 0.85]} />
          <meshStandardMaterial color="#9ca4b5" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* 중심 에너지 글로우 */}
      <mesh ref={coreGlowRef}>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial
          color="#fef266"
          emissive="#fff380"
          emissiveIntensity={1}
          metalness={0.15}
          roughness={0.4}
        />
      </mesh>

      {/* 전기장 출렁임 */}
      <ElectricFieldRipples speed={speed} fieldStrength={fieldStrength} />

      {/* 합성 자기장을 나타내는 화살표 */}
      <arrowHelper
        ref={arrowRef}
        args={[
          new THREE.Vector3(1, 0, 0),
          new THREE.Vector3(0, 0, 0),
          0,
          0xffff00,
        ]}
      />
    </group>
  );
};

export default function ThreePhaseinductionMotor() {
  const [speed, setSpeed] = useState(2);
  const [phaseA, setPhaseA] = useState(true);
  const [phaseB, setPhaseB] = useState(true);
  const [phaseC, setPhaseC] = useState(true);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#1e1e1e",
      }}
    >
      {/* UI 컨트롤 패널 */}
      <div
        style={{
          padding: "20px",
          color: "white",
          backgroundColor: "#333",
          display: "flex",
          gap: "20px",
          alignItems: "center",
        }}
      >
        <h3>3상 유도 모터 제어기</h3>
        <label>
          회전 속도 (주파수):
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
        </label>
        <label style={{ color: "#ff6b6b" }}>
          <input
            type="checkbox"
            checked={phaseA}
            onChange={(e) => setPhaseA(e.target.checked)}
          />{" "}
          Phase A (Red)
        </label>
        <label style={{ color: "#51cf66" }}>
          <input
            type="checkbox"
            checked={phaseB}
            onChange={(e) => setPhaseB(e.target.checked)}
          />{" "}
          Phase B (Green)
        </label>
        <label style={{ color: "#339af0" }}>
          <input
            type="checkbox"
            checked={phaseC}
            onChange={(e) => setPhaseC(e.target.checked)}
          />{" "}
          Phase C (Blue)
        </label>
      </div>

      {/* 3D 캔버스 영역 */}
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <color attach="background" args={["#0f1726"]} />
        <fog attach="fog" args={["#0f1726", 8, 16]} />
        <ambientLight intensity={0.45} />
        <pointLight position={[10, 10, 10]} intensity={1.25} color="#cfdcff" />
        <pointLight position={[-8, -8, 7]} intensity={0.85} color="#66bfff" />
        <MagneticField
          speed={speed}
          phaseA={phaseA}
          phaseB={phaseB}
          phaseC={phaseC}
        />
        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  );
}
