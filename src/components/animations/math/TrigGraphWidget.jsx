import { useEffect, useState } from "react";

const TrigGraphWidget = () => {
  const [angle, setAngle] = useState(45); // 0 ~ 360도
  const [funcType, setFuncType] = useState("sin"); // 'sin', 'cos', 'tan'
  const [isPlaying, setIsPlaying] = useState(false);

  // 애니메이션 (자동 회전)
  useEffect(() => {
    let frameId;
    if (isPlaying) {
      const animate = () => {
        setAngle((prev) => (prev >= 360 ? 0 : prev + 1));
        frameId = requestAnimationFrame(animate);
      };
      frameId = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying]);

  // 상수 및 스케일 설정
  const R = 80; // 단위원 반지름
  const graphWidth = 360; // 그래프 너비 (1도 = 1px)
  const graphHeight = R * 2; // 그래프 높이

  // 현재 각도에 대한 라디안 및 단위원 좌표 (SVG는 y축이 아래로 향하므로 -y 적용)
  const rad = (angle * Math.PI) / 180;
  const cx = Math.cos(rad) * R;
  const cy = -Math.sin(rad) * R;

  // 현재 함수의 값 계산 (탄젠트는 무한대 발산 방지를 위해 제한)
  const getFuncValue = (a) => {
    const r = (a * Math.PI) / 180;
    if (funcType === "sin") return Math.sin(r);
    if (funcType === "cos") return Math.cos(r);
    if (funcType === "tan") return Math.tan(r);
    return 0;
  };

  const currentValue = getFuncValue(angle);

  // 탄젠트 그래프 렌더링 시 점근선(90도, 270도) 근처 튀는 선 방지 로직
  const generatePath = () => {
    let path = [];
    for (let i = 0; i <= 360; i += 2) {
      const val = getFuncValue(i);
      // 탄젠트의 경우 화면 밖으로 너무 벗어나면 끊어서 그림 (y축 제한)
      if (funcType === "tan" && (val > 3 || val < -3)) {
        continue;
      }
      const x = i;
      const y = -val * R;
      path.push(
        `${path.length === 0 || (funcType === "tan" && Math.abs(val) > 2.8 && i % 180 < 10) ? "M" : "L"} ${x},${y}`,
      );
    }
    return path.join(" ");
  };

  // UI 색상 테마
  const colorMap = {
    sin: "#ef4444", // Red
    cos: "#3b82f6", // Blue
    tan: "#10b981", // Green
  };
  const activeColor = colorMap[funcType];

  return (
    <div
      style={{
        padding: "20px",
        background: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* 1. 상단 컨트롤 패널 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "10px" }}>
          {["sin", "cos", "tan"].map((type) => (
            <button
              key={type}
              onClick={() => setFuncType(type)}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: `2px solid ${colorMap[type]}`,
                background: funcType === type ? colorMap[type] : "white",
                color: funcType === type ? "white" : colorMap[type],
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>
        <div style={{ fontSize: "18px", fontWeight: "bold" }}>
          {funcType}({angle}°) = {currentValue.toFixed(2)}
        </div>
      </div>

      {/* 2. 시각화 영역 (단위원 + 그래프) */}
      <div
        style={{
          display: "flex",
          gap: "30px",
          alignItems: "center",
          overflowX: "auto",
        }}
      >
        {/* 왼쪽: 단위원 (Unit Circle) */}
        <div style={{ position: "relative" }}>
          <svg
            width="200"
            height="200"
            viewBox="-100 -100 200 200"
            style={{ overflow: "visible" }}
          >
            {/* 축 */}
            <line
              x1="-100"
              y1="0"
              x2="100"
              y2="0"
              stroke="#cbd5e1"
              strokeWidth="2"
            />
            <line
              x1="0"
              y1="-100"
              x2="0"
              y2="100"
              stroke="#cbd5e1"
              strokeWidth="2"
            />

            {/* 단위원 */}
            <circle
              cx="0"
              cy="0"
              r={R}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeDasharray="4"
            />

            {/* 현재 각도의 반지름 선 */}
            <line
              x1="0"
              y1="0"
              x2={cx}
              y2={cy}
              stroke="#334155"
              strokeWidth="2"
            />

            {/* 직각삼각형 및 의미 강조 (선택된 함수에 따라 하이라이트 변경) */}
            {funcType === "sin" && (
              <>
                <line
                  x1={cx}
                  y1="0"
                  x2={cx}
                  y2={cy}
                  stroke={activeColor}
                  strokeWidth="3"
                />
                <line
                  x1="0"
                  y1="0"
                  x2={cx}
                  y2="0"
                  stroke="#94a3b8"
                  strokeWidth="2"
                />
              </>
            )}
            {funcType === "cos" && (
              <>
                <line
                  x1="0"
                  y1="0"
                  x2={cx}
                  y2="0"
                  stroke={activeColor}
                  strokeWidth="3"
                />
                <line
                  x1={cx}
                  y1="0"
                  x2={cx}
                  y2={cy}
                  stroke="#94a3b8"
                  strokeWidth="2"
                />
              </>
            )}
            {funcType === "tan" && (
              <>
                {/* 탄젠트 접선 (x=R) */}
                <line
                  x1={R}
                  y1={-R * 3}
                  x2={R}
                  y2={R * 3}
                  stroke="#e2e8f0"
                  strokeWidth="2"
                />
                <line
                  x1={R}
                  y1="0"
                  x2={R}
                  y2={-currentValue * R}
                  stroke={activeColor}
                  strokeWidth="3"
                />
                {/* 원점-교점 연장선 */}
                <line
                  x1="0"
                  y1="0"
                  x2={R}
                  y2={-currentValue * R}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="4"
                />
              </>
            )}

            {/* 동경 끝 점 */}
            <circle cx={cx} cy={cy} r="5" fill="#334155" />
          </svg>
        </div>

        {/* 오른쪽: 삼각함수 그래프 (Cartesian Graph) */}
        <div style={{ position: "relative", flex: 1 }}>
          <svg
            width="100%"
            height="200"
            viewBox={`0 -100 ${graphWidth} 200`}
            style={{ overflow: "visible" }}
          >
            {/* X축 (각도) */}
            <line
              x1="0"
              y1="0"
              x2={graphWidth}
              y2="0"
              stroke="#cbd5e1"
              strokeWidth="2"
            />
            {/* 90도 단위 가이드라인 */}
            {[90, 180, 270, 360].map((deg) => (
              <g key={deg}>
                <line
                  x1={deg}
                  y1="-100"
                  x2={deg}
                  y2="100"
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={deg}
                  y="115"
                  fontSize="12"
                  fill="#64748b"
                  textAnchor="middle"
                >
                  {deg}°
                </text>
              </g>
            ))}

            {/* 함수 곡선 */}
            <path
              d={generatePath()}
              fill="none"
              stroke={activeColor}
              strokeWidth="3"
              strokeLinejoin="round"
            />

            {/* 현재 값 표시 점 */}
            <circle
              cx={angle}
              cy={-currentValue * R}
              r="5"
              fill={activeColor}
            />

            {/* 단위원과 그래프를 잇는 높이 가이드라인 (사인, 코사인일 때 유용) */}
            <line
              x1="0"
              y1={-currentValue * R}
              x2={angle}
              y2={-currentValue * R}
              stroke={activeColor}
              strokeWidth="1"
              strokeDasharray="4"
              opacity="0.5"
            />
            <line
              x1={angle}
              y1="0"
              x2={angle}
              y2={-currentValue * R}
              stroke={activeColor}
              strokeWidth="1"
              strokeDasharray="4"
              opacity="0.5"
            />
          </svg>
        </div>
      </div>

      {/* 3. 하단 슬라이더 조작부 */}
      <div
        style={{
          marginTop: "30px",
          display: "flex",
          gap: "15px",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            background: "#334155",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          {isPlaying ? "⏸ 정지" : "▶ 재생"}
        </button>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: "bold" }}>0°</span>
          <input
            type="range"
            min="0"
            max="360"
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            style={{ flex: 1, cursor: "pointer" }}
          />
          <span style={{ fontSize: "14px", fontWeight: "bold" }}>360°</span>
        </div>
      </div>
    </div>
  );
};

export default TrigGraphWidget;
