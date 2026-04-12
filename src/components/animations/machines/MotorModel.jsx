import { forwardRef } from "react";

/**
 * 유도전동기 위젯용 단순 기하 모델(고정자 + 회전자).
 * 회전 축은 Z — InductionMotorWidget의 useFrame이 ref.rotation.z를 갱신합니다.
 */
const MotorModel = forwardRef(function MotorModel(_, ref) {
  return (
    <group>
      <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.92, 0.92, 1.05, 40]} />
        <meshStandardMaterial color="#475569" metalness={0.42} roughness={0.52} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.52]}>
        <cylinderGeometry args={[0.22, 0.22, 0.08, 24]} />
        <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.45} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.52]}>
        <cylinderGeometry args={[0.22, 0.22, 0.08, 24]} />
        <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.45} />
      </mesh>

      <group ref={ref}>
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.48, 0.48, 0.88, 32]} />
          <meshStandardMaterial color="#b45309" metalness={0.38} roughness={0.42} />
        </mesh>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh
            key={i}
            castShadow
            rotation={[Math.PI / 2, 0, 0]}
            position={[
              Math.cos((i / 6) * Math.PI * 2) * 0.38,
              Math.sin((i / 6) * Math.PI * 2) * 0.38,
              0,
            ]}
          >
            <boxGeometry args={[0.1, 0.1, 0.75]} />
            <meshStandardMaterial color="#ca8a04" metalness={0.55} roughness={0.35} />
          </mesh>
        ))}
      </group>
    </group>
  );
});

export default MotorModel;
