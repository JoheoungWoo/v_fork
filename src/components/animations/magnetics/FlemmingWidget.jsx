import { Environment, Html, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo, useState } from "react";
import * as THREE from "three";

// 기존에 export default로 수정하신 3D 모터 모델을 불러옵니다.
import Flemming from "./Flemming";

/**
 * 💡 1. 3D 공간에 벡터 화살표와 텍스트 라벨을 그려주는 헬퍼 컴포넌트
 */
function PhysicsArrow({ dir, origin, length, color, label }) {
  // 방향 벡터를 정규화(Normalize)하여 길이를 1로 맞춤
  const direction = useMemo(() => new THREE.Vector3(...dir).normalize(), [dir]);
  const start = useMemo(() => new THREE.Vector3(...origin), [origin]);

  return (
    <group>
      {/* Three.js의 ArrowHelper를 R3F 구조에 맞게 원시 객체로 삽입 */}
      <primitive
        object={
          new THREE.ArrowHelper(direction, start, length, color, 0.4, 0.2)
        }
      />

      {/* 화살표 끝부분에 라벨(B, I, F) 렌더링 */}
      <Html
        position={[
          origin[0] + dir[0] * (length + 0.3),
          origin[1] + dir[1] * (length + 0.3),
          origin[2] + dir[2] * (length + 0.3),
        ]}
        center
      >
        <div
          style={{
            color: color,
            fontWeight: "900",
            fontSize: "1.2rem",
            letterSpacing: "-0.5px",
            textShadow:
              "2px 2px 4px rgba(255,255,255,0.9), -2px -2px 4px rgba(255,255,255,0.9)",
            pointerEvents: "none", // 마우스 드래그 방해 방지
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}

/**
 * 💡 2. 메인 플레밍의 왼손 법칙 위젯 컴포넌트
 */
export default function FlemmingWidget() {
  // 전류(I)와 자기장(B)의 방향 상태 관리 (1은 정방향, -1은 역방향)
  const [dirI, setDirI] = useState(1);
  const [dirB, setDirB] = useState(-1);

  // 벡터 외적 계산 (F = I x B)
  // 편의상 전류를 X축, 자기장을 Z축으로 설정
  const vectorI = [dirI, 0, 0];
  const vectorB = [0, 0, dirB];

  // 외적 규칙에 따른 힘(F)의 방향 (Y축) 계산
  // X x Z = -Y 이므로, (dirI * dirB)의 음수값이 Y축 방향이 됩니다.
  const vectorF = [0, -dirI * dirB, 0];

  return (
    <div
      style={{
        width: "100%",
        height: "500px",
        position: "relative",
        backgroundColor: "#f8fafc",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #e2e8f0",
      }}
    >
      {/* 3D 캔버스 영역 */}
      <Canvas camera={{ position: [3, 4, 6], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />

        <Suspense
          fallback={
            <Html center>
              <div style={{ fontWeight: "bold", color: "#64748b" }}>
                Loading 3D Model...
              </div>
            </Html>
          }
        >
          {/* 모터 3D 모델 */}
          <Flemming />

          {/* 벡터 화살표 그룹 (모델의 중앙인 y=0.5 부근에서 시작하도록 origin 조정) */}
          <group position={[0, 0.5, 0]}>
            <PhysicsArrow
              dir={vectorB}
              origin={[0, 0, 0]}
              length={2.2}
              color="#2563eb"
              label="B (자기장)"
            />
            <PhysicsArrow
              dir={vectorI}
              origin={[0, 0, 0]}
              length={2.2}
              color="#dc2626"
              label="I (전류)"
            />
            {/* 힘(F) 화살표는 결과를 보여주므로 눈에 띄게 더 굵거나 길게 표현 */}
            <PhysicsArrow
              dir={vectorF}
              origin={[0, 0, 0]}
              length={2.8}
              color="#16a34a"
              label="F (전자기력)"
            />
          </group>
        </Suspense>

        <OrbitControls enablePan={true} minDistance={3} maxDistance={12} />
        <Environment preset="city" />
      </Canvas>

      {/* 💡 3. 하단 인터랙티브 조작 버튼 */}
      <div
        style={{
          position: "absolute",
          bottom: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "12px",
          zIndex: 10,
        }}
      >
        <button
          onClick={() => setDirI((prev) => prev * -1)}
          style={{
            padding: "10px 20px",
            background: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            transition: "transform 0.1s",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          🔄 전류(I) 방향 반전
        </button>
        <button
          onClick={() => setDirB((prev) => prev * -1)}
          style={{
            padding: "10px 20px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            transition: "transform 0.1s",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          🔄 자기장(B) 반전
        </button>
      </div>
    </div>
  );
}
