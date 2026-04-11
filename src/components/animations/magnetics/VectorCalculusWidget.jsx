import { useEffect, useRef, useState } from "react";

const VectorCalculusWidget = () => {
  const [mode, setMode] = useState("gradient"); // gradient, divergence, curl
  const [strength, setStrength] = useState(5);
  const canvasRef = useRef(null);

  const GRID_SIZE = 20; // 그리드 간격

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    let animationFrameId;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // 배경 격자 그리기
      ctx.strokeStyle = "#f1f5f9";
      ctx.beginPath();
      for (let x = 0; x <= width; x += GRID_SIZE * 2) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += GRID_SIZE * 2) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // 벡터 필드 그리기
      for (let x = GRID_SIZE; x < width; x += GRID_SIZE) {
        for (let y = GRID_SIZE; y < height; y += GRID_SIZE) {
          const dx = (x - centerX) / 50;
          const dy = (y - centerY) / 50;

          let vx = 0,
            vy = 0;
          let color = "#94a3b8";

          if (mode === "gradient") {
            // f(x,y) = x^2 + y^2 의 기울기 => (2x, 2y)
            vx = dx * (strength / 10);
            vy = dy * (strength / 10);
            color = "#ef4444"; // 빨간색
          } else if (mode === "divergence") {
            // 발산 (Source)
            vx = dx * (strength / 5);
            vy = dy * (strength / 5);
            color = "#3b82f6"; // 파란색
          } else if (mode === "curl") {
            // 회전 (소용돌이) => (-y, x)
            vx = -dy * (strength / 5);
            vy = dx * (strength / 5);
            color = "#10b981"; // 초록색
          }

          drawArrow(ctx, x, y, vx * 10, vy * 10, color);
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    const drawArrow = (ctx, x, y, vx, vy, color) => {
      const headlen = 4;
      const angle = Math.atan2(vy, vx);
      const len = Math.sqrt(vx * vx + vy * vy);

      if (len < 0.5) return; // 너무 작은 벡터는 생략

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + vx, y + vy);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + vx, y + vy);
      ctx.lineTo(
        x + vx - headlen * Math.cos(angle - Math.PI / 6),
        y + vy - headlen * Math.sin(angle - Math.PI / 6),
      );
      ctx.lineTo(
        x + vx - headlen * Math.cos(angle + Math.PI / 6),
        y + vy - headlen * Math.sin(angle + Math.PI / 6),
      );
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    };

    draw();
    return () => cancelAnimationFrame(animationFrameId);
  }, [mode, strength]);

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#fff",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <h3
          style={{
            fontSize: "1.25rem",
            fontWeight: "800",
            color: "#1e293b",
            marginBottom: "8px",
          }}
        >
          ✨ 전자기학 벡터 시뮬레이터
        </h3>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
          모드를 선택하여 벡터장의 변화를 관찰하세요.
        </p>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {["gradient", "divergence", "curl"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
              border: "none",
              backgroundColor: mode === m ? "#0047a5" : "#f1f5f9",
              color: mode === m ? "#fff" : "#64748b",
              transition: "all 0.2s",
            }}
          >
            {m.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          style={{
            backgroundColor: "#fff",
            border: "1px solid #f1f5f9",
            borderRadius: "12px",
          }}
        />

        <div style={{ flex: 1, minWidth: "250px" }}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              강도 (Strength): {strength}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={strength}
              onChange={(e) => setStrength(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>

          <div
            style={{
              padding: "16px",
              backgroundColor: "#f8fafc",
              borderRadius: "12px",
              fontSize: "0.9rem",
              lineHeight: "1.6",
            }}
          >
            {mode === "gradient" && (
              <p>
                🔴 <strong>Gradient:</strong> 스칼라 함수가 가장 가파르게
                증가하는 방향과 크기를 나타냅니다. 전위(V)의 변화량을
                보여줍니다.
              </p>
            )}
            {mode === "divergence" && (
              <p>
                🔵 <strong>Divergence:</strong> 한 점(Source)에서 벡터가 뿜어져
                나가는 정도를 나타냅니다. 가우스 법칙의 핵심입니다.
              </p>
            )}
            {mode === "curl" && (
              <p>
                🟢 <strong>Curl/Stokes:</strong> 벡터장의 회전 성분입니다.
                전류가 흐를 때 주변에 자기장이 회전하며 생기는 현상을
                설명합니다.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VectorCalculusWidget;
