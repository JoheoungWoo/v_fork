import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Line, Text, Cylinder } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// --- 경로 데이터 정의 ---
const PATH_POSITIVE = [
  new THREE.Vector3(-4.8, 1.8, 0), new THREE.Vector3(-1.8, 1.8, 0),
  new THREE.Vector3(0, 3.4, 0),    new THREE.Vector3(2.5, 1.8, 0),
  new THREE.Vector3(4.2, 1.8, 0),  new THREE.Vector3(4.2, -1.8, 0),
  new THREE.Vector3(2.5, -1.8, 0), new THREE.Vector3(0, -3.4, 0),
  new THREE.Vector3(-1.8, -1.8, 0), new THREE.Vector3(-4.8, -1.8, 0)
];
const PATH_NEGATIVE = [
  new THREE.Vector3(-4.8, -1.8, 0), new THREE.Vector3(-1.8, -1.8, 0),
  new THREE.Vector3(-1.8, 1.8, 0),  new THREE.Vector3(0, 3.4, 0),
  new THREE.Vector3(2.5, 1.8, 0),  new THREE.Vector3(4.2, 1.8, 0),
  new THREE.Vector3(4.2, -1.8, 0), new THREE.Vector3(2.5, -1.8, 0),
  new THREE.Vector3(0, -3.4, 0),   new THREE.Vector3(-1.8, -1.8, 0)
];

// --- 1. 빛나는 전류 파티클 (기존 동일) ---
function GlowingParticles({ phase, amplitude }) {
  const meshRef = useRef();
  const count = 30;
  const positiveCurve = useMemo(() => new THREE.CatmullRomCurve3(PATH_POSITIVE), []);
  const negativeCurve = useMemo(() => new THREE.CatmullRomCurve3(PATH_NEGATIVE), []);
  const [progresses] = useState(() => Array.from({ length: count }, (_, i) => i / count));
  
  const isPositiveHalf = Math.sin(phase) >= 0;
  const flowSpeed = 0.005 + amplitude * 0.015;

  useFrame(() => {
    if (!meshRef.current) return;
    const curve = isPositiveHalf ? positiveCurve : negativeCurve;
    const dummy = new THREE.Object3D();

    progresses.forEach((t, i) => {
      progresses[i] += flowSpeed;
      if (progresses[i] > 1) progresses[i] = 0;
      const pos = curve.getPointAt(progresses[i]);
      dummy.position.copy(pos);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshBasicMaterial color="#ffffaa" toneMapped={false} />
    </instancedMesh>
  );
}

// --- 2. 3D 메인 씬 (다이오드 표시 방식 수정) ---
function BridgeScene({ phase, amplitude, capacitorEnabled }) {
  const isPositiveHalf = Math.sin(phase) >= 0;
  const currentIntensity = Math.abs(Math.sin(phase)) * amplitude;
  
  const activeColor = "#00d45a";
  const idleColor = "#8d97ab";
  
  const loadGlowIntensity = capacitorEnabled 
    ? amplitude * 3.5 // 커패시터 ON: 안정적인 전력 공급
    : currentIntensity * 4; // 커패시터 OFF: 맥류에 따른 깜빡임

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[10, 10, 10]} intensity={1.2} />
      <directionalLight position={[-8, -6, 8]} intensity={0.65} />
      <OrbitControls enablePan={false} maxDistance={20} minDistance={5} />

      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.2} radius={0.4} />
      </EffectComposer>

      {/* 배선 */}
      <Line points={PATH_POSITIVE} color="#6f7788" lineWidth={1.2} />
      <Line points={PATH_NEGATIVE} color="#6f7788" lineWidth={1.2} />
      <Line points={isPositiveHalf ? PATH_POSITIVE : PATH_NEGATIVE} color="#55aaff" lineWidth={3} toneMapped={false} />

      {/* 부하 (Load) */}
      <group position={[5.15, 0, 0]}>
        <Box args={[1.6, 4.5, 0.7]}>
          <meshPhysicalMaterial color="#be6b24" emissive="#ff8a2b" emissiveIntensity={loadGlowIntensity} roughness={0.2} metalness={0.7} toneMapped={false}/>
        </Box>
        <Text position={[0, 2.9, 0.5]} fontSize={0.35} color="#f6f9ff">Load</Text>
      </group>

      {/* 평활 커패시터 */}
      <group position={[2.5, 0, 0]}>
        <Cylinder args={[0.6, 0.6, 3, 32]}>
          <meshPhysicalMaterial 
            color={capacitorEnabled ? "#2f7bff" : "#6e7688"} 
            emissive={capacitorEnabled ? "#00aaff" : "#000000"} 
            emissiveIntensity={capacitorEnabled ? 1.5 : 0} 
            transparent={true} opacity={capacitorEnabled ? 1.0 : 0.75}
            roughness={0.3} metalness={0.6} toneMapped={false}
          />
        </Cylinder>
        <Text position={[0, 2.0, 0.5]} fontSize={0.35} color={capacitorEnabled ? "#ffffff" : "#8d96ab"}>
          Capacitor
        </Text>
        <Line points={[[0, 1.5, 0], [0, 1.8, 0]]} color={capacitorEnabled ? "#55aaff" : "#6f7788"} lineWidth={2} toneMapped={false}/>
        <Line points={[[0, -1.5, 0], [0, -1.8, 0]]} color={capacitorEnabled ? "#55aaff" : "#6f7788"} lineWidth={2} toneMapped={false}/>
      </group>

      {/* AC 전원 소스 */}
      <group position={[-6.25, 0, 0]}>
        <Cylinder args={[0.8, 0.8, 4.6, 32]}>
          <meshPhysicalMaterial color="#2f7bff" roughness={0.3} metalness={0.6} />
        </Cylinder>
        <Text position={[0, 2.9, 0.9]} fontSize={0.4} color="#f6f9ff">AC In</Text>
      </group>

      {/* ★ 다이오드 표시 로직 수정 (조건부 렌더링 대신 불투명도 조절 사용) ★ */}
      {[
        { id: "D1", pos: [0, 3.4, 0], rot: [0, 0, -Math.PI / 4], active: isPositiveHalf },
        { id: "D4", pos: [0, -3.4, 0], rot: [0, 0, Math.PI / 4], active: isPositiveHalf },
        { id: "D2", pos: [-1.8, -1.8, 0], rot: [0, 0, Math.PI / 4], active: !isPositiveHalf },
        { id: "D3", pos: [-1.8, 1.8, 0], rot: [0, 0, -Math.PI / 4], active: !isPositiveHalf }
      ].map((d) => (
        <group position={d.pos} key={d.id}>
          <Box args={[1.2, 0.6, 0.6]} rotation={d.rot}>
            <meshPhysicalMaterial 
              color={d.active ? activeColor : idleColor} // 색상 변경
              emissive={d.active ? activeColor : "#000"} // 꺼짐 시 발광 없음
              emissiveIntensity={d.active ? 2 : 0}
              transparent={true} // 투명도 활성화
              opacity={d.active ? 1.0 : 0.55}
              roughness={0.4} 
              metalness={0.8} 
              toneMapped={false}
            />
          </Box>
          <Text 
            position={[0, d.rot[2] > 0 ? -0.8 : 0.8, 0.4]} 
            fontSize={0.35} 
            color={d.active ? "#ffffff" : "#8a93a8"}
          >
            {d.id}
          </Text>
        </group>
      ))}

      <GlowingParticles phase={phase} amplitude={amplitude} />
    </>
  );
}

// --- 3. 오실로스코프형 하단 파형 패널 (기존 동일) ---
function WaveformPanel({ phase, amplitude, frequency, capacitorEnabled, capacitance }) {
  const width = 1000, height = 180, centerY = 90;
  const ampPx = 60 * amplitude;
  const points = 250;
  const inPoints = [], outPoints = [];
  
  let markerInputY = centerY, markerOutputY = centerY;
  const viewWindowRads = Math.PI * 4;
  const dt_angle = viewWindowRads / points; 
  const tau = capacitance * 0.015; 
  const dt_sec = dt_angle / (2 * Math.PI * frequency); 
  const decay = Math.exp(-dt_sec / tau); 

  let vCap = 0; 
  for(let i = 0; i < 100; i++) {
    const angle = phase - viewWindowRads - (100 - i) * dt_angle;
    const vAc = Math.abs(Math.sin(angle)) * ampPx;
    if (vAc > vCap) vCap = vAc; else vCap *= decay;
  }

  for (let i = 0; i < points; i++) {
    const x = 40 + (i / (points - 1)) * (width - 80);
    const angle = phase - viewWindowRads + i * dt_angle;
    const vAc = Math.abs(Math.sin(angle)) * ampPx;
    const vIn = Math.sin(angle) * ampPx;
    inPoints.push(`${x},${centerY - vIn}`);

    if (capacitorEnabled) {
      if (vAc >= vCap) vCap = vAc; else vCap *= decay;
      outPoints.push(`${x},${centerY - vCap}`);
      if (i === points - 1) markerOutputY = centerY - vCap;
    } else {
      outPoints.push(`${x},${centerY - vAc}`);
      if (i === points - 1) markerOutputY = centerY - vAc;
    }
    if (i === points - 1) markerInputY = centerY - vIn;
  }

  const markerX = width - 40; 

  return (
    <div style={{ padding: "20px", background: "#1e222b", color: "#d9dfeb", borderTop: "2px solid #363d4b" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <strong style={{ fontSize: "16px" }}>오실로스코프 파형 관찰</strong>
        <span style={{ color: "#a0abbe" }}>{capacitorEnabled ? "맥동률(리플) 감소됨 (충·방전 상태)" : "전파 정류된 맥류 파형 (Pulsating DC)"}</span>
      </div>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
        <line x1="40" y1={centerY} x2={width - 40} y2={centerY} stroke="#5a6375" strokeWidth="2" strokeDasharray="5,5" />
        <polyline fill="none" stroke="#007bff" strokeWidth="2" opacity="0.55" points={inPoints.join(" ")} />
        <polyline fill="none" stroke="#ff3333" strokeWidth="4" points={outPoints.join(" ")} style={{ transition: 'all 0.1s' }} />
        <circle cx={markerX} cy={markerInputY} r="5" fill="#007bff" />
        <circle cx={markerX} cy={markerOutputY} r="6" fill="#ffffff" stroke="#ff3333" strokeWidth="2" />
        <text x="50" y="30" fill="#007bff" fontSize="14" fontWeight="bold">입력 AC</text>
        <text x="50" y="55" fill="#ff3333" fontSize="14" fontWeight="bold">출력 DC {capacitorEnabled ? '(평활됨)' : ''}</text>
      </svg>
    </div>
  );
}

// --- 4. 메인 위젯 레이아웃 (기존 동일) ---
export default function FaintDiodeWidget() {
  const [frequency, setFrequency] = useState(1.0);
  const [amplitude, setAmplitude] = useState(0.8);
  const [capacitorEnabled, setCapacitorEnabled] = useState(false);
  const [capacitance, setCapacitance] = useState(50);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let rafId;
    let lastTime = performance.now();
    const tick = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      setPhase((p) => p + dt * frequency * Math.PI * 2);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [frequency]);

  return (
    <div style={{ width: "100%", fontFamily: "sans-serif", borderRadius: "12px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.4)", border: "1px solid #3a4150" }}>
      {/* 컨트롤 패널 */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", padding: "20px", background: "#2a2f3a", color: "#d8deea", alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: "20px", color: "#79a8ff", width: "100%", borderBottom: "1px solid #474f60", paddingBottom: "10px" }}>
          브리지 정류기 & 평활 회로
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexGrow: 1 }}>
          <button onClick={() => setCapacitorEnabled(!capacitorEnabled)} style={{ padding: "10px 20px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", border: "none", borderRadius: "6px", backgroundColor: capacitorEnabled ? "#2876ff" : "#626d84", color: "white", transition: "0.2s" }}>
            {capacitorEnabled ? "커패시터 ON" : "커패시터 OFF"}
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label style={{ color: capacitorEnabled ? "#d8deea" : "#8b95aa" }}>용량 (C):</label>
          <input type="range" min="10" max="150" step="5" value={capacitance} disabled={!capacitorEnabled} onChange={(e) => setCapacitance(Number(e.target.value))} style={{ opacity: capacitorEnabled ? 1 : 0.45 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label>주파수 (Hz):</label>
          <input type="range" min="0.5" max="3.0" step="0.1" value={frequency} onChange={(e) => setFrequency(Number(e.target.value))} />
        </div>
      </div>

      {/* 3D 캔버스 영역 */}
      <div style={{ height: "450px", background: "#242933" }}>
        <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
          <color attach="background" args={["#242933"]} />
          <BridgeScene phase={phase} amplitude={amplitude} capacitorEnabled={capacitorEnabled} />
        </Canvas>
      </div>

      {/* 오실로스코프 파형 영역 */}
      <WaveformPanel phase={phase} amplitude={amplitude} frequency={frequency} capacitorEnabled={capacitorEnabled} capacitance={capacitance} />
    </div>
  );
}