import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// 고정자의 코일(상)을 렌더링하는 컴포넌트
const Coil = ({ position, rotation, color, label }) => {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <cylinderGeometry args={[0.2, 0.2, 1, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
};

// 회전 자기장 (중앙의 화살표) 및 전체 로직을 처리하는 컴포넌트
const MagneticField = ({ speed, phaseA, phaseB, phaseC }) => {
  const arrowRef = useRef();

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
  });

  return (
    <group>
      {/* 3상 코일 배치 */}
      <Coil position={[3, 0, 0]} rotation={[0, 0, Math.PI / 2]} color="red" />
      <Coil
        position={[-1.5, 2.6, 0]}
        rotation={[0, 0, -Math.PI / 6]}
        color="green"
      />
      <Coil
        position={[-1.5, -2.6, 0]}
        rotation={[0, 0, Math.PI / 6]}
        color="blue"
      />

      {/* 고정자 외함 (Stator Ring) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.5, 0.2, 16, 100]} />
        <meshStandardMaterial color="gray" />
      </mesh>

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
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
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
