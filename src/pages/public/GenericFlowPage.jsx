import "katex/dist/katex.min.css";
import {
  BookOpen,
  ChevronRight,
  Info,
  Layers,
  Loader2,
  Maximize,
  Menu,
  RefreshCw,
  Search,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import { BlockMath, InlineMath } from "react-katex";
import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "@/api/core/apiClient";

const NODE_STYLES = {
  chapter: {
    bg: "#1e3a8a",
    color: "#ffffff",
    border: "#1e3a8a",
    label: "챕터 (Chapter)",
  },
  topic: {
    bg: "#3b82f6",
    color: "#ffffff",
    border: "#2563eb",
    label: "주제 (Topic)",
  },
  concept: {
    bg: "#ffffff",
    color: "#000000",
    border: "#334155",
    label: "개념 (Concept)",
  },
  formula: {
    bg: "#fef08a",
    color: "#000000",
    border: "#eab308",
    label: "공식 (Formula)",
  },
};

const THEMES = {
  mc: { name: "전기기기" },
  pw: { name: "전력공학" },
  ct: { name: "회로이론" },
  em: { name: "전기자기학" },
  kec: { name: "전기설비기술기준" },
  default: { name: "기타" },
};

export default function GenericFlowPage({ subject: propSubject }) {
  const location = useLocation();
  const navigate = useNavigate();
  const cyRef = useRef(null);

  const currentSubject = useMemo(() => {
    if (propSubject) return propSubject.toLowerCase();
    const segs = location.pathname.split("/");
    const lastSeg = segs[segs.length - 1].toLowerCase();
    return ["mc", "pw", "ct", "em", "kec"].includes(lastSeg) ? lastSeg : "mc";
  }, [propSubject, location]);

  const themeName = THEMES[currentSubject]?.name || "기타";

  const [chapterList, setChapterList] = useState([]);
  const [activeChapter, setActiveChapter] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [elements, setElements] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const stylesheet = useMemo(
    () => [
      {
        selector: "node",
        style: {
          label: (ele) => {
            const lbl = ele.data("label") || "";
            return lbl.replace(/\$[^$]*\$/g, "").trim() || lbl;
          },
          "text-valign": "center",
          "text-halign": "center",
          "font-family": "Pretendard, sans-serif",
          "font-weight": 800,
          "text-wrap": "wrap",
          "text-max-width": "120px",
          "z-index": 10,
          "overlay-opacity": 0,
        },
      },
      {
        selector: 'node[type="chapter"]',
        style: {
          width: 200,
          height: 90,
          "font-size": 22,
          shape: "round-rectangle",
          "background-color": NODE_STYLES.chapter.bg,
          color: NODE_STYLES.chapter.color,
          "border-width": 0,
        },
      },
      {
        selector: 'node[type="topic"]',
        style: {
          width: 160,
          height: 70,
          "font-size": 18,
          shape: "round-rectangle",
          "background-color": NODE_STYLES.topic.bg,
          color: NODE_STYLES.topic.color,
          "border-width": 0,
        },
      },
      {
        selector: 'node[type="concept"]',
        style: {
          width: 130,
          height: 60,
          "font-size": 15,
          shape: "cut-rectangle",
          "background-color": NODE_STYLES.concept.bg,
          color: NODE_STYLES.concept.color,
          "border-color": NODE_STYLES.concept.border,
          "border-width": 2,
          "font-weight": 700,
        },
      },
      {
        selector: 'node[type="formula"]',
        style: {
          label: "ƒ",
          shape: "ellipse",
          width: 60,
          height: 60,
          "background-color": NODE_STYLES.formula.bg,
          "border-color": NODE_STYLES.formula.border,
          "border-width": 3,
          "font-size": 30,
          color: NODE_STYLES.formula.color,
          "font-family": "serif",
          "font-style": "italic",
        },
      },
      {
        selector: "edge",
        style: {
          width: 2,
          "curve-style": "bezier",
          "line-color": "#94a3b8",
          "target-arrow-color": "#94a3b8",
          "target-arrow-shape": "triangle",
          "arrow-scale": 1.2,
        },
      },
      {
        selector: ".highlight",
        style: {
          "border-width": 4,
          "border-color": "#ea580c",
          "line-color": "#ea580c",
          "target-arrow-color": "#ea580c",
          "background-color": (ele) =>
            ele.data("type") === "concept"
              ? "#fff7ed"
              : ele.style("background-color"),
        },
      },
      { selector: ".faded", style: { opacity: 0.15 } },
    ],
    [],
  );

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const res = await apiClient.get(`/api/presentation/chapters/list`, {
          params: { subject: currentSubject.toUpperCase() },
        });
        setChapterList(res.data);
        if (res.data.length > 0) handleChapterSelect(res.data[0]);
      } catch (err) {
        console.error("챕터 로드 실패", err);
      }
    };
    fetchChapters();
  }, [currentSubject]);

  // ✅ 데이터 정제 (Sanitize) 함수 추가
  const sanitizeNodes = (nodes) =>
    nodes.map((n) => ({
      ...n,
      group: "nodes", // 강제로 'nodes' 그룹 지정
      data: {
        ...n.data,
        // 백엔드에서 group이 'Topic' 등으로 넘어왔다면 data.type으로 옮겨줌
        type:
          n.group && n.group !== "nodes" ? n.group.toLowerCase() : n.data?.type,
      },
    }));

  const sanitizeEdges = (edges) =>
    edges.map((e) => ({
      ...e,
      group: "edges", // 강제로 'edges' 그룹 지정
    }));

  const handleChapterSelect = async (chapter) => {
    setActiveChapter(chapter);
    setLoading(true);

    const rootNode = {
      group: "nodes",
      data: {
        id: chapter.code,
        label: chapter.title,
        type: "chapter",
        loaded: false,
        isBase: true,
      },
      position: { x: 0, y: 0 },
    };

    try {
      const res = await apiClient.get(`/api/presentation/children`, {
        params: { parentId: chapter.code },
      });
      const nodes = res.data.nodes || [];
      const edges = res.data.edges || [];

      // ✅ 1. 가져온 데이터의 group 속성 충돌 방지
      const safeNodes = sanitizeNodes(nodes).map((n) => ({
        ...n,
        data: { ...n.data, isBase: true },
      }));
      const safeEdges = sanitizeEdges(edges);

      setElements([rootNode, ...safeNodes, ...safeEdges]);

      setTimeout(() => {
        if (cyRef.current) {
          cyRef.current
            .layout({
              name: "grid",
              fit: true,
              padding: 50,
              avoidOverlap: true,
              cols: 5,
              sort: (a, b) => {
                if (a.data("type") === "chapter") return -1;
                if (b.data("type") === "chapter") return 1;
                return a.id().localeCompare(b.id());
              },
              animate: false,
            })
            .run();
        }
      }, 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = useCallback(async (nodeData) => {
    const cy = cyRef.current;
    if (!cy) return;

    const clickedNode = cy.getElementById(nodeData.id);
    const parentPos = clickedNode.position();

    cy.elements().removeClass("highlight faded");
    clickedNode.neighborhood().add(clickedNode).addClass("highlight");
    cy.elements()
      .not(clickedNode.neighborhood().add(clickedNode))
      .addClass("faded");

    cy.center(clickedNode);
    cy.zoom(1.2);

    if (nodeData.type === "formula" || nodeData.loaded) {
      openDetailModal(clickedNode, nodeData);
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.get(`/api/presentation/children`, {
        params: { parentId: nodeData.id },
      });
      const nodes = res.data.nodes || [];
      const edges = res.data.edges || [];

      if (nodes.length === 0) {
        openDetailModal(clickedNode, nodeData);
        clickedNode.data("loaded", true);
      } else {
        // ✅ 2. 가져온 데이터의 group 속성 충돌 방지
        const safeNodes = sanitizeNodes(nodes);
        const safeEdges = sanitizeEdges(edges);

        const positionedChildren = calculateCircularPositions(
          parentPos,
          safeNodes,
        );

        setElements((prev) => {
          const existIds = new Set(prev.map((e) => e.data.id));
          const newNodes = positionedChildren.filter(
            (n) => !existIds.has(n.data.id),
          );
          const newEdges = safeEdges.filter((e) => !existIds.has(e.data.id));
          return [...prev, ...newNodes, ...newEdges];
        });
        clickedNode.data("loaded", true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateCircularPositions = (centerPos, newNodes) => {
    const count = newNodes.length;
    if (count === 0) return [];
    const radius = Math.max(180, count * 35);
    const angleStep = (2 * Math.PI) / count;

    return newNodes.map((node, index) => {
      const angle = index * angleStep - Math.PI / 2;
      return {
        ...node,
        data: { ...node.data, isBase: false },
        position: {
          x: centerPos.x + radius * Math.cos(angle),
          y: centerPos.y + radius * Math.sin(angle),
        },
      };
    });
  };

  const handleBackgroundTap = () => {
    if (cyRef.current) {
      const cy = cyRef.current;
      cy.elements().removeClass("highlight faded");
      setElements((prev) =>
        prev.filter((el) => {
          if (el.data.source && el.data.target) return true;
          return el.data.isBase === true || el.data.isBase === undefined;
        }),
      );
      cy.fit(50);
    }
  };

  const handleCloseModal = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsModalOpen(false);
    setSelectedNode(null);
  };

  const openDetailModal = (cyNode, nodeData) => {
    let relatedLatex = [];
    if (nodeData.type === "concept") {
      // 필요한 로직을 주석 해제하여 사용
    }
    setSelectedNode({ ...nodeData, relatedLatex });
    setIsModalOpen(true);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term) {
      setSearchResults([]);
      return;
    }
    const results = elements
      .filter((el) => el.data.label?.toLowerCase().includes(term.toLowerCase()))
      .map((el) => el.data);
    setSearchResults(results.slice(0, 5));
  };

  const handleResetView = () => {
    setIsModalOpen(false);
    setSearchTerm("");
    setSearchResults([]);
    handleBackgroundTap();
  };

  return (
    <div className="flex w-screen h-screen bg-slate-50 font-sans overflow-hidden">
      {/* 사이드바 */}
      <div
        className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-40 shadow-xl ${isSidebarOpen ? "w-80 translate-x-0" : "w-0 -translate-x-full opacity-0"}`}
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              {themeName}
            </h2>
            <h1 className="text-xl font-black text-gray-800">목차 선택</h1>
          </div>
          <button
            onClick={() => navigate("/presentation/select")}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
          {chapterList.map((chapter) => (
            <button
              key={chapter.code}
              onClick={() => handleChapterSelect(chapter)}
              className={`w-full text-left px-4 py-4 rounded-xl flex items-center gap-3 transition-all duration-200 border ${
                activeChapter?.code === chapter.code
                  ? "bg-blue-50 border-blue-200 shadow-sm"
                  : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-100"
              }`}
            >
              <div
                className={`p-2 rounded-lg ${activeChapter?.code === chapter.code ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"}`}
              >
                <BookOpen size={20} />
              </div>
              <div className="flex-1">
                <div
                  className={`text-sm font-bold ${activeChapter?.code === chapter.code ? "text-blue-700" : "text-gray-700"}`}
                >
                  {chapter.title}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {chapter.code}
                </div>
              </div>
              {activeChapter?.code === chapter.code && (
                <ChevronRight size={16} className="text-blue-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-6 left-6 z-50 p-3 bg-white shadow-lg rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600"
        >
          <Menu size={24} />
        </button>
      )}

      {/* 메인 그래프 */}
      <div className="flex-1 relative h-full">
        {loading && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-white/90 px-6 py-2 rounded-full shadow-lg flex items-center gap-3 border border-blue-100">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <span className="text-sm font-bold text-slate-600">
              데이터 로딩 중...
            </span>
          </div>
        )}

        {/* 툴바 */}
        <div className="absolute top-6 right-6 z-30 flex gap-4 pointer-events-none">
          {isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="pointer-events-auto p-3 bg-white/90 backdrop-blur shadow-xl rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50"
            >
              <X size={20} />
            </button>
          )}
          <div className="pointer-events-auto w-80 relative">
            <div className="bg-white/90 backdrop-blur shadow-xl rounded-2xl border border-gray-200 flex items-center px-4 py-3">
              <Search size={20} className="text-gray-400 mr-3" />
              <input
                className="bg-transparent outline-none w-full text-sm font-medium"
                placeholder="검색..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm font-medium border-b last:border-0"
                    onClick={() => {
                      const cy = cyRef.current;
                      const node = cy.getElementById(item.id);
                      cy.center(node);
                      cy.zoom(1.2);
                      handleNodeClick(item);
                      setSearchTerm("");
                    }}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 범례 (Legend) */}
        <div className="absolute bottom-8 left-8 z-30 bg-white/95 backdrop-blur shadow-xl px-5 py-4 rounded-2xl border border-gray-200 flex flex-col gap-3 transition-all hover:scale-105">
          <div className="flex items-center gap-2 text-gray-500 font-extrabold text-xs mb-1 uppercase tracking-wider">
            <Layers size={14} /> Node Type
          </div>
          {Object.values(NODE_STYLES).map((style, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full shadow-sm ring-1 ring-inset ring-black/10"
                style={{
                  backgroundColor: style.bg,
                  border: `2px solid ${style.border}`,
                }}
              ></div>
              <span className="text-xs font-bold text-slate-700">
                {style.label}
              </span>
            </div>
          ))}
        </div>

        {/* 하단 컨트롤 */}
        <div className="absolute bottom-8 right-8 z-30 flex flex-col gap-2">
          <div className="bg-white/90 backdrop-blur shadow-xl rounded-xl p-2 border border-gray-200 flex flex-col gap-1">
            <button
              onClick={handleResetView}
              className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg"
            >
              <RefreshCw size={20} />
            </button>
            <div className="h-px bg-gray-200 mx-1" />
            <button
              onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 1.2)}
              className="p-2 hover:bg-gray-50 text-gray-600 rounded-lg"
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 0.8)}
              className="p-2 hover:bg-gray-50 text-gray-600 rounded-lg"
            >
              <ZoomOut size={20} />
            </button>
            <button
              onClick={() => cyRef.current?.fit(50)}
              className="p-2 hover:bg-gray-50 text-gray-600 rounded-lg"
            >
              <Maximize size={20} />
            </button>
          </div>
        </div>

        <CytoscapeComponent
          elements={elements}
          stylesheet={stylesheet}
          style={{ width: "100%", height: "100%" }}
          wheelSensitivity={0.5}
          minZoom={0.1}
          maxZoom={5}
          layout={{ name: "preset" }}
          zoomingEnabled={true}
          userZoomingEnabled={true}
          panningEnabled={true}
          userPanningEnabled={true}
          cy={(cy) => {
            cyRef.current = cy;
            cy.userZoomingEnabled(true);
            cy.userPanningEnabled(true);
            cy.boxSelectionEnabled(false);

            cy.on("tap", "node", (e) => handleNodeClick(e.target.data()));
            cy.on("tap", (e) => {
              if (e.target === cy) handleBackgroundTap();
            });
          }}
        />
      </div>

      {/* 모달 */}
      {isModalOpen && selectedNode && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-blue-50">
              <div className="flex items-center gap-3">
                <span className="w-2 h-8 rounded-full bg-blue-600"></span>
                <h2 className="text-2xl font-black text-gray-800">
                  {selectedNode.label.replace(/\$[^$]*\$/g, "").trim() ||
                    "상세 정보"}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-black/5 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {selectedNode.description && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-400 mb-2">
                    <Info size={16} /> 설명
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg font-medium">
                    {selectedNode.description}
                  </p>
                </div>
              )}
              {selectedNode.latex && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center mb-4">
                  <div className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-3">
                    Formula
                  </div>
                  <div className="text-3xl text-gray-800 py-2 overflow-x-auto flex justify-center">
                    <BlockMath math={selectedNode.latex} />
                  </div>
                </div>
              )}
              {selectedNode.relatedLatex?.length > 0 && (
                <div className="space-y-3">
                  <div className="text-sm font-bold text-gray-400">
                    관련 공식
                  </div>
                  {selectedNode.relatedLatex.map((lat, i) => (
                    <div
                      key={i}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center overflow-x-auto"
                    >
                      <InlineMath math={lat} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
