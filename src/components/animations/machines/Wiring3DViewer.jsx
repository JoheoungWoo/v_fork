import { Cylinder, Line, OrbitControls, Sphere, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * 전류 입자 — 경로·속도·색은 백엔드 JSON.
 * timePhaseShift: 균형 3상 시각 위상 (0, 1/3, 2/3) × path 세그먼트 수만큼 더해 동기.
 */
const CurrentParticle = ({
  path,
  speed,
  color,
  size,
  timePhaseShift = 0,
}) => {
  const meshRef = useRef();

  const vectorPath = useMemo(() => {
    return path.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
  }, [path]);

  useFrame((state) => {
    if (!vectorPath || vectorPath.length < 2) return;

    const L = vectorPath.length;
    const offset = (timePhaseShift % 1) * L;
    let t = state.clock.elapsedTime * speed + offset;
    t = ((t % L) + L) % L;
    const index = Math.floor(t);
    const nextIndex = (index + 1) % L;
    const progress = t - index;

    const p1 = vectorPath[index];
    const p2 = vectorPath[nextIndex];

    if (meshRef.current) {
      meshRef.current.position.lerpVectors(p1, p2, progress);
    }
  });

  return (
    <Sphere ref={meshRef} args={[size, 16, 16]}>
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

  const { coils, wires, labels, animations, current_legend } =
    widgetData.scene_data;

  return (
    <div
      style={{
        width: "100%",
        height: "600px",
        backgroundColor: "#1a1a1a",
        borderRadius: "8px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {current_legend?.items?.length ? (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 12,
            zIndex: 1,
            background: "rgba(0,0,0,0.55)",
            padding: "8px 12px",
            borderRadius: 8,
            fontSize: 12,
            color: "#ddd",
            pointerEvents: "none",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 6 }}>
            {current_legend.title}
          </div>
          {current_legend.items.map((it, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: it.color,
                  boxShadow: `0 0 6px ${it.color}`,
                }}
              />
              <span>{it.phase}</span>
            </div>
          ))}
        </div>
      ) : null}
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
              anim.active &&
              Array.isArray(anim.path) &&
              anim.path.length >= 2 && (
                <CurrentParticle
                  key={anim.id || `anim-${idx}`}
                  path={anim.path}
                  speed={anim.speed ?? 1.0}
                  color={anim.color || "#ffffff"}
                  size={anim.size ?? 0.2}
                  timePhaseShift={anim.time_phase_shift ?? 0}
                />
              ),
          )}
      </Canvas>
    </div>
  );
};

export default Wiring3DViewer;
