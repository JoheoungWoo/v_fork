import { OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const RMFVisualization = () => {
  // 벡터(화살표) 업데이트를 위한 참조
  const resultantRef = useRef();
  const phaseARef = useRef();
  const phaseBRef = useRef();
  const phaseCRef = useRef();

  // 원점
  const origin = new THREE.Vector3(0, 0, 0);

  // 애니메이션 루프: 매 프레임마다 시간(t)에 따른 자계 벡터 계산
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 2; // 각주파수(ω), 회전 속도 조절

    // 1. 각 상의 자기장 크기 계산 (시간적 120도 위상차)
    const magA = Math.cos(t);
    const magB = Math.cos(t - (2 * Math.PI) / 3);
    const magC = Math.cos(t - (4 * Math.PI) / 3);

    // 2. 각 상의 공간적 방향 벡터 (공간적 120도 배치)
    const dirA = new THREE.Vector3(1, 0, 0);
    const dirB = new THREE.Vector3(
      Math.cos((2 * Math.PI) / 3),
      Math.sin((2 * Math.PI) / 3),
      0,
    );
    const dirC = new THREE.Vector3(
      Math.cos((4 * Math.PI) / 3),
      Math.sin((4 * Math.PI) / 3),
      0,
    );

    // 3. 현재 시간에 따른 각 상의 실제 자계 벡터 (방향 * 크기)
    const vecA = dirA.clone().multiplyScalar(magA);
    const vecB = dirB.clone().multiplyScalar(magB);
    const vecC = dirC.clone().multiplyScalar(magC);

    // 4. 합성 자계 벡터 (A + B + C)
    const resultant = new THREE.Vector3().add(vecA).add(vecB).add(vecC);

    // 화살표 렌더링 업데이트 함수
    const updateArrow = (ref, vec, defaultDir) => {
      if (ref.current) {
        const length = vec.length();
        // 크기가 0에 가까우면 기본 방향 유지, 아니면 벡터의 방향 적용
        const dir = length > 0.001 ? vec.clone().normalize() : defaultDir;
        // 크기가 음수로 떨어지지 않도록 절대값 처리
        ref.current.setDirection(dir);
        ref.current.setLength(
          Math.abs(length),
          Math.abs(length) * 0.2,
          Math.abs(length) * 0.15,
        );
      }
    };

    updateArrow(phaseARef, vecA, dirA);
    updateArrow(phaseBRef, vecB, dirB);
    updateArrow(phaseCRef, vecC, dirC);

    // 합성 벡터 업데이트 (크기는 항상 1.5로 일정함)
    if (resultantRef.current) {
      resultantRef.current.setDirection(resultant.clone().normalize());
      resultantRef.current.setLength(
        resultant.length(),
        resultant.length() * 0.2,
        resultant.length() * 0.15,
      );
    }
  });

  return (
    <group>
      {/* A상 자기장 (빨간색) */}
      <primitive
        ref={phaseARef}
        object={
          new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), origin, 1, 0xff4444)
        }
      />
      {/* B상 자기장 (녹색) */}
      <primitive
        ref={phaseBRef}
        object={
          new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), origin, 1, 0x44ff44)
        }
      />
      {/* C상 자기장 (파란색) */}
      <primitive
        ref={phaseCRef}
        object={
          new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), origin, 1, 0x4444ff)
        }
      />
      {/* 합성 회전자계 (노란색) */}
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

      {/* 범례 표시 */}
      <Text position={[2.5, 2, 0]} color="white" fontSize={0.2}>
        Yellow: Resultant Field (1.5 Bm)
      </Text>
      <Text position={[2.5, 1.7, 0]} color="#ff4444" fontSize={0.15}>
        Red: Phase A
      </Text>
      <Text position={[2.5, 1.5, 0]} color="#44ff44" fontSize={0.15}>
        Green: Phase B
      </Text>
      <Text position={[2.5, 1.3, 0]} color="#4444ff" fontSize={0.15}>
        Blue: Phase C
      </Text>
    </group>
  );
};

export default function RotatingMagneticFieldApp() {
  return (
    <div
      style={{ width: "100vw", height: "100vh", backgroundColor: "#1a1a1a" }}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <OrbitControls enableDamping={true} />

        {/* 중심 좌표계 및 그리드 (Z축 기준 평면으로 보기 위해 회전) */}
        <axesHelper args={[3]} />
        <gridHelper
          args={[10, 10, 0x444444, 0x222222]}
          rotation={[Math.PI / 2, 0, 0]}
        />

        {/* 회전자계 컴포넌트 */}
        <RMFVisualization />
      </Canvas>

      {/* UI 오버레이 */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <h2>유도기 회전자계(RMF) 3D 시각화</h2>
        <p>마우스를 드래그하여 3D 시점을 변경할 수 있습니다.</p>
      </div>
    </div>
  );
}
