import { Billboard, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

// ==========================================
// 공통 물리 & 애니메이션 로직
// ==========================================
const useMotorPhysics = (frequency, phaseA, phaseB, phaseC) => {
  const angles = useMemo(() => [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3], []);
  // 시각적으로 너무 빠르지 않게 스케일링
  const visualSpeed = frequency * 0.08;
  return { angles, visualSpeed };
};

// ==========================================
// [상단 뷰] 물리적 구조 (고정자 & 회전자)
// ==========================================

const StatorPole = ({ angle, color, intensity }) => {
  const radius = 2.8;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  return (
    <group position={[x, y, 0]} rotation={[0, 0, angle]}>
      {/* 철심 */}
      <mesh position={[-0.4, 0, 0]}>
        <boxGeometry args={[1.2, 0.8, 1.8]} />
        <meshStandardMaterial color="#4a4f59" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* 구리 코일 (전류에 따라 밝기 변화) */}
      <mesh position={[-0.4, 0, 0]}>
        <boxGeometry args={[0.9, 0.95, 1.9]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={intensity * 0.9}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
};

const PhysicalScene = ({ frequency, phaseA, phaseB, phaseC }) => {
  const rotorRef = useRef();
  const [coilIntensity, setCoilIntensity] = useState({ a: 0, b: 0, c: 0 });
  const { angles, visualSpeed } = useMotorPhysics(
    frequency,
    phaseA,
    phaseB,
    phaseC,
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * visualSpeed;

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

    setCoilIntensity({
      a: Math.abs(magA),
      b: Math.abs(magB),
      c: Math.abs(magC),
    });

    // 회전자 회전 로직 (결상 시 덜덜거림 구현)
    if (rotorRef.current) {
      if (length > 0.5) {
        // 정상 회전
        rotorRef.current.rotation.z -= visualSpeed * length * 0.015;
      } else {
        // 결상 시 멈칫/진동
        rotorRef.current.rotation.z += Math.sin(t * 10) * 0.01;
      }
    }
  });

  return (
    <group>
      {/* 고정자 외부 프레임 */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <tubeGeometry
          args={[new THREE.EllipseCurve(0, 0, 3.6, 3.6), 64, 0.5, 16]}
        />
        <meshStandardMaterial color="#2d3436" metalness={0.4} roughness={0.7} />
      </mesh>

      {/* 6극 코일 (마주보는 극끼리 같은 상) */}
      <StatorPole
        angle={angles[0]}
        color="#ff4757"
        intensity={coilIntensity.a}
      />
      <StatorPole
        angle={angles[0] + Math.PI}
        color="#ff4757"
        intensity={coilIntensity.a}
      />
      <StatorPole
        angle={angles[1]}
        color="#2ed573"
        intensity={coilIntensity.b}
      />
      <StatorPole
        angle={angles[1] + Math.PI}
        color="#2ed573"
        intensity={coilIntensity.b}
      />
      <StatorPole
        angle={angles[2]}
        color="#1e90ff"
        intensity={coilIntensity.c}
      />
      <StatorPole
        angle={angles[2] + Math.PI}
        color="#1e90ff"
        intensity={coilIntensity.c}
      />

      {/* 농형 회전자 (다람쥐 쳇바퀴) */}
      <group ref={rotorRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 1.8, 32]} />
          <meshStandardMaterial
            color="#6a7282"
            metalness={0.6}
            roughness={0.5}
          />
        </mesh>
        {Array.from({ length: 18 }).map((_, i) => {
          const angle = (i / 18) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 1.45, Math.sin(angle) * 1.45, 0]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.08, 0.08, 1.85, 8]} />
              <meshStandardMaterial
                color="#dcdde1"
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
          );
        })}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 3.5, 16]} />
          <meshStandardMaterial
            color="#b0b5c0"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </group>
    </group>
  );
};

// ==========================================
// [하단 뷰] 추상적 자기장 시각화
// ==========================================

const AbstractScene = ({ frequency, phaseA, phaseB, phaseC }) => {
  const magneticFieldRef = useRef();
  const nPoleRef = useRef();
  const sPoleRef = useRef();
  const fluxLinesRef = useRef();

  const { angles, visualSpeed } = useMotorPhysics(
    frequency,
    phaseA,
    phaseB,
    phaseC,
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * visualSpeed;

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
    const fieldAngle = Math.atan2(y, x);

    if (magneticFieldRef.current) {
      if (length > 0.1) {
        magneticFieldRef.current.visible = true;
        magneticFieldRef.current.rotation.z = fieldAngle;

        // 결상 시 자기장이 찌그러지는 현상 반영
        const scaleStrength = length / 1.5;
        fluxLinesRef.current.scale.set(scaleStrength, scaleStrength, 1);
        nPoleRef.current.position.x = 2.5 * scaleStrength;
        sPoleRef.current.position.x = -2.5 * scaleStrength;

        // 자기력선 출렁임
        const pulse = Math.sin(t * 10) * 0.1;
        fluxLinesRef.current.scale.y = length / 1.5 + pulse;
      } else {
        magneticFieldRef.current.visible = false;
      }
    }
  });

  return (
    <group>
      {/* 120도 위상차 가이드라인 */}
      <mesh rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 7]} />
        <meshBasicMaterial color="#333" />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 3]}>
        <cylinderGeometry args={[0.02, 0.02, 7]} />
        <meshBasicMaterial color="#333" />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 3]}>
        <cylinderGeometry args={[0.02, 0.02, 7]} />
        <meshBasicMaterial color="#333" />
      </mesh>
      <mesh>
        <ringGeometry args={[3.4, 3.45, 64]} />
        <meshBasicMaterial color="#333" transparent opacity={0.5} />
      </mesh>

      {/* 동적 자기장 */}
      <group ref={magneticFieldRef}>
        {/* N극 */}
        <group ref={nPoleRef}>
          <mesh>
            <sphereGeometry args={[0.4, 32, 32]} />
            <meshBasicMaterial color="#3a86ff" />
          </mesh>
          <Billboard follow={true}>
            <Text
              position={[0, 0, 0.5]}
              fontSize={0.4}
              color="white"
              fontWeight="bold"
            >
              N
            </Text>
          </Billboard>
        </group>

        {/* S극 */}
        <group ref={sPoleRef}>
          <mesh>
            <sphereGeometry args={[0.4, 32, 32]} />
            <meshBasicMaterial color="#ff006e" />
          </mesh>
          <Billboard follow={true}>
            <Text
              position={[0, 0, 0.5]}
              fontSize={0.4}
              color="white"
              fontWeight="bold"
            >
              S
            </Text>
          </Billboard>
        </group>

        {/* 굽이치는 자기력선 */}
        <group ref={fluxLinesRef}>
          <mesh>
            <torusGeometry args={[1.5, 0.03, 16, 50, Math.PI]} />
            <meshBasicMaterial
              color="#00f5d4"
              transparent
              opacity={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[1.5, 0.03, 16, 50, Math.PI]} />
            <meshBasicMaterial
              color="#00f5d4"
              transparent
              opacity={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh>
            <torusGeometry args={[2.0, 0.05, 16, 50, Math.PI]} />
            <meshBasicMaterial
              color="#fca311"
              transparent
              opacity={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[2.0, 0.05, 16, 50, Math.PI]} />
            <meshBasicMaterial
              color="#fca311"
              transparent
              opacity={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
};

// ==========================================
// 메인 앱: 상하 분할 레이아웃 및 상태 관리
// ==========================================

export default function App() {
  const [frequency, setFrequency] = useState(60);
  const [phaseA, setPhaseA] = useState(true);
  const [phaseB, setPhaseB] = useState(true);
  const [phaseC, setPhaseC] = useState(true);

  // 동기 속도 Ns = 120 * f / P (극수 P=2로 가정)
  const syncSpeedRPM = frequency * 60;
  const isHealthy = phaseA && phaseB && phaseC;
  // 슬립(Slip) 적용 실제 속도 (정상 95%, 결상 시 10% 급감)
  const actualSpeedRPM = isHealthy
    ? Math.round(syncSpeedRPM * 0.95)
    : Math.round(syncSpeedRPM * 0.1);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0f1115",
        fontFamily: "sans-serif",
      }}
    >
      {/* 1. 상단 UI 컨트롤 패널 */}
      <div
        style={{
          padding: "15px 25px",
          color: "white",
          backgroundColor: "#1e2128",
          display: "flex",
          flexWrap: "wrap",
          gap: "25px",
          alignItems: "center",
          borderBottom: "1px solid #333",
          zIndex: 10,
        }}
      >
        <h3 style={{ margin: 0 }}>3상 유도 전동기 시뮬레이터</h3>

        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            fontSize: "14px",
          }}
        >
          <span>
            회전 속도 (주파수): <strong>{frequency} Hz</strong>
          </span>
          <input
            type="range"
            min="0"
            max="120"
            step="1"
            value={frequency}
            onChange={(e) => setFrequency(Number(e.target.value))}
            style={{ width: "150px" }}
          />
        </label>

        <div
          style={{
            display: "flex",
            gap: "15px",
            borderLeft: "1px solid #555",
            paddingLeft: "20px",
          }}
        >
          <label
            style={{
              color: "#ff4757",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <input
              type="checkbox"
              checked={phaseA}
              onChange={(e) => setPhaseA(e.target.checked)}
            />{" "}
            A상
          </label>
          <label
            style={{
              color: "#2ed573",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <input
              type="checkbox"
              checked={phaseB}
              onChange={(e) => setPhaseB(e.target.checked)}
            />{" "}
            B상
          </label>
          <label
            style={{
              color: "#1e90ff",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <input
              type="checkbox"
              checked={phaseC}
              onChange={(e) => setPhaseC(e.target.checked)}
            />{" "}
            C상
          </label>
        </div>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: "20px",
            fontSize: "14px",
            backgroundColor: "#000",
            padding: "8px 15px",
            borderRadius: "8px",
          }}
        >
          <div>
            동기 속도:{" "}
            <span style={{ color: "#fca311" }}>{syncSpeedRPM} RPM</span>
          </div>
          <div>
            실제 속도:{" "}
            <span style={{ color: isHealthy ? "#00f5d4" : "#ff4757" }}>
              {actualSpeedRPM} RPM {!isHealthy && "(결상/맥동)"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. 화면 분할 (상: 물리 3D / 하: 추상 3D) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflow: "hidden",
        }}
      >
        {/* 상단 캔버스: 물리적 구조 */}
        <div
          style={{
            flex: 1,
            position: "relative",
            borderBottom: "2px solid #333",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "15px",
              left: "20px",
              color: "white",
              fontSize: "16px",
              fontWeight: "bold",
              zIndex: 5,
              background: "rgba(0,0,0,0.6)",
              padding: "5px 10px",
              borderRadius: "5px",
            }}
          >
            [1] 3D 기계 구조 (Stator & Rotor)
          </div>
          <Canvas camera={{ position: [0, -5, 7], fov: 45 }}>
            <color attach="background" args={["#15171e"]} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 15]} intensity={1.5} />
            <PhysicalScene
              frequency={frequency}
              phaseA={phaseA}
              phaseB={phaseB}
              phaseC={phaseC}
            />
            <OrbitControls enableZoom={true} />
          </Canvas>
        </div>

        {/* 하단 캔버스: 추상적 자기장 */}
        <div style={{ flex: 1, position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: "15px",
              left: "20px",
              color: "white",
              fontSize: "16px",
              fontWeight: "bold",
              zIndex: 5,
              background: "rgba(0,0,0,0.6)",
              padding: "5px 10px",
              borderRadius: "5px",
            }}
          >
            [2] 회전 자기장 파동 (Magnetic Field)
          </div>
          <Canvas camera={{ position: [0, 0, 9], fov: 50 }}>
            <color attach="background" args={["#0a0b0e"]} />
            <ambientLight intensity={1.0} />
            <AbstractScene
              frequency={frequency}
              phaseA={phaseA}
              phaseB={phaseB}
              phaseC={phaseC}
            />
            <OrbitControls enableZoom={true} enableRotate={true} />
          </Canvas>
        </div>
      </div>
    </div>
  );
}
