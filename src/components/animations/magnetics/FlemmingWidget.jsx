import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
// 앞서 export default로 수정한 모델을 불러옵니다.
import Flemming from "./Flemming";

export default function FlemmingWidget() {
  return (
    // Canvas가 들어갈 부모 컨테이너의 크기를 반드시 지정해야 합니다.
    <div style={{ width: "100%", height: "500px" }}>
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
        {/* 기본 조명 설정 */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        {/* 비동기 3D 모델 로딩을 위한 Suspense 처리 */}
        <Suspense fallback={null}>
          <Flemming />
        </Suspense>

        {/* 마우스나 터치로 3D 모델을 돌려볼 수 있게 해주는 컨트롤 */}
        <OrbitControls />
        {/* 금속 재질(Copper, Alum 등)의 반사를 살려주는 환경광 */}
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
