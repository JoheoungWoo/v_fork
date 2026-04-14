import { Tube } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

// 자기력선(N극 -> S극) 렌더링 컴포넌트
const MagneticFieldLines = ({ b_tesla }) => {
  // 밝은 형광 느낌: B가 커질수록 선이 두껍고 선명해짐
  const strength = Math.max(0, Number(b_tesla) || 0);
  const opacity = Math.min(1, 0.55 + strength * 0.35);
  const radius = 0.06 + Math.min(0.08, strength * 0.04);

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
    <group renderOrder={1000}>
      {lines.map((path, idx) => (
        // args: [path, tubularSegments, radius, radialSegments, closed]
        <group key={idx}>
          <Tube args={[path, 24, radius, 10, false]}>
            <meshBasicMaterial
              color="#4fe5ff"
              transparent
              opacity={opacity}
              depthWrite={false}
              depthTest={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </Tube>
          {/* 안쪽 코어를 더 밝게 겹쳐서 발광처럼 보이게 */}
          <Tube args={[path, 24, radius * 0.45, 8, false]}>
            <meshBasicMaterial
              color="#d8fbff"
              transparent
              opacity={Math.min(1, opacity + 0.1)}
              depthWrite={false}
              depthTest={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </Tube>
        </group>
      ))}
    </group>
  );
};

export default MagneticFieldLines;
