/**
 * LorentzForceWidget.jsx
 *
 * 플레밍의 왼손 법칙 (단일 구리봉 상하 운동 + 전원/입자 시각화 통합 버전)
 */

import { Arrow, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";
import * as THREE from "three";

import "katex/dist/katex.min.css";
import { BlockMath, InlineMath } from "react-katex";

const C = {
  bg: "#ffffff",
  surface: "#f8f9fa",
  surfaceLight: "#ffffff",
  border: "#dee2e6",
  text: "#212529",
  muted: "#6c757d",
  vectorI: "#fd7e14",
  vectorB: "#0d6efd",
  vectorF: "#198754",
  magnetN: "#dc3545",
  magnetS: "#0a58ca",
  copper: "#b87333",
  powerOn: "#198754",
  powerOff: "#dc3545",
};

/**
 * 벡터 화살표 컴포넌트
 */
function VectorArrow({
  direction,
  color,
  length,
  label,
  position = [0, 0, 0],
  visible = true,
}) {
  const dirVec = useRef(new THREE.Vector3());

  useFrame(() => {
    dirVec.current.set(...direction).normalize();
  });

  return (
    <group position={position} visible={visible}>
      <Arrow
        args={[dirVec.current, new THREE.Vector3(0, 0, 0), length, color]}
        headLength={length * 0.3}
        headWidth={length * 0.15}
      />
      <Text
        position={[
          direction[0] * length * 1.1,
          direction[1] * length * 1.1,
          direction[2] * length * 1.1,
        ]}
        fontSize={0.4}
        color={color}
        fontWeight="bold"
      >
        {label}
      </Text>
    </group>
  );
}

/**
 * 💡 전류 흐름 입자(Particle) 시각화 - 구리봉 내부 관통 (Z축 직선)
 */
function CurrentParticles({ isPowerOn, currentDir, rodL, rodY }) {
  const particlesCount = 15;
  const particleRefs = useRef([]);
  const phase = useRef(0);

  // 구리봉을 따라 흐르는 직선 경로 (Z축 기준 -3.5 에서 +3.5 정도)
  const pathStart = -rodL * 0.8;
  const pathEnd = rodL * 0.8;

  useFrame((_, dt) => {
    if (!isPowerOn) return;

    // 전류 방향에 따라 위상(phase) 증감 방향 설정
    const dirMult = currentDir === "+Z" ? 1 : -1;
    phase.current += dt * 0.6 * dirMult;

    for (let i = 0; i < particlesCount; i++) {
      const r = particleRefs.current[i];
      if (!r) continue;

      // 0~1 사이로 정규화된 진행도
      const t = (((phase.current + i / particlesCount) % 1) + 1) % 1;

      // Z축 좌표 계산 (선형 보간)
      const currentZ = pathStart + (pathEnd - pathStart) * t;

      // 입자 위치 세팅 (Y는 구리봉과 함께 움직임, X=0, Z는 흐름)
      r.position.set(0, rodY, currentZ);
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
 * 💡 핵심 물리 엔진 (상하 운동) 및 3D 모델
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

  const positionY = useRef(0);
  const velocityY = useRef(0);

  if (resetFlag && rodRef.current) {
    positionY.current = 0;
    velocityY.current = 0;
  }

  useFrame((_, dt) => {
    // 1. 방향 추출
    // 전류 I: +Z(앞으로 나옴), -Z(뒤로 들어감)
    const iDir = currentDir === "+Z" ? 1 : -1;
    // 자기장 B: +X(좌->우), -X(우->좌)
    const bDir = magnetDir === "N→S" ? 1 : -1;

    // 전원이 꺼져있으면 실제 흐르는 전류는 0
    const activeCurrent = isPowerOn ? currentI : 0;

    // 2. 힘의 크기 (F = IBL)
    const forceMag = magnetB * activeCurrent * rodL;

    // 3. 힘의 방향 (플레밍의 왼손 법칙: I x B -> Y축)
    const forceDir = iDir * bDir;

    // 4. 가속도 (a = F / m)
    const accelY = (forceMag * forceDir) / rodM;

    // 공기 저항(무한 가속 방지)
    const dragFactor = 0.95;

    // 5. 속도 및 위치 적분
    velocityY.current += accelY * dt;
    velocityY.current *= dragFactor;
    positionY.current += velocityY.current * dt;

    // 6. 상하 한계점 (자석을 뚫고 나가지 않게)
    if (Math.abs(positionY.current) > 2.5) {
      velocityY.current = 0;
      positionY.current = Math.sign(positionY.current) * 2.5;
    }

    // 7. 모델 위치 업데이트
    if (rodRef.current) {
      rodRef.current.position.y = positionY.current;
    }

    // 8. 패널용 데이터 전달
    setMetrics({
      activeI: activeCurrent,
      F: forceMag * forceDir,
      a: accelY,
      y: positionY.current,
      iVector: [0, 0, iDir],
      bVector: [bDir, 0, 0],
      fVector: [0, forceDir, 0],
    });
  });

  const isNLeft = magnetDir === "N→S";

  return (
    <group>
      {/* 왼쪽 자석 */}
      <mesh position={[-2.5, 0, 0]}>
        <boxGeometry args={[1.5, 3, 3]} />
        <meshStandardMaterial
          color={isNLeft ? C.magnetN : C.magnetS}
          metalness={0.2}
          roughness={0.8}
        />
        <Text
          position={[0.8, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          fontSize={1}
          color="white"
          fontWeight="bold"
        >
          {isNLeft ? "N" : "S"}
        </Text>
      </mesh>

      {/* 오른쪽 자석 */}
      <mesh position={[2.5, 0, 0]}>
        <boxGeometry args={[1.5, 3, 3]} />
        <meshStandardMaterial
          color={isNLeft ? C.magnetS : C.magnetN}
          metalness={0.2}
          roughness={0.8}
        />
        <Text
          position={[-0.8, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          fontSize={1}
          color="white"
          fontWeight="bold"
        >
          {isNLeft ? "S" : "N"}
        </Text>
      </mesh>

      {/* 전류 입자 애니메이션 (전원 ON 시 구리봉과 함께 Y축 상하 이동) */}
      <CurrentParticles
        isPowerOn={isPowerOn}
        currentDir={currentDir}
        rodL={rodL}
        rodY={rodRef.current ? rodRef.current.position.y : 0}
      />

      {/* 단일 구리봉 (Z축으로 평행) */}
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
            direction={setMetrics.bVector || [1, 0, 0]}
            color={C.vectorB}
            length={1.5}
            label="자기장(B)"
          />
          {/* 전원 꺼지면 전류, 힘 화살표 숨김 */}
          <VectorArrow
            direction={setMetrics.iVector || [0, 0, 1]}
            color={C.vectorI}
            length={1.5}
            label="전류(I)"
            position={[0, rodL / 2, 0]}
            visible={isPowerOn}
          />
          <VectorArrow
            direction={setMetrics.fVector || [0, 1, 0]}
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
  const [isPowerOn, setIsPowerOn] = useState(false);
  const [currentI, setCurrentI] = useState(5.0);
  const [currentDir, setCurrentDir] = useState("+Z");
  const [magnetB, setMagnetB] = useState(1.0);
  const [magnetDir, setMagnetDir] = useState("N→S");
  const [resetFlag, setResetFlag] = useState(false);

  const rodL = 4.0; // 💡 길이 연장
  const rodM = 0.5;

  const [metrics, setMetrics] = useState({
    activeI: 0,
    F: 0,
    a: 0,
    y: 0,
    iVector: [0, 0, 1],
    bVector: [1, 0, 0],
    fVector: [0, 1, 0],
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
        <span>로렌츠 힘 (플레밍의 왼손 법칙) 상하 운동 시뮬레이션</span>
        <span style={{ fontSize: 14, color: C.muted, fontWeight: "normal" }}>
          <InlineMath math="\vec{F} = I(\vec{L} \times \vec{B})" />
        </span>
      </div>

      {/* 3D 캔버스 */}
      <div style={{ height: 400, position: "relative" }}>
        {/* 카메라 위치 약간 수정 (상하 운동이 잘 보이도록) */}
        <Canvas
          camera={{ position: [5, 5, 8], fov: 50 }}
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

        {/* 💡 전원 스위치 오버레이 */}
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
              가운데로 초기화
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
              N(좌) → S(우)
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
              S(좌) ← N(우)
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
              {metrics.F > 0
                ? "위쪽 (상승)"
                : metrics.F < 0
                  ? "아래쪽 (하강)"
                  : "정지"}
            </strong>{" "}
            방향으로 구리봉이 힘을 받아 이동합니다.
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
