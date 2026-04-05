import React, { useEffect, useRef, useCallback, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

// ✅ [핵심 수정] 강력해진 LaTeX -> 텍스트 변환기
// 정규식 한계(중첩 괄호)를 극복하기 위해 반복적으로 껍질을 벗깁니다.
const latexToUnicode = (latex) => {
  if (!latex) return "";
  let text = latex;

  // 0. 불필요한 $ 제거
  text = text.replaceAll("$", "");

  // 1. 장식용 명령어 제거 (내용만 남김)
  // 예: \mathbf{E} -> E, \vec{r} -> r, \hat{a} -> a
  // 반복문을 돌려 중첩된 경우도 처리 (예: \mathbf{\vec{A}})
  let prev;
  do {
    prev = text;
    text = text
      .replace(
        /\\(mathbf|mathrm|vec|hat|bar|overline|underline)\{([^{}]+)\}/g,
        "$2",
      ) // 괄호 있는 것
      .replace(
        /\\(mathbf|mathrm|vec|hat|bar|overline|underline)\s+([a-zA-Z0-9])/g,
        "$2",
      ); // 괄호 없는 것
  } while (text !== prev);

  // 2. 분수 변환: \frac{A}{B} -> (A/B)
  // 괄호 안에 또 괄호가 있는 경우를 위해 반복 처리
  do {
    prev = text;
    text = text.replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, "($1/$2)");
  } while (text !== prev);

  // 3. 루트 변환: \sqrt{A} -> √(A)
  text = text.replace(/\\sqrt\s*\{([^{}]+)\}/g, "√($1)");

  // 4. 특수 기호 맵핑 (그리스 문자, 연산자)
  const map = {
    "\\sigma": "σ",
    "\\rho": "ρ",
    "\\epsilon": "ε",
    "\\mu": "μ",
    "\\lambda": "λ",
    "\\alpha": "α",
    "\\beta": "β",
    "\\gamma": "γ",
    "\\delta": "δ",
    "\\theta": "θ",
    "\\phi": "φ",
    "\\omega": "ω",
    "\\pi": "π",
    "\\tau": "τ",
    "\\nabla": "∇",
    "\\Delta": "Δ",
    "\\Omega": "Ω",
    "\\Sigma": "Σ",
    "\\times": "×",
    "\\cdot": "·",
    "\\pm": "±",
    "\\approx": "≈",
    "\\neq": "≠",
    "\\leq": "≤",
    "\\geq": "≥",
    "\\infty": "∞",
    "\\partial": "∂",
    "\\int": "∫",
    "\\oint": "∮",
    "\\sum": "∑",
    "\\rightarrow": "→",
    "\\leftarrow": "←",
    _0: "₀",
    _1: "₁",
    _2: "₂",
    _3: "₃", // 아래첨자
    "^2": "²",
    "^3": "³", // 위첨자
  };

  for (const [key, val] of Object.entries(map)) {
    text = text.replaceAll(key, val);
  }

  // 5. 남은 찌꺼기 청소 (혹시 변환 안 된 괄호나 백슬래시 제거)
  text = text
    .replace(/\\/g, "") // 백슬래시 제거
    .replace(/\{/g, "") // 남은 여는 중괄호 제거
    .replace(/\}/g, "") // 남은 닫는 중괄호 제거
    .replace(/\s+/g, " ") // 연속 공백 제거
    .trim();

  return text;
};

const FullMapGraph = ({
  data,
  onNodeClick,
  subject = "전기자기학",
  focusNodeIds = [],
}) => {
  const fgRef = useRef();
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (!fgRef.current || !data.nodes?.length) return;
    if (focusNodeIds.length === 0) {
      setTimeout(() => {
        fgRef.current.zoomToFit(800, 80);
      }, 500);
    } else {
      const targetNode = data.nodes.find((n) => n.id === focusNodeIds[0]);
      if (targetNode) {
        fgRef.current.centerAt(targetNode.x, targetNode.y, 1000);
        fgRef.current.zoom(6, 2000);
      }
    }
  }, [data, focusNodeIds]);

  // 🎨 노드 그리기
  const paintNode = useCallback(
    (node, ctx, globalScale) => {
      if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) return;

      const isFormula = node.group === "Formula";

      // ✅ 변환된 라벨 사용
      let label = node.name || "";
      if (isFormula) {
        label = latexToUnicode(label);
      }

      const fontSize = Math.max(12 / globalScale, 2);
      let color, size;

      switch (node.group) {
        case "Subject":
          color = "#f43f5e";
          size = 25;
          break;
        case "Chapter":
          color = "#fbbf24";
          size = 14;
          break; // Gold
        case "Topic":
          color = "#a855f7";
          size = 6;
          break;
        case "Concept":
          color = "#10b981";
          size = 4;
          break;
        case "Formula":
          color = "#22d3ee";
          size = 4;
          break; // Cyan
        default:
          color = "#64748b";
          size = 3;
      }

      const isHovered = hoveredNode?.id === node.id;
      const isSelected =
        selectedNode?.id === node.id || focusNodeIds.includes(node.id);

      if (isHovered || isSelected) {
        size *= 1.5;
        color = "#ffffff";
      }

      // 원 그리기
      ctx.beginPath();
      ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
      ctx.fillStyle = color;

      if (isSelected) {
        ctx.shadowColor = isFormula ? "#22d3ee" : "#ffffff";
        ctx.shadowBlur = 15;
      } else if (node.group === "Chapter") {
        ctx.shadowColor = "#fbbf24";
        ctx.shadowBlur = 10;
      }
      ctx.fill();
      ctx.shadowBlur = 0;

      // 챕터 테두리
      if (node.group === "Chapter" && !isSelected) {
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 2 / globalScale;
        ctx.stroke();
      }

      // 텍스트 렌더링
      const shouldShowLabel =
        node.group === "Subject" ||
        isHovered ||
        isSelected ||
        (node.group === "Chapter" && globalScale > 0.8) ||
        (node.group === "Topic" && globalScale > 1.5) ||
        (node.group === "Concept" && globalScale > 2.2) ||
        (node.group === "Formula" && globalScale > 3.0);

      if (shouldShowLabel && label) {
        const fontFace = isFormula ? "Times New Roman, serif" : "Sans-Serif";
        const fontStyle = isFormula ? "italic bold" : "bold";

        ctx.font = `${fontStyle} ${fontSize}px ${fontFace}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const textY = node.y + size + fontSize / 2 + 2 / globalScale;
        const textWidth = ctx.measureText(label).width;
        const bcp = 2 / globalScale;

        // 배경 박스
        ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
        if (node.group === "Chapter") {
          ctx.strokeStyle = "#fbbf24";
          ctx.lineWidth = 0.5 / globalScale;
          ctx.strokeRect(
            node.x - textWidth / 2 - bcp,
            textY - fontSize / 2 - bcp,
            textWidth + bcp * 2,
            fontSize + bcp * 2,
          );
        } else if (isFormula) {
          ctx.strokeStyle = "#22d3ee";
          ctx.lineWidth = 0.5 / globalScale;
          ctx.strokeRect(
            node.x - textWidth / 2 - bcp,
            textY - fontSize / 2 - bcp,
            textWidth + bcp * 2,
            fontSize + bcp * 2,
          );
        }
        ctx.fillRect(
          node.x - textWidth / 2 - bcp,
          textY - fontSize / 2 - bcp,
          textWidth + bcp * 2,
          fontSize + bcp * 2,
        );

        if (isFormula) ctx.fillStyle = "#67e8f9";
        else if (node.group === "Chapter") ctx.fillStyle = "#fcd34d";
        else ctx.fillStyle = "#ffffff";

        ctx.fillText(label, node.x, textY);
      }
    },
    [hoveredNode, selectedNode, focusNodeIds],
  );

  // 🔗 선 그리기 (Concept 연결선 강화)
  const paintLink = useCallback(
    (link, ctx, globalScale) => {
      if (!Number.isFinite(link.source.x) || !Number.isFinite(link.target.x))
        return;

      let color = "#475569";
      let width = 0.5;
      let opacity = 0.3;

      // 타겟에 따른 스타일
      if (link.target.group === "Chapter") {
        color = "#fbbf24";
        width = 1.5;
        opacity = 0.6;
      } else if (link.target.group === "Concept") {
        // Concept 연결선: 초록색으로 진하게
        color = "#10b981";
        width = 1.2;
        opacity = 0.5;
      } else if (link.target.group === "Formula") {
        // Formula 연결선: 청록색
        color = "#06b6d4";
        width = 1.0;
        opacity = 0.6;
      }

      // 호버 시 강조
      if (
        hoveredNode &&
        (link.source.id === hoveredNode.id || link.target.id === hoveredNode.id)
      ) {
        color = "#ffffff";
        width = 2.0;
        opacity = 1.0;
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = width / globalScale;
      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.moveTo(link.source.x, link.source.y);
      ctx.lineTo(link.target.x, link.target.y);
      ctx.stroke();
      ctx.globalAlpha = 1;
    },
    [hoveredNode],
  );

  return (
    <div className="w-full h-full bg-[#020617]">
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        nodeCanvasObject={paintNode}
        linkCanvasObject={paintLink}
        linkCanvasObjectMode={() => "replace"}
        linkDirectionalParticles={(link) =>
          link.target.group === "Formula" || link.target.group === "Concept"
            ? 2
            : 0
        }
        linkDirectionalParticleWidth={2}
        backgroundColor="#020617"
        onNodeHover={setHoveredNode}
        onNodeClick={(node) => {
          setSelectedNode(node);
          if (onNodeClick) onNodeClick(node);
          fgRef.current.centerAt(node.x, node.y, 500);
          fgRef.current.zoom(5, 1000);
        }}
        onBackgroundClick={() => setSelectedNode(null)}
      />
    </div>
  );
};

export default FullMapGraph;
