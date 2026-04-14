import { Tube } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

// 자기력선(N극 -> S극) 렌더링 컴포넌트
export default MagneticFieldLines = ({ b_tesla }) => {
  // B(자속밀도) 값에 따라 선의 투명도나 굵기를 동적으로 조절할 수 있습니다.
  const opacity = Math.min(Math.max(b_tesla, 0.2), 0.8);

  const lines = useMemo(() => {
    const paths = [];
    // N극에서 S극으로 가는 가상의 튜브 경로 5개 생성 (X축 방향으로 흐른다고 가정)
    for (let i = 0; i < 5; i++) {
      const yOffset = (i - 2) * 0.8; // 위아래 간격 벌리기
      const points = [
        new THREE.Vector3(-5, yOffset, 0), // N극 위치 (예시)
        new THREE.Vector3(5, yOffset, 0), // S극 위치 (예시)
      ];
      paths.push(new THREE.CatmullRomCurve3(points));
    }
    return paths;
  }, []);

  return (
    <group>
      {lines.map((path, idx) => (
        // args: [path, tubularSegments, radius, radialSegments, closed]
        <Tube key={idx} args={[path, 20, 0.05, 8, false]}>
          {/* meshBasicMaterial: 조명을 무시하고 항상 설정한 색상(형광 파랑)으로 빛남 */}
          <meshBasicMaterial
            color="#00ffff"
            transparent={true}
            opacity={opacity}
            depthWrite={false} // 코일 뒤에 가려져도 자연스럽게 보이도록 처리
          />
        </Tube>
      ))}
    </group>
  );
};
