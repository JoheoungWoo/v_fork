import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";

export const LEFT_HAND_GLB_URL = "/models/left_hand.glb";

/**
 * @param {{ values: Record<string, number> } & import('@react-three/fiber').GroupProps} props
 */
export default function LeftHandModel({ values, ...props }) {
  // 🔍 수정 포인트: nodes를 구조 분해 할당에 추가합니다.
  const { scene, nodes } = useGLTF(LEFT_HAND_GLB_URL);

  const boneMap = useRef({});

  useEffect(() => {
    // 이제 nodes가 정의되었으므로 에러가 사라집니다.
    console.log("로드된 전체 노드 데이터:", nodes);
    console.log("씬(Scene) 데이터:", scene);
  }, [nodes, scene]);
  // useLayoutEffect(() => {
  //   boneMap.current = {};
  //   scene.traverse((child) => {
  //     if (child.type !== "Bone" || !child.name.startsWith("Bone_")) return;
  //     boneMap.current[child.name] = child;
  //     if (!child.userData.__restEuler) {
  //       child.userData.__restEuler = {
  //         x: child.rotation.x,
  //         y: child.rotation.y,
  //         z: child.rotation.z,
  //       };
  //     }
  //   });
  // }, [scene]);

  useFrame(() => {
    // for (const finger of FINGER_ORDER) {
    //   const t = (values[finger] ?? 0) / 100;
    //   const cfg = FLEX_CONFIG[finger];
    //   const names = BONE_NAMES[finger];
    //   names.forEach((boneName, i) => {
    //     const bone = boneMap.current[boneName];
    //     if (!bone) return;
    //     const rest = bone.userData.__restEuler;
    //     if (!rest) return;
    //     const angle = cfg.sign * t * cfg.maxRad[i];
    //     bone.rotation.x = rest.x + (cfg.axis === "x" ? angle : 0);
    //     bone.rotation.y = rest.y + (cfg.axis === "y" ? angle : 0);
    //     bone.rotation.z = rest.z + (cfg.axis === "z" ? angle : 0);
    //   });
    // }
  });

  return <primitive object={scene} {...props} dispose={null} />;
}

useGLTF.preload(LEFT_HAND_GLB_URL);
