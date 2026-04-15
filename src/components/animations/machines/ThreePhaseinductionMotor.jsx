import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

// 코일과 극(Pole)을 현실적인 형태로 렌더링
const StatorPole = ({ angle, color, intensity }) => {
  const radius = 2.4;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  return (
    <group position={[x, y, 0]} rotation={[0, 0, angle]}>
      {/* 고정자 철심 (Stator Iron Core) */}
      <mesh position={[-0.4, 0, 0]}>
        <boxGeometry args={[1.2, 0.6, 1.5]} />
        <meshStandardMaterial color="#4a4f59" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* 구리 코일 (Copper Winding) */}
      <mesh position={[-0.4, 0, 0]}>
        <boxGeometry args={[0.8, 0.7, 1.6]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={intensity * 0.6} // 전류량에 따라 코일이 살짝 밝아짐
          metalness={0.6}
          roughness={0.5}
        />
      </mesh>
    </group>
  );
};

// 다람쥐 쳇바퀴 모양의 농형 회전자 (Squirrel-Cage Rotor)
const RealisticRotor = ({ rotorRef }) => {
  const bars = 16;
  return (
    <group ref={rotorRef}>
      {/* 회전자 철심 */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.4, 1.4, 1.6, 32]} />
        <meshStandardMaterial color="#6a7282" metalness={0.6} roughness={0.5} />
      </mesh>
      {/* 도체 바 (Rotor Bars) */}
      {Array.from({ length: bars }).map((_, i) => {
        const angle = (i / bars) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 1.35, Math.sin(angle) * 1.35, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.06, 0.06, 1.65, 8]} />
            <meshStandardMaterial
              color="#c2c5cc"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        );
      })}
      {/* 회전축 (Shaft) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 3, 16]} />
        <meshStandardMaterial color="#b0b5c0" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
};

// 회전 자기장 및 모터 전체 조립
const MotorAssembly = ({ speed, phaseA, phaseB, phaseC }) => {
  const arrowRef = useRef();
  const rotorRef = useRef();

  const [coilIntensity, setCoilIntensity] = useState({ a: 0, b: 0, c: 0 });
  const angles = useMemo(() => [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3], []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;

    const magA = phaseA ? Math.sin(t) : 0;
    const magB = phaseB ? Math.sin(t - angles[1]) : 0;
    const magC = phaseC ? Math.sin(t - angles[2]) : 0;

    const x =
      magA * Math.cos(angles[0]) +
      magB * Math.cos(angles[1]) +
      magC * Math.cos(angles[2]);
    const y =
      magA * Math.sin(angles[0]) +
      magB * Math.sin(angles[1]) +
      magC * Math.sin(angles[2]);

    const length = Math.sqrt(x * x + y * y);
    const dir = new THREE.Vector3(x, y, 0).normalize();

    // 합성 자기장 화살표 업데이트
    if (arrowRef.current) {
      if (length > 0.01) {
        arrowRef.current.setDirection(dir);
        arrowRef.current.setLength(
          length * 1.5 + 1.5,
          length * 0.4,
          length * 0.15,
        );
        arrowRef.current.visible = true;
      } else {
        arrowRef.current.visible = false;
      }
    }

    // 회전자 회전 (실제 모터의 슬립 현상을 약간 반영하여 자기장보다 조금 느리게 돎)
    if (rotorRef.current) {
      rotorRef.current.rotation.z -= (length > 0.5 ? speed * 0.9 : 0) * 0.016;
    }

    setCoilIntensity({
      a: Math.abs(magA),
      b: Math.abs(magB),
      c: Math.abs(magC),
    });
  });

  return (
    <group>
      {/* 고정자 외부 프레임 */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <tubeGeometry
          args={[new THREE.EllipseCurve(0, 0, 3.2, 3.2), 64, 0.4, 16]}
        />
        <meshStandardMaterial color="#333740" metalness={0.5} roughness={0.6} />
      </mesh>

      {/* 3상(6극) 코일 배치 (마주보는 극끼리 같은 상) */}
      <StatorPole
        angle={angles[0]}
        color="#d63031"
        intensity={coilIntensity.a}
      />
      <StatorPole
        angle={angles[0] + Math.PI}
        color="#d63031"
        intensity={coilIntensity.a}
      />

      <StatorPole
        angle={angles[1]}
        color="#00b894"
        intensity={coilIntensity.b}
      />
      <StatorPole
        angle={angles[1] + Math.PI}
        color="#00b894"
        intensity={coilIntensity.b}
      />

      <StatorPole
        angle={angles[2]}
        color="#0984e3"
        intensity={coilIntensity.c}
      />
      <StatorPole
        angle={angles[2] + Math.PI}
        color="#0984e3"
        intensity={coilIntensity.c}
      />

      {/* 회전자 */}
      <RealisticRotor rotorRef={rotorRef} />

      {/* 자기장 방향 화살표 */}
      <arrowHelper
        ref={arrowRef}
        args={[
          new THREE.Vector3(1, 0, 0),
          new THREE.Vector3(0, 0, 0),
          0,
          0xffaa00,
        ]}
      />
    </group>
  );
};

export default function ThreePhaseinductionMotor() {
  const [speed, setSpeed] = useState(3);
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
        backgroundColor: "#1a1d24",
      }}
    >
      <div
        style={{
          padding: "20px",
          color: "white",
          backgroundColor: "#2d3436",
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
            max="15"
            step="0.5"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
        </label>
        <label style={{ color: "#ff7675" }}>
          <input
            type="checkbox"
            checked={phaseA}
            onChange={(e) => setPhaseA(e.target.checked)}
          />{" "}
          Phase A (Red)
        </label>
        <label style={{ color: "#55efc4" }}>
          <input
            type="checkbox"
            checked={phaseB}
            onChange={(e) => setPhaseB(e.target.checked)}
          />{" "}
          Phase B (Green)
        </label>
        <label style={{ color: "#74b9ff" }}>
          <input
            type="checkbox"
            checked={phaseC}
            onChange={(e) => setPhaseC(e.target.checked)}
          />{" "}
          Phase C (Blue)
        </label>
      </div>

      <Canvas camera={{ position: [0, -6, 8], fov: 50 }}>
        <color attach="background" args={["#1a1d24"]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 15]} intensity={1.5} />
        <directionalLight position={[-10, -10, 5]} intensity={0.5} />
        <MotorAssembly
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
