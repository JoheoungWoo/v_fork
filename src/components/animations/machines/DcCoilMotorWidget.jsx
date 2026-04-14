import { OrbitControls, Text, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const C = {
  bg: "#0f1117",
  surface: "#1a1d27",
  border: "#2a2e3e",
  text: "#e2e0d8",
  muted: "#7a7872",
  nRed: "#e84040",
  sBlue: "#3b8bd4",
  coil: "#d4900a",
  field: "#9ff7ff",
};

const MY = 2.2;
const MW = 3.2;
const MD = 2.8;
const MT = 0.7;
const INNER_Y = MY - MT / 2;
const CW = 1.8;
const CR = 0.07;

function Wire({ from, to }) {
  const f = new THREE.Vector3(...from);
  const t = new THREE.Vector3(...to);
  const dir = new THREE.Vector3().subVectors(t, f);
  const len = dir.length();
  const mid = f.clone().addScaledVector(dir.clone().normalize(), len / 2);
  const q = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.clone().normalize(),
  );
  return (
    <mesh position={[mid.x, mid.y, mid.z]} quaternion={q} castShadow>
      <cylinderGeometry args={[CR, CR, len, 12]} />
      <meshStandardMaterial color={C.coil} metalness={0.9} roughness={0.12} />
    </mesh>
  );
}

function FieldTube({ x, z }) {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x, INNER_Y, z),
      new THREE.Vector3(x, 0, z),
      new THREE.Vector3(x, -INNER_Y, z),
    ]);
    return new THREE.TubeGeometry(curve, 24, 0.07, 12, false);
  }, [x, z]);
  return (
    <group renderOrder={900}>
      <mesh geometry={geo}>
        <meshBasicMaterial
          color={C.field}
          transparent
          opacity={0.98}
          depthTest={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh geometry={geo}>
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.65}
          depthTest={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function ProceduralMotor({ omegaRad, rotDir }) {
  const coilRef = useRef(null);
  const angleRef = useRef(0);
  const half = CW / 2;
  const depth = 1.2;

  useFrame((_, dt) => {
    angleRef.current += omegaRad * rotDir * dt;
    if (coilRef.current) coilRef.current.rotation.y = angleRef.current;
  });

  return (
    <group>
      <group position={[0, MY, 0]}>
        <mesh castShadow>
          <boxGeometry args={[MW, MT, MD]} />
          <meshStandardMaterial
            color={C.nRed}
            metalness={0.4}
            roughness={0.3}
          />
        </mesh>
        <Text
          position={[0, MT / 2 + 0.1, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.7}
          color="#fff"
        >
          N
        </Text>
      </group>
      <group position={[0, -MY, 0]}>
        <mesh castShadow>
          <boxGeometry args={[MW, MT, MD]} />
          <meshStandardMaterial
            color={C.sBlue}
            metalness={0.4}
            roughness={0.3}
          />
        </mesh>
        <Text
          position={[0, -(MT / 2 + 0.1), 0]}
          rotation={[Math.PI / 2, 0, 0]}
          fontSize={0.7}
          color="#fff"
        >
          S
        </Text>
      </group>

      {[-0.8, -0.3, 0, 0.3, 0.8].map((x) =>
        [-0.7, 0, 0.7].map((z) => <FieldTube key={`${x}-${z}`} x={x} z={z} />),
      )}

      <group ref={coilRef}>
        <Wire from={[-half, 0, depth / 2]} to={[half, 0, depth / 2]} />
        <Wire from={[-half, 0, -depth / 2]} to={[half, 0, -depth / 2]} />
        <Wire from={[half, 0, -depth / 2]} to={[half, 0, depth / 2]} />
        <Wire from={[-half, 0, -depth / 2]} to={[-half, 0, depth / 2]} />
      </group>

      <gridHelper
        args={[20, 30, "#223040", "#1b2330"]}
        position={[0, -3.2, 0]}
      />
    </group>
  );
}

function GlbMotor({
  modelUrl,
  omegaRad,
  rotDir,
  coilObjectName,
  rotAxis = "y",
}) {
  const { scene } = useGLTF(modelUrl);
  const targetRef = useRef(null);
  const angleRef = useRef(0);

  useEffect(() => {
    targetRef.current =
      (coilObjectName && scene.getObjectByName(coilObjectName)) || scene;
  }, [scene, coilObjectName]);

  useFrame((_, dt) => {
    if (!targetRef.current) return;
    const axis = ["x", "y", "z"].includes(rotAxis) ? rotAxis : "y";
    angleRef.current += omegaRad * rotDir * dt;
    targetRef.current.rotation[axis] = angleRef.current;
  });

  return <primitive object={scene} />;
}

export default function DcCoilMotorWidget({ apiData }) {
  const [currentA, setCurrentA] = useState(2);
  const [bTesla, setBTesla] = useState(0.35);
  const [omegaData, setOmegaData] = useState({
    omega_rad_s: 0,
    omega_rpm: 0,
    torque_scale_n_m: 0,
    rotation_direction: 1,
  });

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const u = new URL(
          "/api/machine/dc_coil_motor/omega",
          window.location.origin,
        );
        u.searchParams.set("current_a", String(currentA));
        u.searchParams.set("b_t", String(bTesla));
        const res = await fetch(u.toString());
        if (!res.ok) throw new Error("omega");
        setOmegaData(await res.json());
      } catch {
        const i = Math.abs(currentA);
        const b = Math.abs(bTesla);
        const omega = Math.min(
          72,
          (380 * 12 * 0.012 * i * b) / (1 + 0.18 * i * b + 0.05 * i * i),
        );
        setOmegaData({
          omega_rad_s: omega,
          omega_rpm: (omega * 30) / Math.PI,
          torque_scale_n_m: 12 * 0.012 * i * b,
          rotation_direction: currentA >= 0 ? 1 : -1,
        });
      }
    }, 200);
    return () => clearTimeout(t);
  }, [currentA, bTesla]);

  const omega = omegaData.omega_rad_s ?? 0;
  const rpm = omegaData.omega_rpm ?? 0;
  const torque = omegaData.torque_scale_n_m ?? 0;
  const rotDir = omegaData.rotation_direction ?? 1;
  const modelUrl = apiData?.model_url;

  return (
    <div
      style={{
        background: C.bg,
        color: C.text,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        overflow: "hidden",
        fontFamily: "Segoe UI,sans-serif",
      }}
    >
      <div
        style={{
          padding: 12,
          borderBottom: `1px solid ${C.border}`,
          fontWeight: 600,
        }}
      >
        DC 사각형 코일 모터 (단일 확인용)
      </div>

      <div style={{ height: 460 }}>
        <Canvas
          camera={{ position: [5, 3, 7], fov: 48 }}
          shadows
          gl={{ antialias: true }}
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[4, 6, 5]} intensity={1.4} castShadow />
          <OrbitControls target={[0, 0, 0]} minDistance={4} maxDistance={20} />
          <Suspense fallback={null}>
            {modelUrl ? (
              <GlbMotor
                modelUrl={modelUrl}
                omegaRad={omega}
                rotDir={rotDir}
                coilObjectName={apiData?.coil_object_name}
                rotAxis={apiData?.rotation_axis ?? "y"}
              />
            ) : (
              <ProceduralMotor omegaRad={omega} rotDir={rotDir} />
            )}
          </Suspense>
        </Canvas>
      </div>

      <div style={{ padding: 12, background: C.surface }}>
        <div style={{ marginBottom: 8 }}>전류 I: {currentA.toFixed(2)} A</div>
        <input
          type="range"
          min={-10}
          max={10}
          step={0.1}
          value={currentA}
          onChange={(e) => setCurrentA(Number(e.target.value))}
          style={{ width: "100%", marginBottom: 10 }}
        />
        <div style={{ marginBottom: 8 }}>자기장 B: {bTesla.toFixed(2)} T</div>
        <input
          type="range"
          min={0}
          max={2}
          step={0.01}
          value={bTesla}
          onChange={(e) => setBTesla(Number(e.target.value))}
          style={{ width: "100%" }}
        />
        <div style={{ marginTop: 10, fontSize: 13, color: C.muted }}>
          omega: {omega.toFixed(2)} rad/s | rpm: {Math.round(rpm)} | torque:{" "}
          {torque.toFixed(3)} N·m
        </div>
      </div>
    </div>
  );
}
