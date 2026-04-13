import { Cylinder, Line, OrbitControls, Sphere, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// ==========================================
// 1. 전류 입자 (제3고조파 순환 애니메이션) 컴포넌트
// ==========================================
const CurrentParticle = ({ path, speed, color, size }) => {
  const meshRef = useRef();

  // 파이썬 배열로 된 path 좌표들을 Three.js Vector3 객체로 변환
  const vectorPath = useMemo(() => {
    return path.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
  }, [path]);

  useFrame((state) => {
    if (!vectorPath || vectorPath.length < 2) return;

    // 경과 시간에 따른 현재 경로 위치 계산
    const time = (state.clock.elapsedTime * speed) % vectorPath.length;
    const index = Math.floor(time);
    const nextIndex = (index + 1) % vectorPath.length;
    const progress = time - index; // 0 ~ 1 사이의 보간율

    const p1 = vectorPath[index];
    const p2 = vectorPath[nextIndex];

    if (meshRef.current) {
      // 선형 보간(Lerp)을 사용하여 입자를 점과 점 사이로 부드럽게 이동시킴
      meshRef.current.position.lerpVectors(p1, p2, progress);
    }
  });

  return (
    <Sphere ref={meshRef} args={[size, 16, 16]}>
      {/* MeshBasicMaterial을 사용하여 빛의 영향을 받지 않고 자체 발광하는 것처럼 표현 */}
      <meshBasicMaterial color={color} toneMapped={false} />
    </Sphere>
  );
};

// ==========================================
// 2. 코일(인덕터) 렌더링 컴포넌트
// ==========================================
const InductorCoil = ({ top, bot, color }) => {
  // 상단(top)과 하단(bot) 좌표의 중간 지점을 계산
  const midX = (top[0] + bot[0]) / 2;
  const midY = (top[1] + bot[1]) / 2;
  const midZ = (top[2] + bot[2]) / 2;

  // 코일의 길이 계산
  const length = Math.abs(top[1] - bot[1]);

  return (
    <group>
      {/* 단순한 원통형(Cylinder)으로 코일 형태 표현. 
          필요시 와이어프레임을 켜서 코일 질감을 살림 */}
      <Cylinder
        position={[midX, midY, midZ]}
        args={[0.4, 0.4, length, 16]}
        rotation={[0, 0, 0]}
      >
        <meshStandardMaterial color={color || "#555555"} wireframe={true} />
      </Cylinder>
    </group>
  );
};

// ==========================================
// 3. 메인 3D 뷰어 컴포넌트 (Dumb Viewer)
// ==========================================
const Wiring3DViewer = ({ widgetData }) => {
  // 데이터가 로드되지 않았을 때의 방어막 처리
  if (!widgetData || !widgetData.scene_data) {
    return (
      <div
        style={{
          width: "100%",
          height: "600px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#111",
          color: "white",
        }}
      >
        3D 위젯 데이터를 불러오는 중입니다...
      </div>
    );
  }

  const { coils, wires, labels, animations } = widgetData.scene_data;

  return (
    <div
      style={{
        width: "100%",
        height: "600px",
        backgroundColor: "#1a1a1a",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      {/* Canvas: Three.js의 렌더링 컨텍스트 */}
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        {/* 기본 조명 세팅 */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} />

        {/* 마우스/터치로 3D 공간을 회전, 확대, 이동할 수 있게 해주는 컨트롤러 */}
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

        {/* --- 1. 결선 와이어 렌더링 --- */}
        {wires &&
          wires.map((wire, idx) => (
            <Line
              key={`wire-${idx}`}
              points={wire.points}
              color="white"
              lineWidth={2.5}
            />
          ))}

        {/* --- 2. 1차측(Y) 및 2차측(Δ) 코일 렌더링 --- */}
        {coils?.primary &&
          coils.primary.map((coil, idx) => (
            <InductorCoil
              key={`p-coil-${idx}`}
              top={coil.top}
              bot={coil.bot}
              color={coils.color}
            />
          ))}
        {coils?.secondary &&
          coils.secondary.map((coil, idx) => (
            <InductorCoil
              key={`s-coil-${idx}`}
              top={coil.top}
              bot={coil.bot}
              color={coils.color}
            />
          ))}

        {/* --- 3. 텍스트 라벨 (상 표시 및 부가 설명) --- */}
        {labels &&
          labels.map((lbl, idx) => (
            <Text
              key={`lbl-${idx}`}
              position={lbl.pos}
              fontSize={0.6}
              color="#4da6ff"
              anchorX="center"
              anchorY="middle"
            >
              {lbl.text}
            </Text>
          ))}

        {/* --- 4. 순환 전류 입자 애니메이션 렌더링 --- */}
        {animations &&
          animations.map(
            (anim, idx) =>
              anim.active && (
                <CurrentParticle
                  key={`anim-${idx}`}
                  path={anim.path}
                  speed={anim.speed || 2.0}
                  color={anim.color || "#ff0000"}
                  size={anim.size || 0.25}
                />
              ),
          )}
      </Canvas>
    </div>
  );
};

export default Wiring3DViewer;
