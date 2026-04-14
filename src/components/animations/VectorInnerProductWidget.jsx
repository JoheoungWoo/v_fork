import katex from "katex";
import { AlertCircle, Calculator, MousePointer2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

// ── KaTeX 헬퍼 컴포넌트 ──────────────────────────────────────
const InlineMath = ({ math }) => {
  const html = katex.renderToString(math, {
    throwOnError: false,
    displayMode: false,
  });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const BlockMath = ({ math }) => {
  const html = katex.renderToString(math, {
    throwOnError: false,
    displayMode: true,
  });
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};
// ─────────────────────────────────────────────────────────────

const VectorInnerProductWidget = () => {
  const [u, setU] = useState({ x: 3, y: 4 });
  const [v, setV] = useState({ x: 6, y: 0 });
  const [dragging, setDragging] = useState(null);
  const svgRef = useRef(null);

  const SVG_SIZE = 500;
  const CENTER = SVG_SIZE / 2;
  const SCALE = 25;

  const mathToSvg = (mathX, mathY) => ({
    x: CENTER + mathX * SCALE,
    y: CENTER - mathY * SCALE,
  });

  const svgToMath = (svgX, svgY) => ({
    x: (svgX - CENTER) / SCALE,
    y: (CENTER - svgY) / SCALE,
  });

  const { dot, magU, magV, proj, angle, isOrthogonal } = useMemo(() => {
    const dotProduct = u.x * v.x + u.y * v.y;
    const magnitudeU = Math.sqrt(u.x ** 2 + u.y ** 2);
    const magnitudeV = Math.sqrt(v.x ** 2 + v.y ** 2);

    let projX = 0;
    let projY = 0;
    if (magnitudeV > 0) {
      const scalar = dotProduct / magnitudeV ** 2;
      projX = scalar * v.x;
      projY = scalar * v.y;
    }

    let theta = 0;
    if (magnitudeU > 0 && magnitudeV > 0) {
      let cosTheta = dotProduct / (magnitudeU * magnitudeV);
      if (cosTheta > 1) cosTheta = 1;
      if (cosTheta < -1) cosTheta = -1;
      theta = (Math.acos(cosTheta) * 180) / Math.PI;
    }

    return {
      dot: dotProduct,
      magU: magnitudeU,
      magV: magnitudeV,
      proj: { x: projX, y: projY },
      angle: isNaN(theta) ? 0 : theta,
      isOrthogonal: dotProduct === 0 && magnitudeU > 0 && magnitudeV > 0,
    };
  }, [u, v]);

  const handlePointerDown = (e, vectorName) => {
    e.preventDefault();
    setDragging(vectorName);
  };

  const handlePointerMove = (e) => {
    if (!dragging || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    const svgX = ((clientX - rect.left) / rect.width) * SVG_SIZE;
    const svgY = ((clientY - rect.top) / rect.height) * SVG_SIZE;

    const { x, y } = svgToMath(svgX, svgY);
    let snappedX = Math.round(x);
    let snappedY = Math.round(y);

    snappedX = Math.max(-10, Math.min(10, snappedX));
    snappedY = Math.max(-10, Math.min(10, snappedY));

    if (snappedX === 0 && snappedY === 0) {
      snappedX = dragging === "u" ? 0 : 1;
      snappedY = dragging === "u" ? 1 : 0;
    }

    if (dragging === "u") setU({ x: snappedX, y: snappedY });
    if (dragging === "v") setV({ x: snappedX, y: snappedY });
  };

  const handlePointerUp = () => setDragging(null);

  useEffect(() => {
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchend", handlePointerUp);
    return () => {
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, []);

  const svgU = mathToSvg(u.x, u.y);
  const svgV = mathToSvg(v.x, v.y);
  const svgProj = mathToSvg(proj.x, proj.y);
  const svgOrigin = mathToSvg(0, 0);

  const gridLines = [];
  for (let i = -10; i <= 10; i++) {
    const pos = CENTER + i * SCALE;
    gridLines.push(
      <line
        key={`v${i}`}
        x1={pos}
        y1={0}
        x2={pos}
        y2={SVG_SIZE}
        stroke={i === 0 ? "#94a3b8" : "#f1f5f9"}
        strokeWidth={i === 0 ? 2 : 1}
      />,
      <line
        key={`h${i}`}
        x1={0}
        y1={pos}
        x2={SVG_SIZE}
        y2={pos}
        stroke={i === 0 ? "#94a3b8" : "#f1f5f9"}
        strokeWidth={i === 0 ? 2 : 1}
      />,
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-6xl mx-auto my-4">
      {/* 왼쪽: SVG 시각화 */}
      <div className="flex-1 relative touch-none select-none">
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-sm font-bold text-gray-600 flex items-center gap-2 z-10">
          <MousePointer2 size={16} className="text-blue-500 animate-pulse" />
          화살표 끝을 드래그하여 움직여보세요
        </div>

        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          className="w-full h-auto bg-slate-50 rounded-2xl cursor-crosshair border border-slate-200"
          onMouseMove={handlePointerMove}
          onTouchMove={handlePointerMove}
          style={{ touchAction: "none" }}
        >
          <g>{gridLines}</g>

          {isOrthogonal && (
            <g>
              <rect
                x={svgOrigin.x}
                y={svgOrigin.y - (u.y > 0 || v.y > 0 ? 20 : -20)}
                width="20"
                height="20"
                fill="rgba(34, 197, 94, 0.2)"
                stroke="#22c55e"
                strokeWidth="2"
                transform={`rotate(${Math.atan2(-v.y, v.x) * (180 / Math.PI)}, ${svgOrigin.x}, ${svgOrigin.y})`}
              />
            </g>
          )}

          <line
            x1={svgU.x}
            y1={svgU.y}
            x2={svgProj.x}
            y2={svgProj.y}
            stroke="#94a3b8"
            strokeWidth="2"
            strokeDasharray="5,5"
          />

          {/* 벡터 V (빨간색) */}
          <line
            x1={svgOrigin.x}
            y1={svgOrigin.y}
            x2={svgV.x}
            y2={svgV.y}
            stroke="#f43f5e"
            strokeWidth="4"
          />
          <polygon
            points="0,-6 12,0 0,6"
            fill="#f43f5e"
            transform={`translate(${svgV.x}, ${svgV.y}) rotate(${Math.atan2(svgOrigin.y - svgV.y, svgV.x - svgOrigin.x) * (180 / Math.PI)})`}
          />

          {/* 투영 벡터 (초록색) */}
          {dot !== 0 && (
            <line
              x1={svgOrigin.x}
              y1={svgOrigin.y}
              x2={svgProj.x}
              y2={svgProj.y}
              stroke="#22c55e"
              strokeWidth="6"
              opacity="0.6"
              strokeLinecap="round"
            />
          )}

          {/* 벡터 U (파란색) */}
          <line
            x1={svgOrigin.x}
            y1={svgOrigin.y}
            x2={svgU.x}
            y2={svgU.y}
            stroke="#3b82f6"
            strokeWidth="4"
          />
          <polygon
            points="0,-6 12,0 0,6"
            fill="#3b82f6"
            transform={`translate(${svgU.x}, ${svgU.y}) rotate(${Math.atan2(svgOrigin.y - svgU.y, svgU.x - svgOrigin.x) * (180 / Math.PI)})`}
          />

          {/* 드래그 핸들 (투명 원) */}
          <circle
            cx={svgV.x}
            cy={svgV.y}
            r="25"
            fill="transparent"
            className="cursor-grab hover:cursor-grabbing"
            onMouseDown={(e) => handlePointerDown(e, "v")}
            onTouchStart={(e) => handlePointerDown(e, "v")}
          />
          <circle
            cx={svgU.x}
            cy={svgU.y}
            r="25"
            fill="transparent"
            className="cursor-grab hover:cursor-grabbing"
            onMouseDown={(e) => handlePointerDown(e, "u")}
            onTouchStart={(e) => handlePointerDown(e, "u")}
          />

          {/* 끝점 표시 */}
          <circle
            cx={svgV.x}
            cy={svgV.y}
            r="6"
            fill="#fff"
            stroke="#f43f5e"
            strokeWidth="3"
            className="pointer-events-none"
          />
          <circle
            cx={svgU.x}
            cy={svgU.y}
            r="6"
            fill="#fff"
            stroke="#3b82f6"
            strokeWidth="3"
            className="pointer-events-none"
          />
        </svg>
      </div>

      {/* 오른쪽: 계산 패널 */}
      <div className="flex-1 flex flex-col gap-4 min-w-[300px]">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-2 border-b pb-4">
          <Calculator className="text-[#0047a5]" /> 실시간 내적 계산기
        </h3>

        <div
          className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-start gap-3 ${
            isOrthogonal
              ? "bg-green-50 border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)] scale-105"
              : "bg-blue-50/50 border-blue-100"
          }`}
        >
          {isOrthogonal ? (
            <AlertCircle className="text-green-500 shrink-0 mt-0.5" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              i
            </div>
          )}
          <div>
            <h4
              className={`font-bold ${isOrthogonal ? "text-green-700 text-lg" : "text-blue-800"}`}
            >
              {isOrthogonal
                ? "🎯 수직 (Orthogonal) 발견!"
                : "기하학적 의미 (투영)"}
            </h4>
            <p
              className={`text-sm mt-1 leading-relaxed ${isOrthogonal ? "text-green-600 font-medium" : "text-blue-600/80"}`}
            >
              {isOrthogonal
                ? "두 벡터가 정확히 90도를 이룹니다. 직각일 때 서로에게 미치는 영향(투영된 그림자)이 0이 되므로 내적 값은 항상 0이 됩니다."
                : "파란색 벡터(U)에서 수직으로 빛을 비추었을 때, 빨간색 벡터(V) 위로 생기는 그림자(초록색 선)의 길이가 내적의 크기를 결정합니다."}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl space-y-6 text-gray-700">
          {/* 1. 벡터 좌표 */}
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              1. Vector Coordinates
            </div>
            <div className="flex gap-4">
              <div className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg font-mono font-medium">
                <InlineMath math={`\\vec{u} = (${u.x}, ${u.y})`} />
              </div>
              <div className="bg-rose-100 text-rose-800 px-3 py-1.5 rounded-lg font-mono font-medium">
                <InlineMath math={`\\vec{v} = (${v.x}, ${v.y})`} />
              </div>
            </div>
          </div>

          {/* 2. 내적 계산 */}
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              2. Dot Product (내적)
            </div>
            <div
              className={`p-4 rounded-lg bg-white border ${isOrthogonal ? "border-green-300" : "border-gray-200"} text-center overflow-x-auto`}
            >
              <BlockMath
                math={`\\vec{u} \\cdot \\vec{v} = (${u.x})(${v.x}) + (${u.y})(${v.y})`}
              />
              <div
                className={`text-3xl font-black mt-2 ${isOrthogonal ? "text-green-500" : dot < 0 ? "text-rose-500" : "text-slate-800"}`}
              >
                = {dot}
              </div>
            </div>
          </div>

          {/* 3. 각도 계산 */}
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              3. Angle & Arccosine (역코사인)
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 overflow-x-auto">
              <div className="text-sm text-gray-500 mb-2 border-b pb-2">
                내적 공식을 변형하면 각도 θ를 구할 수 있습니다:
                <div className="mt-1">
                  <InlineMath
                    math={`\\cos\\theta = \\frac{\\vec{u} \\cdot \\vec{v}}{|\\vec{u}| |\\vec{v}|}`}
                  />
                </div>
              </div>
              <BlockMath
                math={`\\theta = \\cos^{-1}\\left(\\frac{${dot}}{${magU.toFixed(1)} \\times ${magV.toFixed(1)}}\\right)`}
              />
              <div className="text-center text-xl font-bold text-[#0047a5] mt-2">
                <InlineMath
                  math={`\\theta \\approx ${angle.toFixed(1)}^\\circ`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VectorInnerProductWidget;
