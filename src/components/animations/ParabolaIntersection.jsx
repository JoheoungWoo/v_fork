import "katex/dist/katex.min.css";
import { useState } from "react";
// 교체할 내용 (각 파일 상단에 추가)
import katex from "katex";

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
/**
 * 포물선과 직선의 교점 위젯 컴포넌트
 * @param {Object} props.data - 백엔드에서 전달받은 문제 데이터
 */
const ParabolaIntersection = ({ data }) => {
  const [selected, setSelected] = useState(null);
  const [showSolution, setShowSolution] = useState(false);

  // 데이터 로딩 중이거나 없을 경우 처리
  if (!data) {
    return (
      <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed">
        문제를 불러오는 중입니다...
      </div>
    );
  }

  const { problem_latex, graph_image, choices, correct_index, steps } = data;

  return (
    <div className="flex flex-col gap-6 p-6 bg-white rounded-2xl shadow-md border border-gray-100 max-w-2xl mx-auto my-4">
      {/* 1. 문제 발문 영역 */}
      <div className="text-xl font-semibold text-gray-800 leading-relaxed bg-blue-50/50 p-5 rounded-xl border border-blue-100/50">
        <BlockMath math={problem_latex} />
      </div>

      {/* 2. 그래프 시각화 영역 */}
      {graph_image && (
        <div className="flex justify-center bg-gray-50 rounded-xl p-4 border border-dashed border-gray-200 overflow-hidden">
          <img
            src={`data:image/svg+xml;base64,${graph_image}`}
            alt="Parabola Intersection Graph"
            className="max-w-full h-auto drop-shadow-sm hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* 3. 4지선다 선택지 영역 */}
      <div className="grid grid-cols-1 gap-3">
        {choices.map((choice, idx) => (
          <button
            key={idx}
            onClick={() => setSelected(idx)}
            className={`group relative p-4 text-left border-2 rounded-xl transition-all duration-200 ${
              selected === idx
                ? "border-blue-500 bg-blue-50 shadow-sm"
                : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-4">
              <span
                className={`flex items-center justify-center min-w-[32px] h-8 rounded-full border-2 text-sm font-bold transition-colors ${
                  selected === idx
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "border-gray-200 text-gray-400 group-hover:border-gray-400"
                }`}
              >
                {idx + 1}
              </span>
              <div className="text-gray-700 font-medium overflow-x-auto">
                {/* $ 기호가 포함되어 올 경우를 대비한 replace 처리 */}
                <InlineMath math={choice.replace(/\$/g, "")} />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 4. 버튼 영역 */}
      <div className="flex flex-col gap-3 mt-2">
        <button
          onClick={() => setShowSolution(!showSolution)}
          className={`w-full py-4 rounded-xl font-bold transition-all transform active:scale-[0.98] ${
            showSolution
              ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
              : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100"
          }`}
        >
          {showSolution ? "해설 닫기" : "정답 및 해설 확인하기"}
        </button>
      </div>

      {/* 5. 단계별 풀이 (토글 방식) */}
      {showSolution && (
        <div className="mt-2 p-6 bg-amber-50/50 rounded-2xl border border-amber-100 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl" role="img" aria-label="light-bulb">
              💡
            </span>
            <h4 className="text-amber-900 font-black text-lg">
              상세 풀이 과정
            </h4>
          </div>

          {/* 타임라인 형태의 풀이 과정 */}
          <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-amber-200/50">
            {steps.map((step, idx) => (
              <div key={idx} className="relative pl-10">
                {/* Step 번호 아이콘 */}
                <div className="absolute left-0 top-0 w-10 h-10 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-black border-4 border-white shadow-sm">
                  {step.step_num || idx + 1}
                </div>

                <div className="flex flex-col gap-3">
                  <p className="text-gray-800 font-semibold leading-relaxed">
                    {step.description}
                  </p>
                  <div className="bg-white/90 p-4 rounded-xl border border-amber-100 shadow-sm inline-block max-w-full overflow-x-auto">
                    <BlockMath math={step.latex} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 최종 정답 강조 */}
          <div className="mt-8 pt-6 border-t border-amber-200 flex justify-between items-center">
            <span className="text-amber-700 font-bold text-sm uppercase tracking-wider">
              Final Answer
            </span>
            <div className="px-6 py-2 bg-blue-600 text-white rounded-full font-black text-xl shadow-md">
              정답 {correct_index + 1}번
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParabolaIntersection;
