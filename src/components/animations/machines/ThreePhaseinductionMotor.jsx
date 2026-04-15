import { Billboard, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

// --- [공통 수학/물리 로직] ---
const useMagneticField = (speedHz, phaseA, phaseB, phaseC) => {
  const angles = useMemo(() => [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3], []);

  // 시각적 회전 속도 조절을 위한 스케일링
  const visualSpeed = speedHz * 0.05;

  return { angles, visualSpeed };
};

// ==========================================
// [위쪽 화면] 실제 유도 전동기 구조 (Physical)
// ==========================================

const StatorPolePhysical = ({ angle, color, intensity }) => {
  const radius = 2.8;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  return (
    <group position={[x, y, 0]} rotation={[0, 0, angle]}>
      <mesh position={[-0.4, 0, 0]}>
        <boxGeometry args={[1.2, 0.8, 1.8]} />
        <meshStandardMaterial color="#4a4f59" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[-0.4, 0, 0]}>
        <boxGeometry args={[0.9, 0.95, 1.9]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={intensity * 0.8}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
};

const RealisticRotor = ({ rotorRef }) => {
  const bars = 18;
  return (
    <group ref={rotorRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 1.8, 32]} />
        <meshStandardMaterial color="#6a7282" metalness={0.6} roughness={0.5} />
      </mesh>
      {Array.from({ length: bars }).map((_, i) => {
        const angle = (i / bars) * Math.PI * 2;
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
        <meshStandardMaterial color="#b0b5c0" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
};

const PhysicalScene = ({ speedHz, phaseA, phaseB, phaseC }) => {
  const rotorRef = useRef();
  const [coilIntensity, setCoilIntensity] = useState({ a: 0, b: 0, c: 0 });
  const { angles, visualSpeed } = useMagneticField(
    speedHz,
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

    if (rotorRef.current && length > 0.5) {
      // 정상 회전 (결상 시에는 length가 작아져서 덜덜거림)
      rotorRef.current.rotation.z -= visualSpeed * length * 0.015;
    }
  });

  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <tubeGeometry
          args={[new THREE.EllipseCurve(0, 0, 3.6, 3.6), 64, 0.5, 16]}
        />
        <meshStandardMaterial color="#2d3436" metalness={0.4} roughness={0.7} />
      </mesh>

      <StatorPolePhysical
        angle={angles[0]}
        color="#ff4757"
        intensity={coilIntensity.a}
      />
      <StatorPolePhysical
        angle={angles[0] + Math.PI}
        color="#ff4757"
        intensity={coilIntensity.a}
      />
      <StatorPolePhysical
        angle={angles[1]}
        color="#2ed573"
        intensity={coilIntensity.b}
      />
      <StatorPolePhysical
        angle={angles[1] + Math.PI}
        color="#2ed573"
        intensity={coilIntensity.b}
      />
      <StatorPolePhysical
        angle={angles[2]}
        color="#1e90ff"
        intensity={coilIntensity.c}
      />
      <StatorPolePhysical
        angle={angles[2] + Math.PI}
        color="#1e90ff"
        intensity={coilIntensity.c}
      />

      <RealisticRotor rotorRef={rotorRef} />
    </group>
  );
};

// ==========================================
// [아래쪽 화면] 추상적 회전 자기장 (Abstract)
// ==========================================

const AbstractScene = ({ speedHz, phaseA, phaseB, phaseC }) => {
  const magneticFieldRef = useRef();
  const nPoleRef = useRef();
  const sPoleRef = useRef();
  const fluxLinesRef = useRef();
  const arrowRef = useRef();

  const { angles, visualSpeed } = useMagneticField(
    speedHz,
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

        // 결상 시 찌그러짐 표현 (Scale)
        const scaleStrength = length / 1.5;
        fluxLinesRef.current.scale.set(scaleStrength, scaleStrength, 1);
        nPoleRef.current.position.x = 2.5 * scaleStrength;
        sPoleRef.current.position.x = -2.5 * scaleStrength;

        // 중앙 화살표
        const dir = new THREE.Vector3(1, 0, 0).normalize(); // 이미 부모 group이 회전하므로 1,0,0
        arrowRef.current.setDirection(dir);
        arrowRef.current.setLength(length * 1.5, length * 0.5, length * 0.2);

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
      {/* 배경 가이드라인 */}
      <mesh>
        <ringGeometry args={[3.4, 3.45, 64]} />
        <meshBasicMaterial color="#333" transparent opacity={0.5} />
      </mesh>

      {/* 동적 자기장 그룹 */}
      <group ref={magneticFieldRef}>
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

        {/* 출렁이는 자기력선 */}
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
    </group>
  );
};

// ==========================================
// 메인 앱: UI 및 화면 분할 관리
// ==========================================

export default function ThreePhaseinductionMotor() {
  const [speedHz, setSpeedHz] = useState(60);
  const [phaseA, setPhaseA] = useState(true);
  const [phaseB, setPhaseB] = useState(true);
  const [phaseC, setPhaseC] = useState(true);

  // 동기 속도 Ns = 120 * f / P (극수 P=2로 가정)
  const syncSpeedRPM = speedHz * 60;
  // 슬립(Slip) 약 5% 가정 (결상 시 속도 급감)
  const isHealthy = phaseA && phaseB && phaseC;
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
      {/* 1. 상단 컨트롤 패널 */}
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
        <h3
          style={{
            margin: 0,
            borderRight: "1px solid #555",
            paddingRight: "20px",
          }}
        >
          3상 유도 전동기 시뮬레이터
        </h3>

        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            fontSize: "14px",
          }}
        >
          <span>
            회전 속도 (주파수): <strong>{speedHz} Hz</strong>
          </span>
          <input
            type="range"
            min="0"
            max="120"
            step="1"
            value={speedHz}
            onChange={(e) => setSpeedHz(Number(e.target.value))}
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
            A상 (Red)
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
            B상 (Green)
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
            C상 (Blue)
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
            실제 회전자 속도:{" "}
            <span style={{ color: isHealthy ? "#00f5d4" : "#ff4757" }}>
              {actualSpeedRPM} RPM {!isHealthy && "(결상/맥동)"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. 화면 분할 컨테이너 */}
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
              fontSize: "18px",
              fontWeight: "bold",
              zIndex: 5,
              background: "rgba(0,0,0,0.5)",
              padding: "5px 10px",
              borderRadius: "5px",
            }}
          >
            [1] 실제 전동기 구조 (물리적 회전)
          </div>
          <Canvas camera={{ position: [0, -4, 8], fov: 45 }}>
            <color attach="background" args={["#15171e"]} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 15]} intensity={1.5} />
            <directionalLight position={[-10, -10, -10]} intensity={0.5} />
            <PhysicalScene
              speedHz={speedHz}
              phaseA={phaseA}
              phaseB={phaseB}
              phaseC={phaseC}
            />
            <OrbitControls enableZoom={true} maxPolarAngle={Math.PI / 1.5} />
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
              fontSize: "18px",
              fontWeight: "bold",
              zIndex: 5,
              background: "rgba(0,0,0,0.5)",
              padding: "5px 10px",
              borderRadius: "5px",
            }}
          >
            [2] 회전 자기장 및 자기력선 (추상적 시각화)
          </div>
          <Canvas camera={{ position: [0, 0, 9], fov: 50 }}>
            <color attach="background" args={["#0a0b0e"]} />
            <ambientLight intensity={1.0} />
            <AbstractScene
              speedHz={speedHz}
              phaseA={phaseA}
              phaseB={phaseB}
              phaseC={phaseC}
            />
            <OrbitControls enableZoom={true} enableRotate={false} />{" "}
            {/* 2D 느낌을 위해 회전 제한 */}
          </Canvas>
        </div>
      </div>
    </div>
  );
}
