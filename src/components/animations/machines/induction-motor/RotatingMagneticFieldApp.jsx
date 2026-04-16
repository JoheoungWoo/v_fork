import { Cylinder, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

const InductionMotor3D = ({
  frequency,
  vectorScale,
  showPhases,
  showResultant,
  motorOpacity,
}) => {
  const phaseARef = useRef();
  const phaseBRef = useRef();
  const phaseCRef = useRef();
  const resultantRef = useRef();
  const rotorRef = useRef();

  // 기준 원점 및 각 상의 축 방향 (0도, 120도, 240도)
  const origin = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const dirA = useMemo(() => new THREE.Vector3(1, 0, 0), []);
  const dirB = useMemo(
    () =>
      new THREE.Vector3(
        Math.cos((2 * Math.PI) / 3),
        Math.sin((2 * Math.PI) / 3),
        0,
      ),
    [],
  );
  const dirC = useMemo(
    () =>
      new THREE.Vector3(
        Math.cos((4 * Math.PI) / 3),
        Math.sin((4 * Math.PI) / 3),
        0,
      ),
    [],
  );

  useFrame(({ clock }) => {
    // ωt 계산
    const t = clock.getElapsedTime() * frequency;

    // 1. 단상 자기장 크기 맥동
    const magA = Math.cos(t);
    const magB = Math.cos(t - (2 * Math.PI) / 3);
    const magC = Math.cos(t - (4 * Math.PI) / 3);

    // 2. 단상 자계 벡터 계산
    const vecA = dirA.clone().multiplyScalar(magA * vectorScale);
    const vecB = dirB.clone().multiplyScalar(magB * vectorScale);
    const vecC = dirC.clone().multiplyScalar(magC * vectorScale);

    // 3. 합성 자계 (RMF) 벡터 계산
    const resultant = new THREE.Vector3().add(vecA).add(vecB).add(vecC);

    // 화살표 업데이트 헬퍼 함수
    const updateArrow = (ref, vec, defaultDir, isVisible) => {
      if (ref.current) {
        const len = vec.length();
        if (len > 0.001) {
          ref.current.setDirection(vec.clone().normalize());
          ref.current.setLength(len, len * 0.2, len * 0.15);
          ref.current.visible = isVisible;
        } else {
          ref.current.visible = false; // 크기가 0에 수렴하면 숨김
        }
      }
    };

    updateArrow(phaseARef, vecA, dirA, showPhases);
    updateArrow(phaseBRef, vecB, dirB, showPhases);
    updateArrow(phaseCRef, vecC, dirC, showPhases);

    if (resultantRef.current) {
      const resLen = resultant.length();
      if (resLen > 0.001) {
        resultantRef.current.setDirection(resultant.clone().normalize());
        resultantRef.current.setLength(resLen, resLen * 0.2, resLen * 0.15);
        resultantRef.current.visible = showResultant;
      }
    }

    // 4. 회전자(Rotor) 회전 애니메이션
    // 유도전동기의 특징인 '슬립(Slip)'을 표현하기 위해 합성 자계보다 아주 살짝 느리게 회전 (예: 슬립 5% -> 0.95배 속도)
    if (rotorRef.current) {
      rotorRef.current.rotation.y = t * 0.95;
    }
  });

  return (
    // Z축이 위로 오도록 전체 그룹 회전 (2D 벡터 뷰를 위에서 내려다보기 좋게 설정)
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {/* 고정자 (Stator) - 속이 빈 원통 */}
      <Cylinder
        args={[3.2, 3.2, 2, 32, 1, true]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial
          color="#888888"
          transparent
          opacity={motorOpacity}
          side={THREE.DoubleSide}
        />
      </Cylinder>

      {/* 고정자 권선(Winding) 표시기 */}
      <group>
        {/* A상 권선 위치 (0도, 180도) */}
        <mesh position={[3.2, 0, 0]}>
          <sphereGeometry args={[0.2]} />
          <meshBasicMaterial color="#ff4444" />
        </mesh>
        <mesh position={[-3.2, 0, 0]}>
          <sphereGeometry args={[0.2]} />
          <meshBasicMaterial color="#ff4444" />
        </mesh>

        {/* B상 권선 위치 (120도, 300도) */}
        <mesh
          position={[
            3.2 * Math.cos((2 * Math.PI) / 3),
            3.2 * Math.sin((2 * Math.PI) / 3),
            0,
          ]}
        >
          <sphereGeometry args={[0.2]} />
          <meshBasicMaterial color="#44ff44" />
        </mesh>
        <mesh
          position={[
            -3.2 * Math.cos((2 * Math.PI) / 3),
            -3.2 * Math.sin((2 * Math.PI) / 3),
            0,
          ]}
        >
          <sphereGeometry args={[0.2]} />
          <meshBasicMaterial color="#44ff44" />
        </mesh>

        {/* C상 권선 위치 (240도, 60도) */}
        <mesh
          position={[
            3.2 * Math.cos((4 * Math.PI) / 3),
            3.2 * Math.sin((4 * Math.PI) / 3),
            0,
          ]}
        >
          <sphereGeometry args={[0.2]} />
          <meshBasicMaterial color="#4444ff" />
        </mesh>
        <mesh
          position={[
            -3.2 * Math.cos((4 * Math.PI) / 3),
            -3.2 * Math.sin((4 * Math.PI) / 3),
            0,
          ]}
        >
          <sphereGeometry args={[0.2]} />
          <meshBasicMaterial color="#4444ff" />
        </mesh>
      </group>

      {/* 회전자 (Rotor) - 내부의 꽉 찬 원통 (농형 모사) */}
      <Cylinder
        ref={rotorRef}
        args={[1.6, 1.6, 1.8, 16]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial
          color="#4477aa"
          wireframe={motorOpacity < 0.5}
          transparent
          opacity={Math.max(motorOpacity + 0.2, 0.4)}
        />
      </Cylinder>

      {/* 자계 벡터 화살표 */}
      <primitive
        ref={phaseARef}
        object={new THREE.ArrowHelper(dirA, origin, 1, 0xff4444)}
      />
      <primitive
        ref={phaseBRef}
        object={new THREE.ArrowHelper(dirB, origin, 1, 0x44ff44)}
      />
      <primitive
        ref={phaseCRef}
        object={new THREE.ArrowHelper(dirC, origin, 1, 0x4444ff)}
      />
      <primitive
        ref={resultantRef}
        object={
          new THREE.ArrowHelper(
            new THREE.Vector3(1, 0, 0),
            origin,
            1.5,
            0xffff00,
          )
        }
      />

      {/* 벡터 축 라벨 */}
      {showPhases && (
        <>
          <Text
            position={[2, 0, 0.2]}
            rotation={[Math.PI / 2, 0, 0]}
            color="#ff4444"
            fontSize={0.25}
          >
            A
          </Text>
          <Text
            position={[
              2 * Math.cos((2 * Math.PI) / 3),
              2 * Math.sin((2 * Math.PI) / 3),
              0.2,
            ]}
            rotation={[Math.PI / 2, 0, 0]}
            color="#44ff44"
            fontSize={0.25}
          >
            B
          </Text>
          <Text
            position={[
              2 * Math.cos((4 * Math.PI) / 3),
              2 * Math.sin((4 * Math.PI) / 3),
              0.2,
            ]}
            rotation={[Math.PI / 2, 0, 0]}
            color="#4444ff"
            fontSize={0.25}
          >
            C
          </Text>
        </>
      )}
    </group>
  );
};

export default function RotatingMagneticFieldApp() {
  // UI 상태 관리
  const [frequency, setFrequency] = useState(1.0);
  const [vectorScale, setVectorScale] = useState(1.5);
  const [showPhases, setShowPhases] = useState(true);
  const [showResultant, setShowResultant] = useState(true);
  const [motorOpacity, setMotorOpacity] = useState(0.3);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#111",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 3D 캔버스 영역 */}
      <Canvas camera={{ position: [0, 6, 6], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <OrbitControls enableDamping={true} />

        {/* 그리드 바닥 */}
        <gridHelper args={[10, 10, 0x444444, 0x222222]} />

        <InductionMotor3D
          frequency={frequency}
          vectorScale={vectorScale}
          showPhases={showPhases}
          showResultant={showResultant}
          motorOpacity={motorOpacity}
        />
      </Canvas>

      {/* UI 컨트롤 패널 */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          backgroundColor: "rgba(30, 30, 30, 0.85)",
          padding: "20px",
          borderRadius: "10px",
          color: "white",
          fontFamily: "sans-serif",
          width: "280px",
          backdropFilter: "blur(5px)",
          boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
        }}
      >
        <h3
          style={{
            margin: "0 0 15px 0",
            borderBottom: "1px solid #444",
            paddingBottom: "10px",
          }}
        >
          유도기 회전자계(RMF) 제어기
        </h3>

        {/* 주파수 조절 */}
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{ display: "block", fontSize: "14px", marginBottom: "5px" }}
          >
            주파수 (속도): {frequency.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.1"
            max="3.0"
            step="0.1"
            value={frequency}
            onChange={(e) => setFrequency(parseFloat(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        {/* 벡터 크기 조절 */}
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{ display: "block", fontSize: "14px", marginBottom: "5px" }}
          >
            벡터 스케일: {vectorScale.toFixed(1)}
          </label>
          <input
            type="range"
            min="0.5"
            max="3.0"
            step="0.1"
            value={vectorScale}
            onChange={(e) => setVectorScale(parseFloat(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        {/* 기기 투명도 조절 */}
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{ display: "block", fontSize: "14px", marginBottom: "5px" }}
          >
            고정자/회전자 투명도: {Math.round(motorOpacity * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={motorOpacity}
            onChange={(e) => setMotorOpacity(parseFloat(e.target.value))}
            style={{ width: "100%" }}
          />
          <span style={{ fontSize: "12px", color: "#aaa" }}>
            투명도를 낮추면 내부 벡터가 잘 보입니다.
          </span>
        </div>

        {/* 토글 스위치 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            <input
              type="checkbox"
              checked={showPhases}
              onChange={(e) => setShowPhases(e.target.checked)}
              style={{ marginRight: "8px" }}
            />
            개별 상 자계 벡터 보기 (A/B/C)
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            <input
              type="checkbox"
              checked={showResultant}
              onChange={(e) => setShowResultant(e.target.checked)}
              style={{ marginRight: "8px" }}
            />
            <span style={{ color: "#ffff00", fontWeight: "bold" }}>
              합성 회전자계 보기 (Resultant)
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
