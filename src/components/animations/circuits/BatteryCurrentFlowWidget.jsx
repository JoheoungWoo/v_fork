import { Line, OrbitControls, PerspectiveCamera, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

function Battery({ position }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.43, 0.43, 0.8, 48]} />
        <meshStandardMaterial color="#c69159" metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh castShadow position={[0, -0.42, 0]}>
        <cylinderGeometry args={[0.43, 0.43, 0.92, 48]} />
        <meshStandardMaterial color="#161616" metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.83, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.08, 32]} />
        <meshStandardMaterial color="#c7ccd4" metalness={1} roughness={0.18} />
      </mesh>
      <Text position={[0, 0.3, 0.44]} fontSize={0.28} color="#1f1f1f" anchorX="center" anchorY="middle">
        +
      </Text>
    </group>
  );
}

function LightBulb({ intensity }) {
  const glow = Math.max(0.35, intensity);
  return (
    <group position={[3.95, -0.02, 0]}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.62, 48, 48]} />
        <meshStandardMaterial
          color="#fff2a8"
          emissive="#ffd23f"
          emissiveIntensity={glow * 3.4}
          transparent
          opacity={0.88}
          roughness={0.1}
        />
      </mesh>
      <mesh position={[-0.64, -0.02, 0]}>
        <cylinderGeometry args={[0.22, 0.28, 0.62, 32]} />
        <meshStandardMaterial color="#7b5a1d" metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={[-0.37, 0.04, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.18, 0.03, 12, 48, Math.PI * 1.2]} />
        <meshStandardMaterial color="#ffef91" emissive="#ffef91" emissiveIntensity={glow * 2} />
      </mesh>
      <pointLight intensity={glow * 16} color="#ffd54a" distance={8} />
    </group>
  );
}

function AnimatedPath({ points, baseColor, flowColor, active, width = 8, speed = 1.4 }) {
  const materialRef = useRef();
  const dashedMaterial = useMemo(
    () =>
      new THREE.LineDashedMaterial({
        color: flowColor,
        dashSize: 0.16,
        gapSize: 0.1,
        linewidth: 1,
      }),
    [flowColor],
  );

  useFrame((_, delta) => {
    if (active && materialRef.current) {
      materialRef.current.dashOffset -= delta * speed;
    }
  });

  return (
    <>
      <Line points={points} color={baseColor} lineWidth={width} />
      <Line
        ref={materialRef}
        points={points}
        lineWidth={width * 0.52}
        dashed
        dashSize={0.16}
        gapSize={0.1}
        color={flowColor}
        material={dashedMaterial}
      />
    </>
  );
}

function ParallelCircuitScene() {
  const topMainPath = useMemo(
    () => [
      [-0.6, 1.18, 0],
      [-0.6, 1.62, 0],
      [2.45, 1.62, 0],
      [2.95, 1.1, 0],
      [2.95, 0.32, 0],
    ],
    [],
  );
  const topBridgePath = useMemo(
    () => [
      [0.6, 1.18, 0],
      [0.6, 1.62, 0],
      [1.18, 1.62, 0],
    ],
    [],
  );
  const bottomMainPath = useMemo(
    () => [
      [-0.6, -1.28, 0],
      [-0.6, -1.82, 0],
      [3.9, -1.82, 0],
      [3.9, -0.42, 0],
      [3.28, -0.42, 0],
    ],
    [],
  );
  const bottomBridgePath = useMemo(
    () => [
      [0.6, -1.28, 0],
      [0.6, -1.82, 0],
      [0.12, -1.82, 0],
    ],
    [],
  );

  return (
    <group position={[-0.55, 0, 0]}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 6, 7]} intensity={1.5} castShadow />
      <directionalLight position={[-4, -2, 3]} intensity={0.55} />

      <Battery position={[-0.6, 0, 0]} />
      <Battery position={[0.6, 0, 0]} />
      <LightBulb intensity={0.95} />

      <AnimatedPath points={topMainPath} baseColor="#ef4e4e" flowColor="#69ff5b" active />
      <AnimatedPath points={topBridgePath} baseColor="#ef4e4e" flowColor="#69ff5b" active />
      <AnimatedPath points={bottomMainPath} baseColor="#22c55e" flowColor="#69ff5b" active speed={-1.4} />
      <AnimatedPath points={bottomBridgePath} baseColor="#22c55e" flowColor="#69ff5b" active speed={-1.4} />
    </group>
  );
}

export default function BatteryCurrentFlowWidget() {
  const [showLabel] = useState(true);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "720px",
        position: "relative",
        overflow: "hidden",
        borderRadius: "20px",
        background:
          "radial-gradient(circle at 50% 35%, #1d5ed6 0%, #1245aa 32%, #0b317e 72%, #09285f 100%)",
        boxShadow: "0 18px 40px rgba(5, 15, 50, 0.35)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          opacity: 0.28,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 24,
          left: 0,
          width: "100%",
          zIndex: 2,
          color: "#ffffff",
          textAlign: "center",
          textShadow: "0 2px 8px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ fontSize: "clamp(34px, 5vw, 56px)", fontWeight: 800, letterSpacing: "-1px" }}>
          How Batteries Work
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: "clamp(24px, 3.6vw, 38px)",
            fontWeight: 700,
          }}
        >
          Parallel
        </div>
        <div
          style={{
            marginTop: 26,
            marginLeft: "max(24px, 6vw)",
            textAlign: "left",
            fontSize: "clamp(20px, 3vw, 28px)",
            fontWeight: 800,
            color: "#ffe44d",
          }}
        >
          Total Voltage = 1.5V
        </div>
      </div>

      {showLabel && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: 118,
            zIndex: 2,
            color: "#ffe44d",
            fontSize: "clamp(22px, 3vw, 30px)",
            fontWeight: 800,
            textShadow: "0 2px 8px rgba(0,0,0,0.25)",
          }}
        >
          Path Merges
        </div>
      )}

      <div style={{ height: "720px" }}>
        <Canvas shadows dpr={[1, 2]}>
          <color attach="background" args={["#1245aa"]} />
          <PerspectiveCamera makeDefault position={[0.15, 0.08, 8.4]} fov={42} />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 2.2}
            maxPolarAngle={Math.PI / 1.9}
          />

          <ParallelCircuitScene />

          <EffectComposer>
            <Bloom
              intensity={1.8}
              luminanceThreshold={0.15}
              luminanceSmoothing={0.85}
              mipmapBlur
            />
          </EffectComposer>
        </Canvas>
      </div>
    </div>
  );
}
