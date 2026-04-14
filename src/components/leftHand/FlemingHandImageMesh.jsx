import { Billboard } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

/**
 * @param {{
 *   map: THREE.Texture,
 *   baseHeight?: number,
 *   euler?: [number, number, number],
 *   billboard?: boolean,
 * } & import('@react-three/fiber').GroupProps} props
 */
export default function FlemingHandImageMesh({
  map,
  baseHeight = 0.11,
  euler = [0, 0, 0],
  billboard = true,
  ...groupProps
}) {
  const [planeW, planeH] = useMemo(() => {
    const img = map.image;
    const iw = img?.width ?? 1;
    const ih = img?.height ?? 1;
    const aspect = iw / ih;
    const h = baseHeight;
    return [aspect * h, h];
  }, [map, baseHeight]);

  const plane = (
    <mesh rotation={euler}>
      <planeGeometry args={[planeW, planeH]} />
      <meshBasicMaterial
        map={map}
        transparent
        alphaTest={0.07}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );

  return (
    <group {...groupProps}>
      {billboard ? (
        <Billboard follow lockX={false} lockY={false} lockZ={false}>
          {plane}
        </Billboard>
      ) : (
        plane
      )}
    </group>
  );
}
