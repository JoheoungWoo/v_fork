import { forwardRef } from "react";

/**
 * 유도전동기 위젯용 기하 모델(고정자 + 회전자).
 * highlight / onPartPick으로 외부 패널·클릭과 연동합니다.
 * 회전 축은 Z — ref는 회전자 그룹에만 연결됩니다.
 */
const MotorModel = forwardRef(function MotorModel(
  { highlight = null, onPartPick, ...groupProps },
  ref,
) {
  const pickStator = (e) => {
    e.stopPropagation();
    onPartPick?.("stator");
  };
  const pickRotor = (e) => {
    e.stopPropagation();
    onPartPick?.("rotor");
  };

  const statorGlow = highlight === "stator";
  const rotorGlow = highlight === "rotor";

  return (
    <group {...groupProps}>
      <mesh
        castShadow
        receiveShadow
        rotation={[Math.PI / 2, 0, 0]}
        onPointerDown={pickStator}
      >
        <cylinderGeometry args={[0.92, 0.92, 1.05, 40]} />
        <meshStandardMaterial
          color="#475569"
          metalness={0.42}
          roughness={0.52}
          emissive={statorGlow ? "#1d4ed8" : "#000000"}
          emissiveIntensity={statorGlow ? 0.32 : 0}
        />
      </mesh>
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, 0.52]}
        onPointerDown={pickStator}
      >
        <cylinderGeometry args={[0.22, 0.22, 0.08, 24]} />
        <meshStandardMaterial
          color="#334155"
          metalness={0.5}
          roughness={0.45}
          emissive={statorGlow ? "#1e40af" : "#000000"}
          emissiveIntensity={statorGlow ? 0.25 : 0}
        />
      </mesh>
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, -0.52]}
        onPointerDown={pickStator}
      >
        <cylinderGeometry args={[0.22, 0.22, 0.08, 24]} />
        <meshStandardMaterial
          color="#334155"
          metalness={0.5}
          roughness={0.45}
          emissive={statorGlow ? "#1e40af" : "#000000"}
          emissiveIntensity={statorGlow ? 0.25 : 0}
        />
      </mesh>

      <group ref={ref}>
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]} onPointerDown={pickRotor}>
          <cylinderGeometry args={[0.48, 0.48, 0.88, 32]} />
          <meshStandardMaterial
            color="#b45309"
            metalness={0.38}
            roughness={0.42}
            emissive={rotorGlow ? "#ea580c" : "#000000"}
            emissiveIntensity={rotorGlow ? 0.5 : 0}
          />
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
            onPointerDown={pickRotor}
          >
            <boxGeometry args={[0.1, 0.1, 0.75]} />
            <meshStandardMaterial
              color="#ca8a04"
              metalness={0.55}
              roughness={0.35}
              emissive={rotorGlow ? "#fbbf24" : "#000000"}
              emissiveIntensity={rotorGlow ? 0.35 : 0}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
});

export default MotorModel;
