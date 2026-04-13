import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";

// 1. 자석 컴포넌트
const Magnet = ({ speed, strength, currentRef }) => {
  const groupRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // 자석의 왕복 운동 (사인파 사용)
    const zPos = Math.sin(t * speed) * 4;
    groupRef.current.position.z = zPos;

    // 유도 전류 계산 (패러데이 법칙 근사치: 속도와 코일 중심부(z=0) 접근 시 최대)
    // v(t) = cos(t * speed) * speed
    const velocity = Math.cos(t * speed) * speed;
    // 코일 근처(-1.5 ~ 1.5)에 있을 때만 전류가 강하게 유도되도록 가중치 적용
    const proximityWeight = Math.max(0, 1 - Math.abs(zPos) / 2);
    const inducedCurrent = velocity * strength * proximityWeight * 10;

    // 부모 컴포넌트의 상태를 업데이트 (계기판 표시용)
    if (currentRef.current) {
      currentRef.current.innerText = inducedCurrent.toFixed(2);
    }
  });

  return (
    <group ref={groupRef}>
      {/* N극 (빨강) */}
      <mesh position={[0, 0, -1]}>
        <boxGeometry args={[0.8, 0.8, 2]} />
        <meshStandardMaterial color="red" />
      </mesh>
      {/* S극 (파랑) */}
      <mesh position={[0, 0, 1]}>
        <boxGeometry args={[0.8, 0.8, 2]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </group>
  );
};

// 2. 코일(솔레노이드) 컴포넌트
const Coil = ({ turns }) => {
  const rings = [];
  const spacing = 0.4;
  const startZ = -(turns * spacing) / 2;

  for (let i = 0; i < turns; i++) {
    rings.push(
      <mesh
        key={i}
        position={[0, 0, startZ + i * spacing]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[1.5, 0.1, 16, 100]} />
        <meshStandardMaterial color="#B87333" /> {/* 구리색 */}
      </mesh>,
    );
  }

  return <group>{rings}</group>;
};

// 3. 메인 앱 컴포넌트
export default function ElectromagneticInductionApp() {
  const [speed, setSpeed] = useState(2);
  const [turns, setTurns] = useState(5);
  const [strength, setStrength] = useState(3);

  // 렌더링 최적화를 위해 전류값은 ref로 직접 DOM을 조작합니다.
  const currentMeterRef = useRef(null);

  return (
    <div
      style={{
        width: "100%",
        height: "min(72vh, 620px)",
        minHeight: 420,
        display: "flex",
        flexDirection: "column",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* 상단 컨트롤 패널 */}
      <div
        style={{
          padding: "14px 16px",
          background: "#2c3e50",
          color: "white",
          display: "flex",
          flexWrap: "wrap",
          gap: "14px",
          alignItems: "center",
        }}
      >
        <div style={{ minWidth: 180 }}>
          <label>자석 이동 속도: {speed}</label>
          <br />
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.5"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
          />
        </div>
        <div style={{ minWidth: 180 }}>
          <label>코일 감은 수: {turns}</label>
          <br />
          <input
            type="range"
            min="1"
            max="15"
            step="1"
            value={turns}
            onChange={(e) => setTurns(parseInt(e.target.value))}
          />
        </div>
        <div style={{ minWidth: 180 }}>
          <label>자석의 세기: {strength}</label>
          <br />
          <input
            type="range"
            min="1"
            max="5"
            step="0.5"
            value={strength}
            onChange={(e) => setStrength(parseFloat(e.target.value))}
          />
        </div>

        {/* 검류계 (Galvanometer) UI */}
        <div
          style={{
            marginLeft: "auto",
            minWidth: 220,
            background: "#34495e",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <h3 style={{ margin: "0 0 6px 0", fontSize: 14 }}>유도 전류 (검류계)</h3>
          <h2 style={{ color: "#2ecc71", margin: 0 }}>
            <span ref={currentMeterRef}>0.00</span> mA
          </h2>
        </div>
      </div>

      {/* 3D 캔버스 영역 */}
      <Canvas style={{ flex: 1 }} camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />

        {/* 코일 (구리선) */}
        <Coil turns={turns} />

        {/* 자석 (애니메이션 적용) */}
        <Magnet
          speed={speed}
          strength={strength}
          currentRef={currentMeterRef}
        />

        {/* 바닥 그리드 및 마우스 컨트롤 */}
        <gridHelper args={[20, 20]} />
        <OrbitControls enableDamping />
      </Canvas>
    </div>
  );
}
