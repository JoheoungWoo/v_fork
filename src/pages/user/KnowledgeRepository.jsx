import React, { useState } from "react";
// Lucide 아이콘이 없다면 원래 쓰시던 Material Icons <span> 태그로 변경하셔도 됩니다.
// import { Functions, ShowChart, AccountTree, Edit3 } from "lucide-react"; // 예시 아이콘

export default function KnowledgeRepository() {
  // 💡 토글 상태 관리: 메모 보이기/숨기기
  const [showMemo, setShowMemo] = useState(true);

  // 📝 노트 줄무늬 효과를 위한 인라인 스타일
  const linedPaperStyle = {
    backgroundColor: "#ffffff",
    backgroundImage: "linear-gradient(#e5e7eb 1px, transparent 1px)",
    backgroundSize: "100% 2rem",
    lineHeight: "2rem",
  };

  // ✍️ 손글씨 폰트 스타일 (index.html에 Nanum Pen Script 폰트가 임포트되어 있어야 합니다)
  const handwritingStyle = {
    fontFamily: "'Nanum Pen Script', cursive",
    fontSize: "1.5rem",
    color: "#334155", // text-slate-700
    opacity: 0.9,
  };

  return (
    <main className="flex-grow pt-24 pb-20 px-6 max-w-7xl mx-auto w-full font-body">
      {/* 🚀 Header Section */}
      <section className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2 font-headline">
          나의 지식 보관함
        </h1>
        <p className="text-slate-600 text-lg">
          My Knowledge Repository: Essential Engineering Concepts & Personal
          Insights
        </p>
      </section>

      {/* 🎛️ Toggle Controls */}
      <div className="flex justify-end items-center mb-8 gap-4">
        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          {showMemo ? "Hide Study Memos" : "Show Study Memos"}
        </span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={showMemo}
            onChange={() => setShowMemo(!showMemo)}
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 transition-colors"></div>
        </label>
      </div>

      {/* 📚 Repository Content */}
      <div className="flex flex-col gap-12">
        {/* ---------------------------------------------------------------- */}
        {/* Knowledge Card 01: Transfer Function */}
        <div
          className={`grid grid-cols-1 ${showMemo ? "lg:grid-cols-[1.2fr_0.8fr]" : "lg:grid-cols-1"} bg-white rounded-2xl overflow-hidden shadow-[0px_10px_30px_rgba(0,89,187,0.06)] hover:shadow-[0px_10px_30px_rgba(0,89,187,0.12)] transition-all duration-500 group border border-slate-100`}
        >
          {/* Content Area */}
          <div className="p-8 border-r border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-blue-600">
                functions
              </span>
              <h2 className="text-2xl font-bold text-slate-900">
                Transfer Function (전달 함수)
              </h2>
              <span className="ml-auto px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                CORE CONCEPT
              </span>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl mb-6 border border-slate-100">
              <div className="text-center mb-4">
                <span className="text-blue-600 font-mono text-3xl font-bold italic">
                  H(s) = Y(s) / X(s)
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                모든 초기 조건을 0으로 가정했을 때, 시스템 입력의 라플라스
                변환에 대한 출력의 라플라스 변환 비율입니다. 시스템의 동적
                특성을 결정합니다.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col p-4 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs font-bold text-slate-400 mb-1">
                  DOMAIN
                </span>
                <span className="text-slate-800 font-medium">
                  s-domain (Frequency)
                </span>
              </div>
              <div className="flex flex-col p-4 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs font-bold text-slate-400 mb-1">
                  STABILITY
                </span>
                <span className="text-slate-800 font-medium">
                  LHP Poles only
                </span>
              </div>
            </div>
          </div>

          {/* Memo Area (Right) */}
          {showMemo && (
            <div
              className="p-8 flex flex-col transition-all duration-500 bg-white group-hover:bg-blue-50/30"
              style={linedPaperStyle}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-blue-600 tracking-widest text-sm bg-white px-2 rounded">
                  MY STUDY MEMO
                </h3>
                <span className="material-symbols-outlined text-slate-300 bg-white px-1">
                  edit_note
                </span>
              </div>
              <div style={handwritingStyle} className="space-y-0 tracking-wide">
                <p>1. 모든 초기 조건은 0으로 가정할 것!</p>
                <p>
                  2. 선형 시불변 시스템(LTI)에서만 적용 가능하다는 점 잊지 말자.
                </p>
                <p>3. 분모(특성방정식)의 해가 시스템의 응답 속도를 결정함.</p>
                <p>
                  4. 다음 주 퀴즈 대비: 2차 시스템 전달함수 표준형 암기 필수.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Knowledge Card 02: Transient Response */}
        <div
          className={`grid grid-cols-1 ${showMemo ? "lg:grid-cols-[1.2fr_0.8fr]" : "lg:grid-cols-1"} bg-white rounded-2xl overflow-hidden shadow-[0px_10px_30px_rgba(0,89,187,0.06)] hover:shadow-[0px_10px_30px_rgba(0,89,187,0.12)] transition-all duration-500 group border border-slate-100`}
        >
          <div className="p-8 border-r border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-blue-600">
                show_chart
              </span>
              <h2 className="text-2xl font-bold text-slate-900">
                Transient Response (과도 응답)
              </h2>
              <span className="ml-auto px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full">
                SYSTEM ANALYSIS
              </span>
            </div>

            <div className="mb-6 relative h-48 w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
              <img
                className="w-full h-full object-cover mix-blend-multiply opacity-80"
                alt="Step response chart"
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-blue-600/20 shadow-sm">
                  <span className="text-blue-700 font-mono text-xl font-bold">
                    ζ &lt; 1 (Underdamped)
                  </span>
                </div>
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium">
              시간이 지남에 따라 소멸되는 시스템 응답의 일부입니다. 상승
              시간(Rise Time), 최대 오버슈트(Maximum Overshoot), 정착
              시간(Settling Time) 등의 지표가 중요합니다.
            </p>
          </div>

          {showMemo && (
            <div
              className="p-8 flex flex-col transition-all duration-500 bg-white group-hover:bg-blue-50/30"
              style={linedPaperStyle}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-blue-600 tracking-widest text-sm bg-white px-2 rounded">
                  MY STUDY MEMO
                </h3>
                <span className="material-symbols-outlined text-slate-300 bg-white px-1">
                  edit_note
                </span>
              </div>
              <div style={handwritingStyle} className="space-y-0 tracking-wide">
                <p>오버슈트가 너무 크면 시스템에 무리가 감.</p>
                <p>감쇠비(zeta)를 조절해서 적절한 trade-off를 찾는 게 핵심.</p>
                <p>응답 속도와 안정성은 보통 반비례 관계임.</p>
                <p>실제 설계에서는 2% 또는 5% Settling time 기준 확인 필요.</p>
              </div>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Knowledge Card 03: Block Diagram */}
        <div
          className={`grid grid-cols-1 ${showMemo ? "lg:grid-cols-[1.2fr_0.8fr]" : "lg:grid-cols-1"} bg-white rounded-2xl overflow-hidden shadow-[0px_10px_30px_rgba(0,89,187,0.06)] hover:shadow-[0px_10px_30px_rgba(0,89,187,0.12)] transition-all duration-500 group border border-slate-100`}
        >
          <div className="p-8 border-r border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-blue-600">
                account_tree
              </span>
              <h2 className="text-2xl font-bold text-slate-900">
                Block Diagram Algebra
              </h2>
              <span className="ml-auto px-3 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-full">
                VISUAL MODELING
              </span>
            </div>

            <div className="bg-blue-50/50 p-6 rounded-xl mb-6 border-l-4 border-blue-600">
              <h4 className="text-sm font-bold text-blue-700 mb-3">
                Feedback Loop Reduction
              </h4>
              <div className="flex justify-center items-center gap-4">
                <div className="px-6 py-3 bg-white rounded-lg border border-blue-100 font-mono text-xl shadow-sm text-blue-800 font-bold">
                  G / (1 + GH)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm font-medium">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600 shadow-sm shadow-blue-200"></div>
                <span className="text-slate-600">Summing Point</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-600 shadow-sm shadow-indigo-200"></div>
                <span className="text-slate-600">Pick-off Point</span>
              </div>
            </div>
          </div>

          {showMemo && (
            <div
              className="p-8 flex flex-col transition-all duration-500 bg-white group-hover:bg-blue-50/30"
              style={linedPaperStyle}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-blue-600 tracking-widest text-sm bg-white px-2 rounded">
                  MY STUDY MEMO
                </h3>
                <span className="material-symbols-outlined text-slate-300 bg-white px-1">
                  edit_note
                </span>
              </div>
              <div style={handwritingStyle} className="space-y-0 tracking-wide">
                <p>복잡한 시스템도 블록 선도로 시각화하면 편함.</p>
                <p>Mason's Gain Formula는 나중에 더 복잡해지면 공부하자.</p>
                <p>피드백 루프 방향 주의 (Positive vs Negative).</p>
                <p>대부분의 제어 시스템은 Negative Feedback 사용!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
