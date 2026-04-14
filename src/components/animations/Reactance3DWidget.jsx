import { Grid, Line, OrbitControls, Text } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";

// 3D 벡터 및 축을 그리는 내부 컴포넌트
const ComplexPlane = ({ f, L, C }) => {
  // 리액턴스 계산 (스케일링을 위해 임의의 상수 적용)
  const w = 2 * Math.PI * f;
  const XL = w * (L / 1000); // 옴 (실제 값)
  const XC = 1 / (w * (C / 1000000)); // 옴 (실제 값)

  // 시각적 표현을 위한 벡터 길이 스케일링
  const scale = 0.1;
  const vecL = XL * scale;
  const vecC = XC * scale;

  return (
    <group>
      {/* 바닥 그리드 (실수축 평면) */}
      <Grid
        infiniteGrid
        fadeDistance={20}
        sectionColor="#aaaaaa"
        cellColor="#dddddd"
      />

      {/* 허수축 (j축) 선 */}
      <Line
        points={[
          [0, -10, 0],
          [0, 10, 0],
        ]}
        color="gray"
        lineWidth={1}
        dashed
      />
      <Text position={[0.5, 9.5, 0]} color="gray" fontSize={0.5}>
        +j
      </Text>
      <Text position={[0.5, -9.5, 0]} color="gray" fontSize={0.5}>
        -j
      </Text>

      {/* 인덕턴스 (jωL) 벡터 - 위쪽(y축 양의 방향) */}
      <Line
        points={[
          [0, 0, 0],
          [0, vecL, 0],
        ]}
        color="blue"
        lineWidth={5}
      />
      <mesh position={[0, vecL, 0]}>
        <coneGeometry args={[0.3, 0.6, 16]} />
        <meshBasicMaterial color="blue" />
      </mesh>
      <Text position={[1, vecL / 2, 0]} color="blue" fontSize={0.6}>
        jωL ({XL.toFixed(1)}Ω)
      </Text>

      {/* 커패시턴스 (1/jωC) 벡터 - 아래쪽(y축 음의 방향) */}
      <Line
        points={[
          [0, 0, 0],
          [0, -vecC, 0],
        ]}
        color="red"
        lineWidth={5}
      />
      <mesh position={[0, -vecC, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.3, 0.6, 16]} />
        <meshBasicMaterial color="red" />
      </mesh>
      <Text position={[1, -vecC / 2, 0]} color="red" fontSize={0.6}>
        1/jωC ({XC.toFixed(1)}Ω)
      </Text>
    </group>
  );
};

export default function Reactance3DWidget() {
  const [f, setF] = useState(60); // 주파수 (Hz)
  const [L, setL] = useState(50); // 인덕턴스 (mH)
  const [C, setC] = useState(100); // 커패시턴스 (uF)

  return (
    <div
      style={{
        width: "100%",
        height: "600px",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f8fafc",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      {/* 컨트롤 패널 */}
      <div
        style={{
          padding: "20px",
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: "200px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            주파수 (f): {f} Hz
          </label>
          <input
            type="range"
            min="10"
            max="1000"
            value={f}
            onChange={(e) => setF(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
              color: "blue",
            }}
          >
            인덕턴스 (L): {L} mH
          </label>
          <input
            type="range"
            min="1"
            max="200"
            value={L}
            onChange={(e) => setL(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
              color: "red",
            }}
          >
            커패시턴스 (C): {C} μF
          </label>
          <input
            type="range"
            min="10"
            max="500"
            value={C}
            onChange={(e) => setC(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>
      </div>

      {/* 3D 캔버스 영역 */}
      <div style={{ flex: 1 }}>
        <Canvas camera={{ position: [10, 5, 15], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1} />
          <ComplexPlane f={f} L={L} C={C} />
          <OrbitControls makeDefault />
        </Canvas>
      </div>
    </div>
  );
}
