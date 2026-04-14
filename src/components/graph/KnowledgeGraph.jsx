import { useCallback, useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

const KnowledgeGraph = ({ data, onNodeClick, subject, focusNodeIds }) => {
  const fgRef = useRef();
  const [hoveredNode, setHoveredNode] = useState(null);

  // 데이터 로드 시 초기 줌
  useEffect(() => {
    if (fgRef.current && data.nodes?.length > 0) {
      setTimeout(() => {
        fgRef.current.zoomToFit(800, 80);
      }, 500);
    }
  }, [data]);

  // 🔥 [핵심] 음성 명령으로 타겟 노드가 들어오면 줌인
  useEffect(() => {
    if (
      focusNodeIds &&
      focusNodeIds.length > 0 &&
      fgRef.current &&
      data.nodes.length > 0
    ) {
      const targetId = focusNodeIds[0];
      const node = data.nodes.find((n) => n.id === targetId);

      if (node) {
        console.log("🔭 줌인 타겟:", node.name);
        // 좌표(x, y)로 이동하며 줌 레벨을 4로 확대 (2000ms 동안)
        fgRef.current.centerAt(node.x, node.y, 2000);
        fgRef.current.zoom(4, 2000);
      }
    }
  }, [focusNodeIds, data]);

  // 노드 그리기 (Canvas API)
  const paintNode = useCallback(
    (node, ctx, globalScale) => {
      if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) return;

      const label = node.name || "";
      // 줌 레벨에 따라 글씨 크기 조정
      const fontSize = Math.max(12 / globalScale, 2);

      let color, size;
      switch (node.group) {
        case "Subject":
          color = "#f43f5e";
          size = 20;
          break;
        case "Chapter":
          color = "#3b82f6";
          size = 12;
          break;
        case "Topic":
          color = "#a855f7";
          size = 8;
          break;
        case "Concept":
          color = "#10b981";
          size = 5;
          break;
        case "Formula":
          color = "#06b6d4";
          size = 3;
          break;
        default:
          color = "#64748b";
          size = 3;
      }

      if (
        node === hoveredNode ||
        (focusNodeIds && focusNodeIds.includes(node.id))
      ) {
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 15;
        size *= 1.5;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
      ctx.fillStyle = color;
      ctx.fill();

      // 텍스트 라벨 (줌이 어느 정도 되었을 때만 표시)
      if (
        globalScale > 0.8 ||
        node.group === "Subject" ||
        node === hoveredNode
      ) {
        ctx.font = `${fontSize}px Sans-Serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fillText(label, node.x, node.y + size + 2);
      }
    },
    [hoveredNode, focusNodeIds],
  );

  return (
    <ForceGraph2D
      ref={fgRef}
      graphData={data}
      nodeLabel="name"
      backgroundColor="#020617" // slate-950
      nodeCanvasObject={paintNode}
      onNodeClick={(node) => {
        // 클릭 시에도 줌인
        fgRef.current.centerAt(node.x, node.y, 1000);
        fgRef.current.zoom(4, 1000);
        onNodeClick(node);
      }}
      onNodeHover={setHoveredNode}
      linkColor={() => "#334155"} // slate-700
      linkWidth={1}
      d3AlphaDecay={0.02} // 안정화 속도
      d3VelocityDecay={0.3} // 마찰력
    />
  );
};

export default KnowledgeGraph;
