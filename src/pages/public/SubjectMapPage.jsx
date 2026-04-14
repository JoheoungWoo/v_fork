import apiClient from "@/api/core/apiClient";
import FullMapGraph from "@/components/graph/FullMapGraph";
import { useEffect, useState } from "react";

// 수식 렌더링 라이브러리
import { Latex } from "@/components/public/Latex";
import "katex/dist/katex.min.css";

// 아이콘 라이브러리
import useMove from "@/hooks/useMove";
import { BookOpen, Calculator, PenTool, Play, X } from "lucide-react";

// ----------------------------------------------------------------------
// 1. 과목 상수 데이터 (SUBJECTS)
// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// 1. 과목 상수 데이터 (SUBJECTS) - 💡 기초수학 추가 완료!
// ----------------------------------------------------------------------
const SUBJECTS = [
  {
    id: "기초수학", // 백엔드 DB 과목명과 일치해야 합니다
    label: "기초수학",
    icon: "📐",
    color: "from-pink-500 to-rose-500",
    borderColor: "border-pink-500",
    bgColor: "bg-pink-500",
    themeColor: "#ec4899",
  },
  {
    id: "전기자기학",
    label: "전기자기학",
    icon: "⚡",
    color: "from-amber-500 to-orange-500",
    borderColor: "border-amber-500",
    bgColor: "bg-amber-500",
    themeColor: "#f59e0b",
  },
  {
    id: "전력공학",
    label: "전력공학",
    icon: "🏭",
    color: "from-red-500 to-rose-500",
    borderColor: "border-red-500",
    bgColor: "bg-red-500",
    themeColor: "#ef4444",
  },
  {
    id: "전기기기",
    label: "전기기기",
    icon: "⚙️",
    color: "from-blue-500 to-indigo-500",
    borderColor: "border-blue-500",
    bgColor: "bg-blue-500",
    themeColor: "#3b82f6",
  },
  {
    id: "회로이론",
    label: "회로이론",
    icon: "🔄",
    color: "from-emerald-500 to-teal-500",
    borderColor: "border-emerald-500",
    bgColor: "bg-emerald-500",
    themeColor: "#10b981",
  },
  {
    id: "제어공학",
    label: "제어공학",
    icon: "🎛️",
    color: "from-cyan-500 to-sky-500",
    borderColor: "border-cyan-500",
    bgColor: "bg-cyan-500",
    themeColor: "#06b6d4",
  },
  {
    id: "전기설비기술기준",
    label: "설비기준",
    icon: "📜",
    color: "from-violet-500 to-purple-500",
    borderColor: "border-violet-500",
    bgColor: "bg-violet-500",
    themeColor: "#8b5cf6",
  },
];

// ✅ 노드 이름과 실제 강의 ID 매핑 객체 (모든 강의 완벽 연결!)
const NODE_TO_LECTURE_MAP = {
  // ==========================================
  // ⚡ 1. 회로이론
  // ==========================================
  "직·병렬 회로망": "circuit_resistance",
  "직렬 회로": "circuit_resistance",
  합성저항: "circuit_resistance",

  "소비 전력": "circuit_power",
  전력: "circuit_power",

  "Y-Δ 변환": "circuit_ydelta",
  "와이-델타 변환": "circuit_ydelta",
  Y결선: "circuit_ydelta",

  "Y결선 상전압과 선간전압": "circuit_y_voltage",
  상전압: "circuit_y_voltage",
  선간전압: "circuit_y_voltage",

  "옴의 법칙 (Ohm's Law)": "circuit_ohm_law_equivalent",
  "옴의 법칙": "circuit_ohm_law_equivalent",
  "병렬연결 (Parallel Connection)": "circuit_ohm_law_equivalent",

  // ==========================================
  // 📐 2. 기초수학
  // ==========================================
  "분수와 비례식": "math_fraction",
  분수: "math_fraction",
  비례식: "math_fraction",

  "지수법칙 기초": "math_exponent",
  지수법칙: "math_exponent",
  지수: "math_exponent",

  "로그의 이해": "math_logarithm",
  로그: "math_logarithm",

  인수분해: "math_factorization",
  "인수분해와 완전제곱식": "math_factorization",

  "함수의 이해": "math_function",
  함수: "math_function",
  "함수와 그래프": "math_function",

  "다항식의 연산과 곱셈공식": "math_polynomial",
  다항식: "math_polynomial",
  곱셈공식: "math_polynomial",

  "방정식과 부등식": "math_equation",
  방정식: "math_equation",
  부등식: "math_equation",

  "직선의 방정식과 두 직선의 교점": "62069c25429c16e898888d5611eb67b4",
  "직선의 방정식": "62069c25429c16e898888d5611eb67b4",

  "포물선과 직선의 교점": "61b1ec56bcd7e87535d18c40bb9afb21",
  포물선: "61b1ec56bcd7e87535d18c40bb9afb21",

  "호도법과 라디안": "math_radian",
  호도법: "math_radian",
  라디안: "math_radian",

  "삼각함수 1": "c3d27bab5e1cf6ae9f07f70ae08c1e26",
  삼각함수: "c3d27bab5e1cf6ae9f07f70ae08c1e26",
  "삼각함수의 완벽 이해": "math_trig",
  "삼각함수 2": "8fc05f0f6c31f19deeb976cb2b1562cf",

  "완전제곱식의 이해": "e935dc2d2e592a79688c5f40da5fbe23",
  완전제곱식: "e935dc2d2e592a79688c5f40da5fbe23",

  "허수와 복소수": "math_imaginary",
  허수: "math_imaginary",
  복소수: "math_imaginary",

  "기하와 벡터": "math_vector",
  벡터: "math_vector",

  "기하와 벡터의 내적": "201092af306ff8cb381808e4c3f45e0c",
  "벡터 내적": "201092af306ff8cb381808e4c3f45e0c",
  내적: "201092af306ff8cb381808e4c3f45e0c",

  "행렬과 행렬식": "math_matrix",
  행렬: "math_matrix",
  행렬식: "math_matrix",

  "미분과 적분 기초": "math_calculus",
  "미분과 적분": "math_calculus",
  적분: "math_calculus",

  "미분의 이해": "c44dc0cd81fbb02320299a7bff062e4d",
  미분: "c44dc0cd81fbb02320299a7bff062e4d",

  // ==========================================
  // 🧲 3. 전자기학
  // ==========================================
  "쿨롱의 법칙": "em_coulomb",

  "등전위선 3D 시각화": "lec_poten_3d",
  등전위선: "lec_poten_3d",

  "앙페르의 오른나사 법칙": "em_ampere_law",
  "앙페르의 법칙": "em_ampere_law",

  // ==========================================
  // 👁️ 4. AI Vision
  // ==========================================
  "AI Company의 비전과 미래": "vision_intro",
  "AI 비전": "vision_intro",

  "AI Company Vision 영상": "vision_video",
  "비전 영상": "vision_video",
};
export default function SubjectMapPage() {
  const move = useMove("/user/videos");

  // 상태 관리
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ nodes: 0, links: 0 });
  const [selectedNode, setSelectedNode] = useState(null);
  const [focusNodes, setFocusNodes] = useState([]);

  // ----------------------------------------------------------------------
  // 2. 데이터 로딩 (API 호출)
  // ----------------------------------------------------------------------
  useEffect(() => {
    const fetchGraph = async () => {
      setLoading(true);
      setGraphData({ nodes: [], links: [] });
      setSelectedNode(null);

      try {
        const res = await apiClient.get(
          `/api/graph/full-map/${encodeURIComponent(selectedSubject.id)}?include_formulas=true`,
        );

        setGraphData(res.data);

        setStats({
          nodes: res.data.nodes?.length || 0,
          links: res.data.links?.length || 0,
        });
      } catch (err) {
        console.error("그래프 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGraph();
  }, [selectedSubject]);

  // ----------------------------------------------------------------------
  // 3. 유틸리티 함수 및 핸들러
  // ----------------------------------------------------------------------
  const cleanLatexTitle = (text) => {
    if (!text) return "";
    let processed = text.replaceAll("$", "");

    const keywords = [
      { from: "Wsigma", to: "\\sigma" },
      { from: "Wpi", to: "\\pi" },
      { key: "sigma" },
      { key: "pi" },
      { key: "mu" },
      { key: "epsilon" },
      { key: "nabla" },
      { key: "int" },
      { key: "frac" },
      { key: "sqrt" },
      { key: "cdot" },
    ];

    keywords.forEach((item) => {
      if (item.from) {
        processed = processed.replaceAll(item.from, item.to);
      } else {
        const regex = new RegExp(`(?<!\\\\)\\b${item.key}\\b`, "g");
        processed = processed.replace(regex, `\\${item.key}`);
      }
    });
    return processed;
  };

  // 노드 클릭 핸들러
  const handleNodeClick = (node) => {
    if (!node) {
      setSelectedNode(null);
      return;
    }

    const detailedNode = { ...node };

    if (node.group === "Concept") {
      const connectedFormulas = graphData.links
        .filter((link) => {
          const sId =
            typeof link.source === "object" ? link.source.id : link.source;
          const tId =
            typeof link.target === "object" ? link.target.id : link.target;
          return sId === node.id || tId === node.id;
        })
        .map((link) => {
          const sId =
            typeof link.source === "object" ? link.source.id : link.source;
          const tId =
            typeof link.target === "object" ? link.target.id : link.target;
          const targetId = sId === node.id ? tId : sId;
          return graphData.nodes.find((n) => n.id === targetId);
        })
        .filter((n) => n && n.group === "Formula");

      detailedNode.connectedFormulas = connectedFormulas;
    } else if (node.group === "Formula") {
      detailedNode.name = "수식 상세";
      detailedNode.connectedFormulas = [
        {
          id: node.id,
          latex: node.latex,
          name: node.name,
          description: node.description,
        },
      ];
    }

    setSelectedNode(detailedNode);
  };

  // ✅ [추가됨] 강의 보기 버튼 클릭 핸들러
  const handlePlayLecture = () => {
    if (!selectedNode || !selectedNode.name) return;

    const lectureId = NODE_TO_LECTURE_MAP[selectedNode.name];

    if (lectureId) {
      move(`/user/videos/${lectureId}`);
    } else {
      alert(
        `[${selectedNode.name}] 개념에 연결된 강의 영상이 아직 준비되지 않았습니다.`,
      );
    }
  };

  // ----------------------------------------------------------------------
  // 4. 렌더링 (JSX)
  // ----------------------------------------------------------------------
  return (
    <div className="flex flex-col h-screen bg-[#020617] overflow-hidden relative font-sans text-slate-200">
      {/* ================= Header ================= */}
      <header className="absolute top-0 left-0 right-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-white/5 transition-all">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg bg-gradient-to-br ${selectedSubject.color} shadow-lg shadow-white/5`}
            >
              <span className="text-xl">🗺️</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                전기기사 지식 맵
              </h1>
              <p className="text-xs text-slate-400">
                {stats.nodes > 0
                  ? `${stats.nodes}개의 지식 노드 탐색 중`
                  : "데이터 로딩 중..."}
              </p>
            </div>
          </div>

          <button
            onClick={() => move("/user")}
            className="text-sm text-slate-400 hover:text-white px-3 py-1 rounded-full border border-slate-700 hover:bg-slate-800 transition"
          >
            나가기
          </button>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto scrollbar-hide border-t border-white/5 bg-slate-950/50">
          {SUBJECTS.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap border ${
                selectedSubject.id === sub.id
                  ? `bg-slate-800 border-${sub.borderColor.split("-")[1]}-500 text-white shadow-[0_0_15px_${sub.themeColor}40]`
                  : "bg-transparent border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5"
              }`}
            >
              <span>{sub.icon}</span>
              <span>{sub.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* ================= Main Graph Area ================= */}
      <main className="flex-1 relative w-full h-full">
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <div
                className={`animate-spin w-12 h-12 border-4 rounded-full border-t-transparent`}
                style={{
                  borderColor: selectedSubject.themeColor,
                  borderTopColor: "transparent",
                }}
              ></div>
              <span className="text-slate-300 font-medium animate-pulse">
                지식 그래프 생성 중...
              </span>
            </div>
          </div>
        )}

        <FullMapGraph
          data={graphData}
          focusNodeIds={focusNodes}
          onNodeClick={handleNodeClick}
          subject={selectedSubject.label}
        />

        {/* ================= Detail Panel (상세 모달) ================= */}
        {selectedNode && (
          <div className="absolute top-36 right-4 w-[90%] md:w-96 z-40 animate-in slide-in-from-right duration-300">
            <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-200px)]">
              {/* 패널 헤더 */}
              <div
                className={`px-5 py-4 border-b border-white/10 flex justify-between items-start bg-gradient-to-r ${
                  selectedNode.group === "Formula"
                    ? "from-red-900/20 to-rose-900/20"
                    : selectedNode.group === "Topic"
                      ? "from-green-900/20 to-emerald-900/20"
                      : "from-slate-800 to-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      selectedNode.group === "Formula"
                        ? "bg-red-500/20 text-red-400"
                        : selectedNode.group === "Topic"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {selectedNode.group === "Formula" ? (
                      <Calculator size={18} />
                    ) : (
                      <BookOpen size={18} />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                      {selectedNode.group}
                    </span>
                    <h3 className="text-lg font-bold text-white leading-tight">
                      {selectedNode.group === "Formula" ? (
                        <Latex>{`$$ ${cleanLatexTitle(selectedNode.latex || selectedNode.name)} $$`}</Latex>
                      ) : (
                        selectedNode.name
                      )}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* 패널 본문 */}
              <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                {/* 1. 설명/정의 */}
                <div className="text-slate-300 text-sm leading-7">
                  {!selectedNode.description && !selectedNode.definition ? (
                    <div className="text-center py-8 text-slate-500 italic">
                      상세 설명 데이터가 없습니다.
                    </div>
                  ) : (
                    <Latex>
                      {selectedNode.description || selectedNode.definition}
                    </Latex>
                  )}
                </div>

                {/* 연결된 하위 수식(Formula) 리스트 렌더링 */}
                {selectedNode.connectedFormulas &&
                  selectedNode.connectedFormulas.length > 0 && (
                    <div className="pt-4 border-t border-white/10">
                      <h4 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
                        <Calculator size={14} />
                        관련 공식{" "}
                        <span className="text-xs bg-red-500/10 px-2 py-0.5 rounded-full">
                          {selectedNode.connectedFormulas.length}
                        </span>
                      </h4>
                      <div className="space-y-3">
                        {selectedNode.connectedFormulas.map((formula, idx) => (
                          <div
                            key={formula.id || idx}
                            className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 overflow-x-auto flex justify-center hover:bg-slate-800 transition-colors"
                          >
                            <Latex>{`$$ ${cleanLatexTitle(formula.latex || formula.name)} $$`}</Latex>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* 액션 버튼 */}
                {selectedNode.group !== "Formula" && (
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                    {/* ✅ [수정됨] alert 함수 대신 handlePlayLecture 실행 */}
                    <button
                      onClick={handlePlayLecture}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition shadow-lg shadow-blue-900/20"
                    >
                      <Play size={16} fill="currentColor" /> 강의 보기
                    </button>
                    <button
                      onClick={() => alert("문제 풀이 기능 준비 중")}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm transition"
                    >
                      <PenTool size={16} /> 문제 풀기
                    </button>
                  </div>
                )}

                {selectedNode.group === "Chapter" && (
                  <button
                    onClick={() =>
                      move(
                        `/study/chapter/${selectedNode.id.replace("C:", "")}`,
                      )
                    }
                    className="w-full py-3 mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-500 hover:to-teal-500 transition shadow-lg"
                  >
                    📚 이 단원 집중 학습하기
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
