import katex from "katex";
import { BookOpen, FileText, RotateCcw, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";

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

// ✅ 계층별 색상 정의
const NODE_COLORS = {
  subject: { bg: "#1e3a8a", border: "#1e40af", text: "#ffffff" },
  chapter: { bg: "#3b82f6", border: "#2563eb", text: "#ffffff" },
  topic: { bg: "#10b981", border: "#059669", text: "#ffffff" },
  concept: { bg: "#f59e0b", border: "#d97706", text: "#ffffff" },
  formula: { bg: "#ef4444", border: "#dc2626", text: "#ffffff" },
};

const GraphVisualization = ({ items, subjectInfo }) => {
  const cyRef = useRef(null);
  const [elements, setElements] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!items || items.length === 0) return;

    const nodes = [];
    const edges = [];
    const nodeSet = new Set();

    // Subject 노드 (중앙)
    const subjectId = `S-${subjectInfo?.code || "ALL"}`;
    nodes.push({
      data: {
        id: subjectId,
        label: subjectInfo?.title || "전체",
        type: "subject",
      },
      position: { x: 0, y: 0 }, // ✅ 중앙 고정
    });
    nodeSet.add(subjectId);

    // Chapter 그룹핑
    const chapterMap = new Map();
    const chapterList = [];

    items.forEach((item) => {
      const chapterCode = item.code.split("-").slice(0, 2).join("-");

      if (!chapterMap.has(chapterCode)) {
        const chapterId = `C-${chapterCode}`;
        chapterList.push(chapterId);

        nodes.push({
          data: {
            id: chapterId,
            label: `Ch.${chapterCode.split("-")[1]}`,
            type: "chapter",
            chapterCode: chapterCode,
          },
        });

        edges.push({
          data: {
            id: `${subjectId}-${chapterId}`,
            source: subjectId,
            target: chapterId,
          },
        });

        chapterMap.set(chapterCode, { id: chapterId, topics: [] });
      }

      // Topic 수집 (나중에 원형 배치)
      const topicId = `T-${item.uid}`;
      if (!nodeSet.has(topicId)) {
        nodes.push({
          data: {
            id: topicId,
            label: item.title,
            type: "topic",
            parentChapter: chapterMap.get(chapterCode).id,
          },
        });
        nodeSet.add(topicId);

        chapterMap.get(chapterCode).topics.push(topicId);

        edges.push({
          data: {
            id: `${chapterMap.get(chapterCode).id}-${topicId}`,
            source: chapterMap.get(chapterCode).id,
            target: topicId,
          },
        });
      }

      // Concept 노드
      item.concepts?.forEach((concept) => {
        const conceptId = `K-${concept.uid}`;
        if (!nodeSet.has(conceptId)) {
          nodes.push({
            data: {
              id: conceptId,
              label: concept.name,
              type: "concept",
              description: concept.summary || "",
              definition: concept.definition || "",
              formulas: concept.formulas || [],
              parentTopic: topicId,
            },
          });
          nodeSet.add(conceptId);

          edges.push({
            data: {
              id: `${topicId}-${conceptId}`,
              source: topicId,
              target: conceptId,
            },
          });
        }

        // Formula 노드
        concept.formulas?.forEach((formula, idx) => {
          const formulaId = `F-${concept.uid}-${idx}`;
          if (!nodeSet.has(formulaId)) {
            nodes.push({
              data: {
                id: formulaId,
                label: "ƒ",
                type: "formula",
                latex: formula,
                parentConcept: conceptId,
              },
            });
            nodeSet.add(formulaId);

            edges.push({
              data: {
                id: `${conceptId}-${formulaId}`,
                source: conceptId,
                target: formulaId,
              },
            });
          }
        });
      });
    });

    setElements([...nodes, ...edges]);

    // ✅ 원형 레이아웃 적용 (Chapter 중심)
    setTimeout(() => {
      if (cyRef.current) {
        const cy = cyRef.current;

        // 1. Subject를 중앙에 고정
        const subjectNode = cy.getElementById(subjectId);
        subjectNode.position({ x: 0, y: 0 });

        // 2. Chapter들을 Subject 주변에 원형 배치
        const chapterNodes = cy.nodes('[type="chapter"]');
        const chapterCount = chapterNodes.length;
        const chapterRadius = 300; // Subject로부터의 거리

        chapterNodes.forEach((chNode, index) => {
          const angle = (index * 2 * Math.PI) / chapterCount;
          const x = chapterRadius * Math.cos(angle);
          const y = chapterRadius * Math.sin(angle);
          chNode.position({ x, y });

          // 3. 각 Chapter의 Topic들을 원형 배치
          const topics = cy.nodes(`[parentChapter="${chNode.id()}"]`);
          const topicCount = topics.length;
          const topicRadius = 200; // Chapter로부터의 거리

          topics.forEach((tNode, tIndex) => {
            const tAngle = (tIndex * 2 * Math.PI) / topicCount;
            const tX = x + topicRadius * Math.cos(tAngle);
            const tY = y + topicRadius * Math.sin(tAngle);
            tNode.position({ x: tX, y: tY });

            // 4. Topic의 Concept들을 원형 배치
            const concepts = cy.nodes(`[parentTopic="${tNode.id()}"]`);
            const conceptCount = concepts.length;
            const conceptRadius = 120;

            concepts.forEach((cNode, cIndex) => {
              const cAngle = (cIndex * 2 * Math.PI) / conceptCount;
              const cX = tX + conceptRadius * Math.cos(cAngle);
              const cY = tY + conceptRadius * Math.sin(cAngle);
              cNode.position({ x: cX, y: cY });

              // 5. Concept의 Formula들을 원형 배치
              const formulas = cy.nodes(`[parentConcept="${cNode.id()}"]`);
              const formulaCount = formulas.length;
              const formulaRadius = 80;

              formulas.forEach((fNode, fIndex) => {
                const fAngle = (fIndex * 2 * Math.PI) / formulaCount;
                const fX = cX + formulaRadius * Math.cos(fAngle);
                const fY = cY + formulaRadius * Math.sin(fAngle);
                fNode.position({ x: fX, y: fY });
              });
            });
          });
        });

        // 6. 전체 뷰 맞추기
        cy.fit(100);
        cy.center();
      }
    }, 200);
  }, [items, subjectInfo]);

  // ✅ Cytoscape 스타일시트
  const stylesheet = [
    {
      selector: "node",
      style: {
        label: "data(label)",
        "text-valign": "center",
        "text-halign": "center",
        "font-family": "Pretendard, sans-serif",
        "font-weight": 700,
        "text-wrap": "wrap",
        "text-max-width": "120px",
        "font-size": "12px",
        "overlay-opacity": 0,
      },
    },
    {
      selector: 'node[type="subject"]',
      style: {
        width: 120,
        height: 120,
        "background-color": NODE_COLORS.subject.bg,
        "border-width": 5,
        "border-color": NODE_COLORS.subject.border,
        color: NODE_COLORS.subject.text,
        "font-size": "22px",
        shape: "round-rectangle",
      },
    },
    {
      selector: 'node[type="chapter"]',
      style: {
        width: 90,
        height: 90,
        "background-color": NODE_COLORS.chapter.bg,
        "border-width": 4,
        "border-color": NODE_COLORS.chapter.border,
        color: NODE_COLORS.chapter.text,
        "font-size": "16px",
        shape: "round-rectangle",
      },
    },
    {
      selector: 'node[type="topic"]',
      style: {
        width: 70,
        height: 70,
        "background-color": NODE_COLORS.topic.bg,
        "border-width": 3,
        "border-color": NODE_COLORS.topic.border,
        color: NODE_COLORS.topic.text,
        "font-size": "12px",
        shape: "ellipse",
      },
    },
    {
      selector: 'node[type="concept"]',
      style: {
        width: 55,
        height: 55,
        "background-color": NODE_COLORS.concept.bg,
        "border-width": 2,
        "border-color": NODE_COLORS.concept.border,
        color: NODE_COLORS.concept.text,
        "font-size": "10px",
        shape: "cut-rectangle",
      },
    },
    {
      selector: 'node[type="formula"]',
      style: {
        width: 40,
        height: 40,
        "background-color": NODE_COLORS.formula.bg,
        "border-width": 2,
        "border-color": NODE_COLORS.formula.border,
        color: NODE_COLORS.formula.text,
        "font-size": "18px",
        "font-family": "serif",
        "font-style": "italic",
        shape: "ellipse",
      },
    },
    {
      selector: "edge",
      style: {
        width: 2,
        "line-color": "#64748b",
        "target-arrow-color": "#64748b",
        "target-arrow-shape": "triangle",
        "curve-style": "bezier",
        "arrow-scale": 1,
        opacity: 0.6,
      },
    },
    {
      selector: ".highlighted",
      style: {
        "border-width": 5,
        "border-color": "#fbbf24",
        "z-index": 999,
      },
    },
  ];

  const handleNodeClick = (node) => {
    const data = node.data();

    if (data.type === "concept") {
      setSelectedNode({
        name: data.label,
        description: data.description,
        definition: data.definition,
        formulas: data.formulas || [],
      });
      setIsModalOpen(true);

      if (cyRef.current) {
        cyRef.current.elements().removeClass("highlighted");
        node.addClass("highlighted");
      }
    }
  };

  const handleReset = () => {
    if (cyRef.current) {
      cyRef.current.fit(100);
      cyRef.current.center();
      cyRef.current.zoom(1);
    }
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-2xl">
      {/* ✅ 리셋 버튼 */}
      <div className="absolute bottom-6 right-6 z-10">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur rounded-xl shadow-lg hover:bg-white transition-all"
          title="초기화"
        >
          <RotateCcw size={18} className="text-slate-700" />
          <span className="text-sm font-bold text-slate-700">초기화</span>
        </button>
      </div>

      {/* 범례 */}
      <div className="absolute top-6 left-6 z-10 bg-white/95 backdrop-blur rounded-xl px-4 py-3 shadow-lg">
        <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
          노드 타입
        </div>
        <div className="space-y-2">
          {Object.entries(NODE_COLORS).map(([type, colors]) => (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: colors.bg,
                  border: `2px solid ${colors.border}`,
                }}
              />
              <span className="text-xs font-medium text-slate-700 capitalize">
                {type === "subject"
                  ? "과목"
                  : type === "chapter"
                    ? "챕터"
                    : type === "topic"
                      ? "주제"
                      : type === "concept"
                        ? "개념"
                        : "공식"}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="text-xs text-slate-500 flex items-center gap-1">
            💡 <span className="font-medium">마우스 휠</span>로 줌 조절
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
            🖱️ <span className="font-medium">개념 클릭</span> 시 상세정보
          </div>
        </div>
      </div>

      {/* ✅ Cytoscape 그래프 (마우스 휠 활성화) */}
      <CytoscapeComponent
        elements={elements}
        stylesheet={stylesheet}
        style={{ width: "100%", height: "100%" }}
        cy={(cy) => {
          cyRef.current = cy;
          cy.on("tap", "node", (evt) => handleNodeClick(evt.target));

          // ✅ 마우스 휠 줌 활성화
          cy.userZoomingEnabled(true);
          cy.panningEnabled(true);
          cy.boxSelectionEnabled(false);
        }}
        wheelSensitivity={0.2} // ✅ 마우스 휠 민감도 (작을수록 부드러움)
        minZoom={0.1}
        maxZoom={3}
      />

      {/* Concept 상세 모달 */}
      {isModalOpen && selectedNode && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-orange-50 to-amber-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                  <BookOpen size={20} className="text-white" />
                </div>
                <div>
                  <div className="text-xs text-orange-600 font-bold uppercase tracking-wider">
                    Concept
                  </div>
                  <h2 className="text-2xl font-black text-gray-800">
                    {selectedNode.name}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-orange-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {selectedNode.description && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-500 mb-2">
                    <FileText size={16} /> 설명
                  </div>
                  <p className="text-gray-700 leading-relaxed text-base">
                    {selectedNode.description}
                  </p>
                </div>
              )}

              {selectedNode.definition && (
                <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                    정의 (Definition)
                  </div>
                  <p className="text-gray-800 leading-relaxed font-medium">
                    {selectedNode.definition}
                  </p>
                </div>
              )}

              {selectedNode.formulas && selectedNode.formulas.length > 0 && (
                <div>
                  <div className="text-sm font-bold text-gray-500 mb-3">
                    관련 공식 ({selectedNode.formulas.length}개)
                  </div>
                  <div className="space-y-3">
                    {selectedNode.formulas.map((formula, idx) => (
                      <div
                        key={idx}
                        className="bg-amber-50 border border-amber-200 rounded-xl p-4 overflow-x-auto"
                      >
                        <div className="text-xs text-amber-700 font-bold mb-2">
                          Formula {idx + 1}
                        </div>
                        <div className="flex justify-center text-2xl">
                          <BlockMath math={formula} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!selectedNode.description &&
                !selectedNode.definition &&
                (!selectedNode.formulas ||
                  selectedNode.formulas.length === 0) && (
                  <div className="text-center py-10 text-gray-400">
                    등록된 상세 정보가 없습니다.
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphVisualization;
