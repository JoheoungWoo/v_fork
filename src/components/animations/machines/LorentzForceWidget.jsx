/**
 * LorentzForceWidget.jsx
 *
 * 로렌츠 힘(플레밍의 왼손 법칙) 시뮬레이션
 * 전원 ON/OFF 스위치 및 실시간 전류 입자 흐름(Particle) 시각화 추가.
 */

import { OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";
import * as THREE from "three";

const Y_AXIS = new THREE.Vector3(0, 1, 0);
const _dir = new THREE.Vector3();
const _quat = new THREE.Quaternion();

import "katex/dist/katex.min.css";
import { BlockMath, InlineMath } from "react-katex";

// 🎨 라이트 테마 색상
const C = {
  bg: "#ffffff",
  surface: "#f8f9fa",
  surfaceLight: "#ffffff",
  border: "#dee2e6",
  text: "#212529",
  muted: "#6c757d",
  vectorI: "#fd7e14", // 전류: 오렌지
  vectorB: "#0d6efd", // 자기장: 파랑
  vectorF: "#198754", // 힘: 초록
  magnetN: "#dc3545", // N극
  magnetS: "#0a58ca", // S극
  copper: "#b87333", // 구리색
  powerOn: "#198754", // 전원 켜짐
  powerOff: "#dc3545", // 전원 꺼짐
};

/**
 * drei에는 Arrow가 없음 — 실린더+원뿔(+Y 기준 회전)
 */
function VectorArrow({
  vectorsRef,
  vectorKey,
  color,
  length,
  label,
  position = [0, 0, 0],
  visible = true,
}) {
  const groupRef = useRef(null);
  const shaftR = length * 0.04;
  const headLen = length * 0.22;
  const shaftLen = Math.max(0.05, length - headLen);
  const tipY = shaftLen / 2 + headLen / 2;

  useFrame(() => {
    const d = vectorsRef.current[vectorKey];
    _dir.set(d[0], d[1], d[2]);
    if (_dir.lengthSq() < 1e-10) _dir.set(0, 1, 0);
    _dir.normalize();
    _quat.setFromUnitVectors(Y_AXIS, _dir);
    if (groupRef.current) groupRef.current.quaternion.copy(_quat);
  });

  return (
    <group position={position} visible={visible}>
      <group ref={groupRef}>
        <mesh position={[0, shaftLen / 2, 0]} castShadow>
          <cylinderGeometry args={[shaftR, shaftR, shaftLen, 12]} />
          <meshStandardMaterial color={color} metalness={0.2} roughness={0.5} />
        </mesh>
        <mesh position={[0, shaftLen / 2 + headLen / 2, 0]} castShadow>
          <coneGeometry args={[shaftR * 2.2, headLen, 12]} />
          <meshStandardMaterial color={color} metalness={0.2} roughness={0.5} />
        </mesh>
        <Text
          position={[0, tipY + 0.3, 0]}
          fontSize={0.4}
          color={color}
          fontWeight="bold"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </group>
    </group>
  );
}

/**
 * 💡 새로운 기능: 전류 흐름 입자(Particle) 시각화
 * 전원이 켜지면 레일 -> 구리봉 -> 레일 경로로 노란색 구체들이 흘러갑니다.
 */
function CurrentParticles({ isPowerOn, currentDir, rodX }) {
  const particlesCount = 20;
  const particleRefs = useRef([]);
  const phase = useRef(0);

  // 입자가 흐를 ㄷ자 형태의 3D 경로 생성
  const path = [
    new THREE.Vector3(rodX, -0.15, 3), // 시작 레일 깊은 곳
    new THREE.Vector3(rodX, -0.15, 1.0), // 앞쪽 레일
    new THREE.Vector3(rodX, 0, 1.0), // 구리봉 진입
    new THREE.Vector3(rodX, 0, -1.0), // 구리봉 반대편
    new THREE.Vector3(rodX, -0.15, -1.0), // 뒤쪽 레일
    new THREE.Vector3(rodX, -0.15, -3), // 끝 레일 깊은 곳
  ];

  const sample = (t) => {
    const segs = path.length - 1;
    const wrapped = ((t % 1) + 1) % 1;
    let s = wrapped * segs;

    // 전류 방향이 -Z(앞에서 뒤)면 경로를 반대로(뒤에서 앞) 타야 함
    if (currentDir === "-Z") {
      s = segs - s;
    }

    const i = Math.floor(s);
    const f = s - i;
    const a = path[i];
    const b = path[Math.min(i + 1, path.length - 1)];
    return a.clone().lerp(b, f);
  };

  useFrame((_, dt) => {
    if (!isPowerOn) return;

    phase.current += dt * 0.5; // 흐르는 속도

    for (let i = 0; i < particlesCount; i++) {
      const r = particleRefs.current[i];
      if (!r) continue;
      // 입자들을 경로 위에 일정 간격으로 분산
      const p = sample(phase.current + i / particlesCount);
      r.position.set(p.x, p.y, p.z);
    }
  });

  return (
    <group visible={isPowerOn}>
      {Array.from({ length: particlesCount }).map((_, i) => (
        <mesh key={i} ref={(el) => (particleRefs.current[i] = el)}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#ffe66d" />
        </mesh>
      ))}
    </group>
  );
}

/**
 * 💡 핵심 물리 엔진 및 3D 모델
 */
function LorentzSimulation({
  isPowerOn,
  currentI,
  currentDir,
  magnetB,
  magnetDir,
  rodL,
  rodM,
  setMetrics,
  resetFlag,
}) {
  const rodRef = useRef(null);
  const vectorsRef = useRef({
    i: [0, 0, 1],
    b: [0, -1, 0],
    f: [1, 0, 0],
  });

  const positionX = useRef(0);
  const velocityX = useRef(0);
  const angleZ = useRef(0);

  if (resetFlag && rodRef.current) {
    positionX.current = 0;
    velocityX.current = 0;
    angleZ.current = 0;
  }

  useFrame((_, dt) => {
    const iDir = currentDir === "+Z" ? 1 : -1;
    const bDir = magnetDir === "N→S" ? 1 : -1;

    // 전원이 꺼져있으면 전류(I)는 0이 됨
    const activeCurrent = isPowerOn ? currentI : 0;

    const forceMag = magnetB * activeCurrent * rodL;
    const forceDir = iDir * bDir;
    const accelX = (forceMag * forceDir) / rodM;

    const dragFactor = 0.98; // 약간의 저항

    velocityX.current += accelX * dt;
    velocityX.current *= dragFactor;
    positionX.current += velocityX.current * dt;

    if (Math.abs(positionX.current) > 4.5) {
      velocityX.current = 0;
      positionX.current = Math.sign(positionX.current) * 4.5;
    }

    if (rodRef.current) {
      rodRef.current.position.x = positionX.current;

      if (Math.abs(velocityX.current) > 0.01) {
        angleZ.current -= (velocityX.current * dt) / 0.15; // 반지름에 맞춘 회전
        rodRef.current.rotation.z = angleZ.current;
      }
    }

    const iVector = [0, 0, iDir];
    const bVector = [0, bDir * -1, 0];
    const fVector = [forceDir, 0, 0];
    vectorsRef.current = { i: iVector, b: bVector, f: fVector };

    setMetrics({
      activeI: activeCurrent, // 현재 실제 흐르는 전류 (0 또는 설정값)
      F: forceMag * forceDir,
      a: accelX,
      x: positionX.current,
      iVector,
      bVector,
      fVector,
    });
  });

  const isNTop = magnetDir === "N→S";

  return (
    <group>
      {/* 금속 레일 */}
      <mesh position={[0, -0.15, 1.0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 10, 16]} />
        <meshStandardMaterial color="#adb5bd" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.15, -1.0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 10, 16]} />
        <meshStandardMaterial color="#adb5bd" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* 자석 */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[4, 2, 3]} />
        <meshStandardMaterial
          color={isNTop ? C.magnetN : C.magnetS}
          metalness={0.2}
          roughness={0.8}
        />
        <Text
          position={[2.1, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          fontSize={1}
          color="white"
          fontWeight="bold"
        >
          {isNTop ? "N" : "S"}
        </Text>
      </mesh>
      <mesh position={[0, -2.5, 0]}>
        <boxGeometry args={[4, 2, 3]} />
        <meshStandardMaterial
          color={isNTop ? C.magnetS : C.magnetN}
          metalness={0.2}
          roughness={0.8}
        />
        <Text
          position={[2.1, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          fontSize={1}
          color="white"
          fontWeight="bold"
        >
          {isNTop ? "S" : "N"}
        </Text>
      </mesh>

      {/* 전류 입자 애니메이션 (전원 ON 시 표시됨) */}
      {/* 구리봉의 현재 X 좌표를 전달하여 입자가 봉을 따라 흐르도록 함 */}
      <CurrentParticles
        isPowerOn={isPowerOn}
        currentDir={currentDir}
        rodX={rodRef.current ? rodRef.current.position.x : 0}
      />

      {/* 구리봉 */}
      <mesh
        ref={rodRef}
        position={[0, 0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.15, 0.15, rodL, 32]} />
        <meshStandardMaterial
          color={C.copper}
          metalness={0.6}
          roughness={0.3}
        />

        {/* 벡터 화살표 */}
        <Suspense fallback={null}>
          <VectorArrow
            vectorsRef={vectorsRef}
            vectorKey="b"
            color={C.vectorB}
            length={1.5}
            label="자기장(B)"
          />
          <VectorArrow
            vectorsRef={vectorsRef}
            vectorKey="i"
            color={C.vectorI}
            length={1.5}
            label="전류(I)"
            position={[0, rodL / 2 + 0.3, 0]}
            visible={isPowerOn}
          />
          <VectorArrow
            vectorsRef={vectorsRef}
            vectorKey="f"
            color={C.vectorF}
            length={1.5}
            label="힘(F)"
            visible={isPowerOn}
          />
        </Suspense>
      </mesh>
    </group>
  );
}

export default function LorentzForceWidget() {
  const [isPowerOn, setIsPowerOn] = useState(false); // 💡 전원 상태
  const [currentI, setCurrentI] = useState(5.0);
  const [currentDir, setCurrentDir] = useState("+Z");
  const [magnetB, setMagnetB] = useState(1.0);
  const [magnetDir, setMagnetDir] = useState("N→S");
  const [resetFlag, setResetFlag] = useState(false);

  const rodL = 2.0;
  const rodM = 0.5;

  const [metrics, setMetrics] = useState({
    activeI: 0,
    F: 0,
    a: 0,
    x: 0,
    iVector: [0, 0, 1],
    bVector: [0, -1, 0],
    fVector: [1, 0, 0],
  });

  const handleReset = () => {
    setResetFlag(true);
    setTimeout(() => setResetFlag(false), 50);
  };

  return (
    <div
      style={{
        background: C.bg,
        color: C.text,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        overflow: "hidden",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          padding: 12,
          background: C.surface,
          borderBottom: `1px solid ${C.border}`,
          fontWeight: 600,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>로렌츠 힘 시뮬레이션 (전원 제어 및 입자 시각화)</span>
        <span style={{ fontSize: 14, color: C.muted, fontWeight: "normal" }}>
          <InlineMath math="\vec{F} = I(\vec{L} \times \vec{B})" />
        </span>
      </div>

      {/* 3D 캔버스 */}
      <div style={{ height: 400, position: "relative" }}>
        <Canvas
          camera={{ position: [5, 4, 6], fov: 50 }}
          shadows
          gl={{ antialias: true }}
        >
          <color attach="background" args={["#f1f3f5"]} />
          <ambientLight intensity={1.5} />
          <directionalLight
            position={[10, 15, 10]}
            intensity={1.2}
            castShadow
          />
          <OrbitControls target={[0, 0, 0]} minDistance={3} maxDistance={20} />
          <Suspense fallback={null}>
            <LorentzSimulation
              isPowerOn={isPowerOn}
              currentI={currentI}
              currentDir={currentDir}
              magnetB={magnetB}
              magnetDir={magnetDir}
              rodL={rodL}
              rodM={rodM}
              setMetrics={setMetrics}
              resetFlag={resetFlag}
            />
          </Suspense>
        </Canvas>

        {/* 💡 캔버스 우측 하단에 메인 전원 스위치 오버레이 */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            right: 16,
            background: "rgba(255,255,255,0.9)",
            padding: "10px 16px",
            borderRadius: 8,
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ fontWeight: "bold", color: C.text }}>메인 전원</span>
          <button
            onClick={() => setIsPowerOn(!isPowerOn)}
            style={{
              padding: "8px 24px",
              fontSize: 16,
              fontWeight: "bold",
              color: "white",
              cursor: "pointer",
              border: "none",
              borderRadius: 6,
              background: isPowerOn ? C.powerOn : C.powerOff,
              boxShadow: isPowerOn ? `0 0 10px ${C.powerOn}` : "none",
            }}
          >
            {isPowerOn ? "ON (전류 흐름)" : "OFF (차단됨)"}
          </button>
        </div>
      </div>

      {/* 컨트롤 패널 */}
      <div
        style={{
          padding: 20,
          background: C.surfaceLight,
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}
      >
        {/* 전류 조절 */}
        <div
          style={{ opacity: isPowerOn ? 1 : 0.5, transition: "opacity 0.3s" }}
        >
          <div
            style={{
              marginBottom: 8,
              fontSize: 14,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>
              전류 크기 (<strong style={{ color: C.vectorI }}>I</strong>):{" "}
              <strong>{currentI.toFixed(1)} A</strong>
            </span>
            <button
              onClick={handleReset}
              style={{ fontSize: 12, padding: "2px 8px", cursor: "pointer" }}
            >
              초기 위치로
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={currentI}
            onChange={(e) => setCurrentI(Number(e.target.value))}
            style={{ width: "100%", accentColor: C.vectorI }}
            disabled={!isPowerOn}
          />
          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button
              onClick={() => setCurrentDir("+Z")}
              disabled={!isPowerOn}
              style={{
                background: currentDir === "+Z" ? C.vectorI : C.surface,
                color: currentDir === "+Z" ? "white" : C.text,
                border: `1px solid ${C.border}`,
                flex: 1,
                padding: "6px",
                fontSize: 13,
                cursor: isPowerOn ? "pointer" : "default",
                borderRadius: "4px",
              }}
            >
              +Z 방향 (뒤→앞)
            </button>
            <button
              onClick={() => setCurrentDir("-Z")}
              disabled={!isPowerOn}
              style={{
                background: currentDir === "-Z" ? C.vectorI : C.surface,
                color: currentDir === "-Z" ? "white" : C.text,
                border: `1px solid ${C.border}`,
                flex: 1,
                padding: "6px",
                fontSize: 13,
                cursor: isPowerOn ? "pointer" : "default",
                borderRadius: "4px",
              }}
            >
              -Z 방향 (앞→뒤)
            </button>
          </div>
        </div>

        {/* 자기장 조절 */}
        <div>
          <div
            style={{
              marginBottom: 8,
              fontSize: 14,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>
              자기장 세기 (<strong style={{ color: C.vectorB }}>B</strong>):{" "}
              <strong>{magnetB.toFixed(2)} T</strong>
            </span>
            <span style={{ fontSize: 12, color: C.muted }}>
              L={rodL}m, m={rodM}kg
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.05"
            value={magnetB}
            onChange={(e) => setMagnetB(Number(e.target.value))}
            style={{ width: "100%", accentColor: C.vectorB }}
          />
          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button
              onClick={() => setMagnetDir("N→S")}
              style={{
                background: magnetDir === "N→S" ? C.vectorB : C.surface,
                color: magnetDir === "N→S" ? "white" : C.text,
                border: `1px solid ${C.border}`,
                flex: 1,
                padding: "6px",
                fontSize: 13,
                cursor: "pointer",
                borderRadius: "4px",
              }}
            >
              N 위, S 아래 (↓B)
            </button>
            <button
              onClick={() => setMagnetDir("S→N")}
              style={{
                background: magnetDir === "S→N" ? C.vectorB : C.surface,
                color: magnetDir === "S→N" ? "white" : C.text,
                border: `1px solid ${C.border}`,
                flex: 1,
                padding: "6px",
                fontSize: 13,
                cursor: "pointer",
                borderRadius: "4px",
              }}
            >
              S 위, N 아래 (↑B)
            </button>
          </div>
        </div>
      </div>

      {/* 수식 풀이 과정 */}
      <div
        style={{
          padding: "20px 24px",
          background: C.surface,
          fontSize: 15,
          lineHeight: "1.8",
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            fontSize: 14,
            color: C.text,
            marginBottom: 16,
            borderBottom: `2px solid ${C.border}`,
            paddingBottom: 8,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>📝 실시간 물리량 계산 과정 (플레밍의 왼손 법칙)</span>
          {!isPowerOn && (
            <span style={{ color: C.powerOff }}>[전원 차단됨 - 전류 0A]</span>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <span style={{ color: C.muted, fontWeight: "bold", fontSize: 13 }}>
            ① 현재 발생 힘 계산 (F = B × I × L):
          </span>
          <BlockMath
            math={`F = ${magnetB.toFixed(2)} \\cdot \\mathbf{\\color{${isPowerOn ? C.vectorI : C.powerOff}}{${metrics.activeI.toFixed(2)}}} \\cdot ${rodL.toFixed(1)} = \\mathbf{\\color{${isPowerOn ? C.vectorF : C.muted}}{${Math.abs(metrics.F).toFixed(2)}} \\text{ N}}`}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <span style={{ color: C.muted, fontWeight: "bold", fontSize: 13 }}>
            ② 가속도 계산 (a = F / m):
          </span>
          <BlockMath
            math={`a = \\frac{${Math.abs(metrics.F).toFixed(2)}}{${rodM.toFixed(1)}} = \\mathbf{${Math.abs(metrics.a).toFixed(3)} \\text{ m/s}^2}`}
          />
        </div>

        {isPowerOn ? (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: C.bg,
              borderLeft: `4px solid ${C.vectorF}`,
              borderRadius: 4,
              fontSize: 14,
            }}
          >
            <strong style={{ color: C.text }}>
              ✅ 플레밍의 왼손 법칙 방향 확인:
            </strong>
            <br />
            검지(<strong style={{ color: C.vectorB }}>B</strong>)를 {magnetDir},
            중지(<strong style={{ color: C.vectorI }}>I</strong>)를 {currentDir}{" "}
            방향으로 향하면,
            <br />
            엄지(<strong style={{ color: C.vectorF }}>F</strong>)가 가리키는{" "}
            <strong>
              {metrics.F > 0 ? "+X 방향 (오른쪽)" : "-X 방향 (왼쪽)"}
            </strong>
            으로 구리봉이 힘을 받습니다.
          </div>
        ) : (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: "rgba(220, 53, 69, 0.1)",
              color: C.powerOff,
              borderLeft: `4px solid ${C.powerOff}`,
              borderRadius: 4,
              fontSize: 14,
            }}
          >
            ⚠️ <strong>전원이 꺼져 있습니다.</strong> 전류(I)가 흐르지 않아
            구리봉이 자기장 속에 있어도 힘을 받지 않습니다.
          </div>
        )}
      </div>
    </div>
  );
}
