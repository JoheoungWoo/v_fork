import { OrbitControls, Stage } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { InductionMotor } from "./InductionMotor"; // 변환된 컴포넌트

function MotorViewer() {
  return (
    <div style={{ width: "100%", height: "500px", background: "#111" }}>
      <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6}>
            {/* 여기에 변환된 모터 모델 배치 */}
            <InductionMotor />
          </Stage>
        </Suspense>
        {/* 사용자가 마우스로 돌려볼 수 있게 함 */}
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}
