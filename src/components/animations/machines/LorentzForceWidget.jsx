/**
 * LorentzForceWidget.jsx
 *
 * 플레밍의 왼손 법칙 교과서 기본 구도 (단일 구리봉 상하 운동)
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
  magnetN: "#dc3545", // N극: 빨강
  magnetS: "#0a58ca", // S극: 진한 파랑
  copper: "#b87333", // 구리
};

/**
 * drei에는 Arrow가 없음 — 로컬 +Y 축 실린더+원뿔로 방향 표시
 */
function VectorArrow({
  vectorsRef,
  vectorKey,
  color,
  length,
  label,
  position = [0, 0, 0],
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
    <group position={position}>
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
 * 💡 핵심: 1개의 구리봉 상하 운동 물리 엔진
 */
function LorentzSimulation({
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
    b: [1, 0, 0],
    f: [0, 1, 0],
  });

  // Y축(위/아래) 위치와 속도 저장
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

    // 2. 힘의 크기 (F = IBL)
    const forceMag = magnetB * currentI * rodL;

    // 3. 힘의 방향 (플레밍의 왼손 법칙: I x B)
    // Z축(전류) x X축(자기장) = Y축(힘, 위/아래)
    const forceDir = iDir * bDir;

    // 4. 가속도 (a = F / m)
    const accelY = (forceMag * forceDir) / rodM;

    // 공기 저항(마찰)을 주어 끝없이 가속하지 않도록 제어
    const dragFactor = 0.95;

    // 5. 속도 및 위치 적분
    velocityY.current += accelY * dt;
    velocityY.current *= dragFactor;
    positionY.current += velocityY.current * dt;

    // 6. 화면 밖으로 날아가지 않도록 리미트 설정 (상하 한계점)
    if (Math.abs(positionY.current) > 2.5) {
      velocityY.current = 0;
      positionY.current = Math.sign(positionY.current) * 2.5;
    }

    // 7. 3D 구리봉 모델 Y축 위치 업데이트
    if (rodRef.current) {
      rodRef.current.position.y = positionY.current;
    }

    const iVector = [0, 0, iDir];
    const bVector = [bDir, 0, 0];
    const fVector = [0, forceDir, 0];
    vectorsRef.current = { i: iVector, b: bVector, f: fVector };

    // 8. 패널에 띄워줄 데이터 전달
    setMetrics({
      F: forceMag * forceDir,
      a: accelY,
      y: positionY.current,
      iVector,
      bVector,
      fVector,
    });
  });

  const isNLeft = magnetDir === "N→S";

  return (
    <group>
      {/* 💡 교과서 구도: 자석을 좌(-X) 우(+X)에 배치 */}
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

      {/* 💡 오직 1개의 구리봉만 Z축(앞뒤)으로 공중에 배치 */}
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

        {/* 벡터 화살표 (봉과 함께 상하로 이동) */}
        <Suspense fallback={null}>
          <VectorArrow
            vectorsRef={vectorsRef}
            vectorKey="i"
            color={C.vectorI}
            length={1.5}
            label="전류(I)"
            position={[0, rodL / 2, 0]}
          />
          <VectorArrow
            vectorsRef={vectorsRef}
            vectorKey="b"
            color={C.vectorB}
            length={1.5}
            label="자기장(B)"
          />
          <VectorArrow
            vectorsRef={vectorsRef}
            vectorKey="f"
            color={C.vectorF}
            length={1.5}
            label="힘(F)"
          />
        </Suspense>
      </mesh>
    </group>
  );
}

export default function LorentzForceWidget() {
  const [currentI, setCurrentI] = useState(5.0);
  const [currentDir, setCurrentDir] = useState("+Z");
  const [magnetB, setMagnetB] = useState(1.0);
  const [magnetDir, setMagnetDir] = useState("N→S");
  const [resetFlag, setResetFlag] = useState(false);

  const rodL = 2.0;
  const rodM = 0.5;

  const [metrics, setMetrics] = useState({
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
        <span>로렌츠 힘 시뮬레이션 (플레밍의 왼손 법칙)</span>
        <span style={{ fontSize: 14, color: C.muted, fontWeight: "normal" }}>
          <InlineMath math="\vec{F} = I(\vec{L} \times \vec{B})" />
        </span>
      </div>

      {/* 3D 캔버스 */}
      <div style={{ height: 400 }}>
        {/* 카메라를 약간 우측 상단에서 비스듬히 내려다보도록 배치 */}
        <Canvas
          camera={{ position: [4, 4, 6], fov: 50 }}
          shadows
          gl={{ antialias: true }}
        >
          <color attach="background" args={["#f8f9fa"]} />
          <ambientLight intensity={1.5} />
          <directionalLight
            position={[10, 15, 10]}
            intensity={1.2}
            castShadow
          />

          <OrbitControls target={[0, 0, 0]} minDistance={3} maxDistance={20} />
          <Suspense fallback={null}>
            <LorentzSimulation
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
        {/* 전류 (I) */}
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
          />
          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button
              onClick={() => setCurrentDir("+Z")}
              style={{
                background: currentDir === "+Z" ? C.vectorI : C.surface,
                color: currentDir === "+Z" ? "white" : C.text,
                border: `1px solid ${C.border}`,
                flex: 1,
                padding: "6px",
                fontSize: 13,
                cursor: "pointer",
                borderRadius: "4px",
              }}
            >
              +Z 방향 (앞으로)
            </button>
            <button
              onClick={() => setCurrentDir("-Z")}
              style={{
                background: currentDir === "-Z" ? C.vectorI : C.surface,
                color: currentDir === "-Z" ? "white" : C.text,
                border: `1px solid ${C.border}`,
                flex: 1,
                padding: "6px",
                fontSize: 13,
                cursor: "pointer",
                borderRadius: "4px",
              }}
            >
              -Z 방향 (뒤로)
            </button>
          </div>
        </div>

        {/* 자기장 (B) */}
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
              N 극(좌) → S 극(우)
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
              S 극(좌) ← N 극(우)
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
          }}
        >
          📝 실시간 물리량 계산 과정 (플레밍의 왼손 법칙)
        </div>

        <div style={{ marginBottom: 16 }}>
          <span style={{ color: C.muted, fontWeight: "bold", fontSize: 13 }}>
            ① 로렌츠 힘 공식 (크기):
          </span>
          <BlockMath math={`F = B \\cdot I \\cdot L \\cdot \\sin(90^\\circ)`} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <span style={{ color: C.muted, fontWeight: "bold", fontSize: 13 }}>
            ② 현재 힘 계산:
          </span>
          <BlockMath
            math={`F = ${magnetB.toFixed(2)} \\cdot ${currentI.toFixed(2)} \\cdot ${rodL.toFixed(1)} = \\mathbf{\\color{${C.vectorF}}{${Math.abs(metrics.F).toFixed(2)}} \\text{ N}}`}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <span style={{ color: C.muted, fontWeight: "bold", fontSize: 13 }}>
            ③ 가속도 계산 (a = F / m):
          </span>
          <BlockMath
            math={`a = \\frac{${Math.abs(metrics.F).toFixed(2)}}{${rodM.toFixed(1)}} = \\mathbf{${Math.abs(metrics.a).toFixed(3)} \\text{ m/s}^2}`}
          />
        </div>

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
          검지(<strong style={{ color: C.vectorB }}>B</strong>)를 자기장 방향,
          중지(<strong style={{ color: C.vectorI }}>I</strong>)를 전류 방향으로
          향하게 하면,
          <br />
          엄지(<strong style={{ color: C.vectorF }}>F</strong>)가 가리키는
          방향인{" "}
          <strong style={{ color: C.vectorF, fontSize: 16 }}>
            {metrics.F > 0
              ? "위쪽 (상승)"
              : metrics.F < 0
                ? "아래쪽 (하강)"
                : "정지"}
          </strong>{" "}
          방향으로 힘을 받아 이동합니다.
        </div>
      </div>
    </div>
  );
}
