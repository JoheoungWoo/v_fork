import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";

import { BONE_NAMES, FINGER_ORDER, FLEX_CONFIG } from "./leftHandBoneConfig.js";

export const LEFT_HAND_GLB_URL = "/models/LeftHand.glb";

/**
 * @param {{ values?: Record<string, number> } & import('@react-three/fiber').GroupProps} props
 */
export default function LeftHandModel({ values = {}, ...props }) {
  const { scene } = useGLTF(LEFT_HAND_GLB_URL);
  const boneMap = useRef({});

  useLayoutEffect(() => {
    boneMap.current = {};
    scene.traverse((child) => {
      if (child.type !== "Bone" || !child.name.startsWith("Bone_")) return;
      boneMap.current[child.name] = child;
      if (!child.userData.__restEuler) {
        child.userData.__restEuler = {
          x: child.rotation.x,
          y: child.rotation.y,
          z: child.rotation.z,
        };
      }
    });
  }, [scene]);

  useFrame(() => {
    for (const finger of FINGER_ORDER) {
      const t = (values[finger] ?? 0) / 100;
      const cfg = FLEX_CONFIG[finger];
      const names = BONE_NAMES[finger];
      if (!cfg || !names) continue;
      names.forEach((boneName, i) => {
        const bone = boneMap.current[boneName];
        if (!bone) return;
        const rest = bone.userData.__restEuler;
        if (!rest) return;
        const angle = cfg.sign * t * cfg.maxRad[i];
        bone.rotation.x = rest.x + (cfg.axis === "x" ? angle : 0);
        bone.rotation.y = rest.y + (cfg.axis === "y" ? angle : 0);
        bone.rotation.z = rest.z + (cfg.axis === "z" ? angle : 0);
      });
    }
  });

  return <primitive object={scene} {...props} dispose={null} />;
}

useGLTF.preload(LEFT_HAND_GLB_URL);
