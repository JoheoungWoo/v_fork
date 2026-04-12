/*
 * gltfjsx 변환 모델: 고정자(Stator) + 회전자(Rotor) + 구리 권선 메쉬
 * 원본: /flemming.glb (Stator / Rotor 노드명 유지)
 */
import { useGLTF } from "@react-three/drei";
import { forwardRef } from "react";

const MotorModel = forwardRef(function MotorModel(props, rotorRef) {
  const { nodes, materials } = useGLTF("/flemming.glb");

  return (
    <group {...props} dispose={null}>
      <group name="Scene">
        <mesh
          name="Stator"
          geometry={nodes.Stator.geometry}
          material={materials.Iron}
        />
        <mesh
          ref={rotorRef}
          name="Rotor"
          geometry={nodes.Rotor.geometry}
          material={materials.Alum}
        />
        <mesh
          name="Cylinder"
          geometry={nodes.Cylinder.geometry}
          material={materials.Copper}
          position={[0.66, 0, 0]}
        />
        <mesh
          name="Cylinder001"
          geometry={nodes.Cylinder001.geometry}
          material={materials.Copper}
          position={[-0.33, 0, -0.572]}
        />
        <mesh
          name="Cylinder002"
          geometry={nodes.Cylinder002.geometry}
          material={materials.Copper}
          position={[-0.33, 0, 0.572]}
        />
      </group>
    </group>
  );
});

useGLTF.preload("/flemming.glb");

export default MotorModel;
