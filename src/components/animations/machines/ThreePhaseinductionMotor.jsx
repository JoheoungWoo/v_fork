import { Billboard, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

// 1. 고정자(Stator) 철심과 코일
const StatorPole = ({ angle, color, intensity }) => {
  const radius = 2.8;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  return (
    <group position={[x, y, 0]} rotation={[0, 0, angle]}>
      {/* 고정자 철심 */}
      <mesh position={[-0.4, 0, 0]}>
        <boxGeometry args={[1.2, 0.8, 1.8]} />
        <meshStandardMaterial color="#4a4f59" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* 구리 권선(Coil) */}
      <mesh position={[-0.4, 0, 0]}>
        <boxGeometry args={[0.9, 0.95, 1.9]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={intensity * 0.8} // 전류 세기에 따른 빛남 효과
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
};

// 2. 다람쥐 쳇바퀴 모양의 농형 회전자 (Rotor)
const RealisticRotor = ({ rotorRef }) => {
  const bars = 18;
  return (
    <group ref={rotorRef}>
      {/* 회전자 철심 */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 1.8, 32]} />
        <meshStandardMaterial color="#6a7282" metalness={0.6} roughness={0.5} />
      </mesh>
      {/* 도체 바 (Rotor Bars) */}
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
      {/* 회전축 */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 3.5, 16]} />
        <meshStandardMaterial color="#b0b5c0" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
};

// 3. 모터 전체 조립 및 회전 자기장 제어
const MotorAssembly = ({ speed, phaseA, phaseB, phaseC }) => {
  const rotorRef = useRef();
  const magneticFieldRef = useRef();
  const nPoleRef = useRef();
  const sPoleRef = useRef();
  const fluxLinesRef = useRef();

  const [coilIntensity, setCoilIntensity] = useState({ a: 0, b: 0, c: 0 });
  const angles = useMemo(() => [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3], []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;

    // 각 상의 교류 자기장 세기 (sin 파형)
    const magA = phaseA ? Math.sin(t) : 0;
    const magB = phaseB ? Math.sin(t - angles[1]) : 0;
    const magC = phaseC ? Math.sin(t - angles[2]) : 0;

    // 벡터 합성 (x, y 축)
    const x =
      magA * Math.cos(angles[0]) +
      magB * Math.cos(angles[1]) +
      magC * Math.cos(angles[2]);
    const y =
      magA * Math.sin(angles[0]) +
      magB * Math.sin(angles[1]) +
      magC * Math.sin(angles[2]);

    // 합성 자기장의 크기와 각도
    const length = Math.sqrt(x * x + y * y);
    const fieldAngle = Math.atan2(y, x);

    // 코일 밝기 업데이트
    setCoilIntensity({
      a: Math.abs(magA),
      b: Math.abs(magB),
      c: Math.abs(magC),
    });

    // 자기장, N극/S극 마커, 자기력선 위치 업데이트
    if (magneticFieldRef.current && length > 0.1) {
      magneticFieldRef.current.visible = true;
      magneticFieldRef.current.rotation.z = fieldAngle;

      // 상이 끊겼을 때(결상) 자기장이 찌그러지고 출렁이는 효과(Scale 적용)
      const scaleStrength = length / 1.5;
      fluxLinesRef.current.scale.set(scaleStrength, scaleStrength, 1);
      nPoleRef.current.position.x = 2 * scaleStrength;
      sPoleRef.current.position.x = -2 * scaleStrength;
    } else if (magneticFieldRef.current) {
      magneticFieldRef.current.visible = false;
    }

    // 회전자 회전 (자기장에 이끌려 도는 슬립 현상 모사)
    if (rotorRef.current && length > 0.5) {
      // 결상 시 회전자가 덜덜거리며 잘 돌지 못하는 현상 반영
      const rotationSpeed = speed * length * 0.008;
      rotorRef.current.rotation.z -= rotationSpeed;
    }

    // 자기력선의 출렁임 애니메이션 (내부 크기가 미세하게 진동)
    if (fluxLinesRef.current) {
      const pulse = Math.sin(t * 5) * 0.05;
      fluxLinesRef.current.scale.y = length / 1.5 + pulse;
    }
  });

  return (
    <group>
      {/* 고정자 외부 철제 프레임 */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <tubeGeometry
          args={[new THREE.EllipseCurve(0, 0, 3.6, 3.6), 64, 0.5, 16]}
        />
        <meshStandardMaterial color="#2d3436" metalness={0.4} roughness={0.7} />
      </mesh>

      {/* 3상 6극 코일 배치 */}
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

      {/* 내부 회전자 */}
      <RealisticRotor rotorRef={rotorRef} />

      {/* 동적 자기장 및 N/S극 시각화 그룹 */}
      <group ref={magneticFieldRef}>
        {/* N극 마커 (파란색) */}
        <group ref={nPoleRef}>
          <mesh>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshBasicMaterial color="#3a86ff" />
          </mesh>
          <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
            <Text
              position={[0, 0, 0.4]}
              fontSize={0.3}
              color="white"
              fontWeight="bold"
            >
              N
            </Text>
          </Billboard>
        </group>

        {/* S극 마커 (빨간색) */}
        <group ref={sPoleRef}>
          <mesh>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshBasicMaterial color="#ff006e" />
          </mesh>
          <Billboard follow={true}>
            <Text
              position={[0, 0, 0.4]}
              fontSize={0.3}
              color="white"
              fontWeight="bold"
            >
              S
            </Text>
          </Billboard>
        </group>

        {/* 굽이치는 자기력선 (Magnetic Flux Lines) */}
        <group ref={fluxLinesRef}>
          {/* 안쪽 자기력선 */}
          <mesh>
            <torusGeometry args={[1.0, 0.02, 8, 50, Math.PI]} />
            <meshBasicMaterial
              color="#00f5d4"
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[1.0, 0.02, 8, 50, Math.PI]} />
            <meshBasicMaterial
              color="#00f5d4"
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* 바깥쪽 자기력선 */}
          <mesh>
            <torusGeometry args={[1.6, 0.03, 8, 50, Math.PI]} />
            <meshBasicMaterial
              color="#fca311"
              transparent
              opacity={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[1.6, 0.03, 8, 50, Math.PI]} />
            <meshBasicMaterial
              color="#fca311"
              transparent
              opacity={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>

        {/* 중심 방향 지시 화살표 */}
        <mesh rotation={[0, 0, -Math.PI / 2]} position={[1, 0, 0]}>
          <cylinderGeometry args={[0, 0.15, 0.6, 8]} />
          <meshBasicMaterial color="#ffff00" />
        </mesh>
      </group>
    </group>
  );
};

// 4. 메인 앱 컴포넌트
export default function ThreePhaseinductionMotor() {
  const [speed, setSpeed] = useState(2.5);
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
        backgroundColor: "#15171e",
      }}
    >
      {/* UI 컨트롤 패널 */}
      <div
        style={{
          padding: "20px",
          color: "white",
          backgroundColor: "#222631",
          display: "flex",
          gap: "25px",
          alignItems: "center",
          borderBottom: "1px solid #333",
        }}
      >
        <h3 style={{ margin: 0, paddingRight: "20px" }}>
          3상 유도 모터 시뮬레이터
        </h3>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "14px",
          }}
        >
          회전 속도 (Hz):
          <input
            type="range"
            min="0"
            max="15"
            step="0.5"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
        </label>
        <label
          style={{ color: "#ff4757", fontWeight: "bold", cursor: "pointer" }}
        >
          <input
            type="checkbox"
            checked={phaseA}
            onChange={(e) => setPhaseA(e.target.checked)}
          />{" "}
          A상 (Red)
        </label>
        <label
          style={{ color: "#2ed573", fontWeight: "bold", cursor: "pointer" }}
        >
          <input
            type="checkbox"
            checked={phaseB}
            onChange={(e) => setPhaseB(e.target.checked)}
          />{" "}
          B상 (Green)
        </label>
        <label
          style={{ color: "#1e90ff", fontWeight: "bold", cursor: "pointer" }}
        >
          <input
            type="checkbox"
            checked={phaseC}
            onChange={(e) => setPhaseC(e.target.checked)}
          />{" "}
          C상 (Blue)
        </label>
      </div>

      {/* 3D 뷰어 */}
      <Canvas camera={{ position: [0, -2, 10], fov: 45 }}>
        <color attach="background" args={["#15171e"]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 15]} intensity={1.5} />
        <directionalLight position={[-10, -10, -10]} intensity={0.5} />
        <MotorAssembly
          speed={speed}
          phaseA={phaseA}
          phaseB={phaseB}
          phaseC={phaseC}
        />
        <OrbitControls enableZoom={true} maxPolarAngle={Math.PI / 1.5} />
      </Canvas>
    </div>
  );
}
