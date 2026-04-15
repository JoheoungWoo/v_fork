/**
 * LorentzForceWidget.jsx
 *
 * 자기장 속에서 전류 도선이 받는 힘 F = IBL 시각화 및 실시간 수식 풀이 위젯.
 * 플레밍의 왼손 법칙을 3D와 LaTeX로 학습합니다.
 */

import { Arrow, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";
import * as THREE from "three";

// 💡 LaTeX 렌더링을 위한 패키지 임포트
import "katex/dist/katex.min.css";
import { BlockMath, InlineMath } from "react-katex";

// 🎨 라이트 테마 색상 팔레트
const C = {
  bg: "#ffffff",
  surface: "#f8f9fa",
  border: "#dee2e6",
  text: "#212529",
  muted: "#6c757d",
  vectorI: "#fd7e14", // 전류: 오렌지
  vectorB: "#0d6efd", // 자기장: 파랑
  vectorF: "#198754", // 로렌츠 힘: 초록
  magnetN: "#dc3545", // N극: 빨강
  magnetS: "#0a58ca", // S극: 진한 파랑
  copper: "#b87333", // 구리 색
};

/**
 * 💡 벡터 화살표Helper 컴포넌트 (I, B, F 방향 표시)
 */
function VectorArrow({
  direction,
  color,
  length,
  label,
  position = [0, 0, 0],
}) {
  const dirVec = useRef(new THREE.Vector3());

  useFrame(() => {
    // direction 프로프([x,y,z])에 따라 화살표 방향 업데이트
    dirVec.current.set(...direction).normalize();
  });

  return (
    <group position={position}>
      <Arrow
        args={[dirVec.current, new THREE.Vector3(0, 0, 0), length, color]}
        headLength={length * 0.2}
        headWidth={length * 0.1}
      />
      {/* 화살표 라벨 */}
      <Text
        position={[
          direction[0] * length,
          direction[1] * length,
          direction[2] * length,
        ]}
        fontSize={0.3}
        color={color}
        fontWeight="bold"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

/**
 * 💡 핵심 물리 엔진 및 3D 모델 렌더링 (d²x/dt² 계산)
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

  // 물리 상태 저장 ref (빠른 계산을 위해 useFrame 내에서 사용)
  const positionX = useRef(0);
  const velocityX = useRef(0);
  const angleZ = useRef(0); // 실제 구르는 회전 효과

  // 초기화 버튼 클릭 시 위치 리셋
  if (resetFlag && rodRef.current) {
    positionX.current = 0;
    velocityX.current = 0;
    angleZ.current = 0;
  }

  useFrame((_, dt) => {
    // 1. 프로프에서 물리량 방향 추출 (+Z=1, -Z=-1, N->S=1, S->N=-1)
    const iDir = currentDir === "+Z" ? 1 : -1;
    const bDir = magnetDir === "N→S" ? 1 : -1; // 1이면 위에서 아래(-Y), -1이면 아래에서 위(+Y)

    // 2. 힘 계산 (F = B * I * L) - 직교하므로 sin(90)=1
    const forceMag = magnetB * currentI * rodL;

    // 💡 3. 힘 방향 결정 (벡터 외적 I x B logic):
    // I=+Z(0,0,1) x B=-Y(0,-1,0) = +X(1,0,0) 방향
    // iDir과 bDir 부호 곱으로 방향 결정 (+X 또는 -X)
    const forceDir = iDir * bDir;

    // 4. 가속도 (a = F / m)
    const accelX = (forceMag * forceDir) / rodM;

    // 5. 간단한 마찰/드래그 효과 (무한 가속 방지)
    const dragFactor = 0.98;

    // 6. 각속도 적분
    velocityX.current += accelX * dt;
    velocityX.current *= dragFactor; // 드래그 적용

    // 7. 위치 적분
    positionX.current += velocityX.current * dt;

    // 8. 레일 끝 도달 시 정지 조건 (X 범위 ±4.5)
    if (Math.abs(positionX.current) > 4.5) {
      velocityX.current = 0;
      positionX.current = Math.sign(positionX.current) * 4.5;
    }

    // 9. 3D 모델 업데이트
    if (rodRef.current) {
      // 위치 이동
      rodRef.current.position.x = positionX.current;

      // 실제 구르는 효과 (Z축 회전: 회전 각도 = 이동거리 / 반지름)
      // 구리봉 반지름 args[0]=0.1
      if (Math.abs(velocityX.current) > 0.01) {
        angleZ.current -= (velocityX.current * dt) / 0.1;
        rodRef.current.rotation.z = angleZ.current;
      }
    }

    // 10. 하단 수식 패널 업데이트를 위해 상위 컴포넌트로 값 전달
    setMetrics({
      F: forceMag * forceDir,
      a: accelX,
      v: velocityX.current,
      x: positionX.current,
      iVector: [0, 0, iDir], // 전류 벡터 방향
      bVector: [0, bDir * -1, 0], // 자기장 벡터 방향 (-Y=N위S아래, +Y=S위N아래)
      fVector: [forceDir, 0, 0], // 힘 벡터 방향
    });
  });

  // 자석 배치 (magnetDir에 따라 N/S 위치 스왑)
  const isNTop = magnetDir === "N→S";

  return (
    <group>
      {/* 금속 레일 2개 */}
      <mesh position={[0, -0.15, 1.0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 10, 16]} />
        <meshStandardMaterial color="#adb5bd" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.15, -1.0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 10, 16]} />
        <meshStandardMaterial color="#adb5bd" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* 자석 블록 (N, S) */}
      {/* 위쪽 자석 */}
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
      {/* 아래쪽 자석 */}
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

      {/* 💡 회전 및 이동하는 구리봉 (Rotor) */}
      <mesh
        ref={rodRef}
        position={[0, 0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.1, 0.1, rodL, 32]} />
        <meshStandardMaterial
          color={C.copper}
          metalness={0.5}
          roughness={0.4}
        />

        {/* 💡 구리봉 중심에서 뻗어나오는 벡터 화살표Helper */}
        <Suspense fallback={null}>
          <VectorArrow
            direction={setMetrics.iVector || [0, 0, 1]}
            color={C.vectorI}
            length={1.5}
            label="I"
            position={[0, rodL / 2 + 0.2, 0]}
          />
          <VectorArrow
            direction={setMetrics.bVector || [0, -1, 0]}
            color={C.vectorB}
            length={1.5}
            label="B"
          />
          <VectorArrow
            direction={setMetrics.fVector || [1, 0, 0]}
            color={C.vectorF}
            length={1.5}
            label="F"
          />
        </Suspense>
      </mesh>
    </group>
  );
}

export default function LorentzForceWidget() {
  // 슬라이더 및 토글 상태
  const [currentI, setCurrentI] = useState(5.0); // 전류 크기 (A)
  const [currentDir, setCurrentDir] = useState("+Z"); // 전류 방향
  const [magnetB, setMagnetB] = useState(1.0); // 자기장 세기 (T)
  const [magnetDir, setMagnetDir] = useState("N→S"); // 자기장 방향 (위->아래)
  const [resetFlag, setResetFlag] = useState(false); // 리셋 트리거

  // 고정 물리 파라미터
  const rodL = 2.0; // 구리봉 길이 (m)
  const rodM = 0.5; // 구리봉 질량 (kg)

  // 시뮬레이션에서 계산된 실시간 지표
  const [metrics, setMetrics] = useState({
    F: 0,
    a: 0,
    v: 0,
    x: 0,
    iVector: [0, 0, 1],
    bVector: [0, -1, 0],
    fVector: [1, 0, 0],
  });

  const handleReset = () => {
    setResetFlag(true);
    setTimeout(() => setResetFlag(false), 100); // 짧은 시간 후 플래그 해제
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
        {/* 💡 헤더에 LaTeX 공식 적용 */}
        <span style={{ fontSize: 14, color: C.muted, fontWeight: "normal" }}>
          <InlineMath math="\vec{F} = I(\vec{L} \times \vec{B})" />
        </span>
      </div>

      {/* 1. 3D 캔버스 영역 */}
      <div style={{ height: 400 }}>
        <Canvas
          camera={{ position: [5, 3, 5], fov: 50 }}
          shadows
          gl={{ antialias: true }}
        >
          <color attach="background" args={["#f1f3f5"]} />
          <ambientLight intensity={1.5} />
          <directionalLight
            position={[10, 15, 10]}
            intensity={1.5}
            castShadow
          />
          <directionalLight position={[-10, -5, -10]} intensity={0.5} />

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

      {/* 2. 컨트롤 및 주요 지표 요약 패널 */}
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
        {/* 전류 조절 (Ia) */}
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
              type="button"
              onClick={handleReset}
              style={{ fontSize: 12, padding: "2px 8px" }}
            >
              위치 초기화
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
          <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
            <button
              type="button"
              onClick={() => setCurrentDir("+Z")}
              style={{
                background: currentDir === "+Z" ? C.vectorI : C.border,
                color: currentDir === "+Z" ? "white" : C.text,
                flex: 1,
                fontSize: 13,
              }}
            >
              +Z 방향 (뒤→앞)
            </button>
            <button
              type="button"
              onClick={() => setCurrentDir("-Z")}
              style={{
                background: currentDir === "-Z" ? C.vectorI : C.border,
                color: currentDir === "-Z" ? "white" : C.text,
                flex: 1,
                fontSize: 13,
              }}
            >
              -Z 방향 (앞→뒤)
            </button>
          </div>
        </div>

        {/* 자기장 조절 (B) */}
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
          <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
            <button
              type="button"
              onClick={() => setMagnetDir("N→S")}
              style={{
                background: magnetDir === "N→S" ? C.vectorB : C.border,
                color: magnetDir === "N→S" ? "white" : C.text,
                flex: 1,
                fontSize: 13,
              }}
            >
              N 위, S 아래 (↓B)
            </button>
            <button
              type="button"
              onClick={() => setMagnetDir("S→N")}
              style={{
                background: magnetDir === "S→N" ? C.vectorB : C.border,
                color: magnetDir === "S→N" ? "white" : C.text,
                flex: 1,
                fontSize: 13,
              }}
            >
              S 위, N 아래 (↑B)
            </button>
          </div>
        </div>
      </div>

      {/* 3. 💡 실시간 수식 풀이 과정 (NEW) */}
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
          📝 실시간 물리량 계산 과정
        </div>

        <div style={{ marginBottom: 16 }}>
          <span style={{ color: C.muted, fontWeight: "bold", fontSize: 13 }}>
            ① 로렌츠 힘 공식 (크기):
          </span>
          {/* theta=90이므로 sin(theta)=1 */}
          <BlockMath math={`F = B \\cdot I \\cdot L \\cdot \\sin(\\theta)`} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <span style={{ color: C.muted, fontWeight: "bold", fontSize: 13 }}>
            ② 현재 힘 계산:
          </span>
          <BlockMath
            math={`F = ${magnetB.toFixed(2)} \\cdot ${currentI.toFixed(2)} \\cdot ${rodL.toFixed(1)} = \\mathbf{\\color{${C.vectorF}}{${metrics.F.toFixed(2)}} \\text{ N}}`}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <span style={{ color: C.muted, fontWeight: "bold", fontSize: 13 }}>
            ③ 가속도 계산 (a = F / m):
          </span>
          <BlockMath
            math={`a = \\frac{${metrics.F.toFixed(2)}}{${rodM.toFixed(1)}} = \\mathbf{${metrics.a.toFixed(3)} \\text{ m/s}^2}`}
          />
        </div>

        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: C.surfaceLight,
            borderLeft: `4px solid ${C.border}`,
            borderRadius: 4,
            fontSize: 13,
          }}
        >
          <strong style={{ color: C.text }}>
            플레밍의 왼손 법칙 방향 설명:
          </strong>
          <br />
          검지(<strong style={{ color: C.vectorB }}>B</strong>)를 자기장 방향(
          {magnetDir}), 중지(<strong style={{ color: C.vectorI }}>I</strong>)를
          전류 방향({currentDir})으로 향하게 하면,
          <br />
          엄지(<strong style={{ color: C.vectorF }}>F</strong>)가 가리키는
          방향인{" "}
          <strong>
            {metrics.F >= 0 ? "+X 방향 (오른쪽)" : "-X 방향 (왼쪽)"}
          </strong>
          으로 힘을 받아 구리봉이 굴러갑니다.
        </div>
      </div>
    </div>
  );
}
