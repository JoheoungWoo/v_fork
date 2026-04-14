import { Cylinder, Line, OrbitControls, Sphere, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/** 백엔드가 준 omega_t + series[].i 만 그림 (계산 없음) */
export function CurrentWaveformChart({ spec }) {
  const { polylines, w, h } = useMemo(() => {
    if (!spec?.omega_t?.length || !spec?.series?.length) {
      return { polylines: [], w: 720, h: 200 };
    }
    const W = 720;
    const H = 200;
    const pad = { l: 44, r: 18, t: 14, b: 36 };
    const plotW = W - pad.l - pad.r;
    const plotH = H - pad.t - pad.b;
    const wt = spec.omega_t;
    const xMin = wt[0];
    const xMax = wt[wt.length - 1];
    const yMin = spec.y_min ?? -1.2;
    const yMax = spec.y_max ?? 1.2;
    const mapX = (x) => pad.l + ((x - xMin) / (xMax - xMin || 1)) * plotW;
    const mapY = (y) => pad.t + (1 - (y - yMin) / (yMax - yMin || 1)) * plotH;

    const lines = spec.series.map((s) => {
      const pts = wt
        .map((t, i) => {
          const yv = s.i[i];
          if (yv === undefined) return null;
          return `${mapX(t).toFixed(2)},${mapY(yv).toFixed(2)}`;
        })
        .filter(Boolean)
        .join(" ");
      return { key: s.label, color: s.color, points: pts };
    });
    return { polylines: lines, w: W, h: H };
  }, [spec]);

  if (!polylines.length) return null;

  const pad = { l: 44, r: 18, t: 14, b: 36 };
  const yMin = spec.y_min ?? -1.2;
  const yMax = spec.y_max ?? 1.2;
  const plotW = w - pad.l - pad.r;
  const plotH = h - pad.t - pad.b;
  const zeroY = pad.t + (1 - (0 - yMin) / (yMax - yMin || 1)) * plotH;

  return (
    <div
      style={{
        padding: "10px 14px 14px",
        background: "#121218",
        borderTop: "1px solid #2a2a34",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, color: "#e0e0e8" }}>
        {spec.title}
      </div>
      {spec.subtitle ? (
        <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
          {spec.subtitle}
        </div>
      ) : null}
      <svg
        width="100%"
        viewBox={`0 0 ${w} ${h}`}
        style={{ marginTop: 8, maxHeight: 220 }}
        preserveAspectRatio="xMidYMid meet"
      >
        <rect
          x={pad.l}
          y={pad.t}
          width={plotW}
          height={plotH}
          fill="none"
          stroke="#333"
          strokeWidth={1}
        />
        <line
          x1={pad.l}
          y1={zeroY}
          x2={pad.l + plotW}
          y2={zeroY}
          stroke="#444"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        {polylines.map((pl) => (
          <polyline
            key={pl.key}
            fill="none"
            stroke={pl.color}
            strokeWidth={2}
            points={pl.points}
          />
        ))}
        <text
          x={w / 2}
          y={h - 8}
          textAnchor="middle"
          fill="#888"
          fontSize={11}
        >
          {spec.x_label}
        </text>
        <text
          x={14}
          y={pad.t + plotH / 2}
          fill="#888"
          fontSize={11}
          transform={`rotate(-90, 14, ${pad.t + plotH / 2})`}
        >
          {spec.y_label}
        </text>
        <g transform={`translate(${pad.l + plotW + 8}, ${pad.t + 4})`}>
          {spec.series.map((s, i) => (
            <g key={s.label} transform={`translate(0, ${i * 16})`}>
              <line
                x1={0}
                y1={6}
                x2={18}
                y2={6}
                stroke={s.color}
                strokeWidth={2}
              />
              <text x={22} y={10} fill="#ccc" fontSize={11}>
                {s.label}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

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
          minHeight: 400,
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

  const { coils, wires, labels, animations, current_legend, current_waveforms } =
    widgetData.scene_data;

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "#1a1a1a",
        borderRadius: "8px",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
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
      <div style={{ height: 520, width: "100%" }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }} style={{ height: "100%", width: "100%" }}>
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
      {current_waveforms ? (
        <CurrentWaveformChart spec={current_waveforms} />
      ) : null}
    </div>
  );
};

export default Wiring3DViewer;
