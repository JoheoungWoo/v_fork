import { generateVCQuiz } from "@/api/vectorCalcApi";
import katex from "katex";
import "katex/dist/katex.min.css";
import {
  CheckCircle2,
  Loader2,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useCallback, useState } from "react";

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
// ──────────────────────────────────────────────────────────────────────────────
// 토픽 설정
// ──────────────────────────────────────────────────────────────────────────────
const TOPICS = [
  {
    id: "random",
    label: "랜덤",
    sublabel: "∇f / ∇·A / ∇×A",
    color: "bg-[#0047a5] text-white border-[#0047a5]",
    activeRing: "ring-2 ring-[#0047a5] ring-offset-2",
  },
  {
    id: "gradient",
    label: "기울기",
    sublabel: "Gradient ∇f",
    color: "bg-orange-500 text-white border-orange-500",
    activeRing: "ring-2 ring-orange-400 ring-offset-2",
  },
  {
    id: "divergence",
    label: "발산",
    sublabel: "Divergence ∇·A",
    color: "bg-blue-500 text-white border-blue-500",
    activeRing: "ring-2 ring-blue-400 ring-offset-2",
  },
  {
    id: "curl",
    label: "회전",
    sublabel: "Curl ∇×A",
    color: "bg-emerald-500 text-white border-emerald-500",
    activeRing: "ring-2 ring-emerald-400 ring-offset-2",
  },
];

const TOPIC_BADGE = {
  gradient: { label: "기울기 ∇f", cls: "bg-orange-100 text-orange-700" },
  divergence: { label: "발산 ∇·A", cls: "bg-blue-100 text-blue-700" },
  curl: { label: "회전 ∇×A", cls: "bg-emerald-100 text-emerald-700" },
};

// ──────────────────────────────────────────────────────────────────────────────
// KaTeX 렌더러 ($ ... $ 혼합 텍스트)
// ──────────────────────────────────────────────────────────────────────────────
function MathText({ text, block = false }) {
  if (!text) return null;
  const parts = text.split(/(\$[^$]+\$)/g);
  if (block) {
    // 줄바꿈 처리
    return (
      <span>
        {parts.map((part, i) =>
          part.startsWith("$") && part.endsWith("$") ? (
            <InlineMath key={i} math={part.slice(1, -1)} />
          ) : (
            <span key={i} style={{ whiteSpace: "pre-wrap" }}>
              {part}
            </span>
          ),
        )}
      </span>
    );
  }
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith("$") && part.endsWith("$") ? (
          <InlineMath key={i} math={part.slice(1, -1)} />
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// 점수 표시
// ──────────────────────────────────────────────────────────────────────────────
function ScoreBar({ correct, total }) {
  if (total === 0) return null;
  const pct = Math.round((correct / total) * 100);
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-gray-500">
        {correct}/{total} 정답
      </span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#0047a5] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-bold text-[#0047a5] w-10 text-right">{pct}%</span>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// 메인 퀴즈 컴포넌트
// ──────────────────────────────────────────────────────────────────────────────
export default function VectorCalcQuiz({ onProbeUpdate }) {
  const [selectedTopic, setSelectedTopic] = useState("random");
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chosen, setChosen] = useState(null); // 선택한 보기 인덱스
  const [showExpl, setShowExpl] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const fetchQuiz = useCallback(
    async (topic = selectedTopic) => {
      setLoading(true);
      setChosen(null);
      setShowExpl(false);
      setQuiz(null);
      try {
        const data = await generateVCQuiz(topic);
        setQuiz(data);
        // 3D 뷰어 탐색점도 동기화
        if (onProbeUpdate && data.probe) {
          onProbeUpdate(data.probe, data.field_id, data.topic);
        }
      } catch (e) {
        console.error("quiz error:", e);
      } finally {
        setLoading(false);
      }
    },
    [selectedTopic, onProbeUpdate],
  );

  const handleTopicSelect = (id) => {
    setSelectedTopic(id);
    setQuiz(null);
    setChosen(null);
    setShowExpl(false);
  };

  const handleChoose = (idx) => {
    if (chosen !== null) return; // 이미 선택함
    setChosen(idx);
    setShowExpl(true);
    setScore((prev) => ({
      correct: prev.correct + (idx === quiz.answer ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const badge = quiz ? TOPIC_BADGE[quiz.topic] : null;
  const isCorrect = chosen !== null && chosen === quiz?.answer;

  return (
    <div className="flex flex-col gap-5">
      {/* ── 토픽 선택 버튼 ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        <p className="text-sm font-bold text-gray-500 mb-3">문제 유형 선택</p>
        <div className="grid grid-cols-2 gap-2">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTopicSelect(t.id)}
              className={`
                flex flex-col items-center py-3 px-2 rounded-xl border-2 transition-all
                ${selectedTopic === t.id ? t.color + " " + t.activeRing : "border-gray-200 text-gray-500 hover:border-gray-300"}
              `}
            >
              <span className="font-bold text-sm">{t.label}</span>
              <span
                className={`text-xs mt-0.5 ${selectedTopic === t.id ? "opacity-80" : "text-gray-400"}`}
              >
                {t.sublabel}
              </span>
            </button>
          ))}
        </div>

        {/* 문제 도전 버튼 */}
        <button
          onClick={() => fetchQuiz()}
          disabled={loading}
          className="mt-4 w-full py-3 rounded-xl bg-[#0047a5] text-white font-bold text-base
                     flex items-center justify-center gap-2
                     hover:bg-blue-800 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Sparkles size={18} />
          )}
          새로운 문제 도전
        </button>
      </div>

      {/* ── 점수 ────────────────────────────────────────────────────────────── */}
      {score.total > 0 && (
        <div className="px-4 py-3 bg-white border border-gray-200 rounded-2xl">
          <ScoreBar correct={score.correct} total={score.total} />
        </div>
      )}

      {/* ── 로딩 ────────────────────────────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-[#0047a5]" />
        </div>
      )}

      {/* ── 퀴즈 카드 ───────────────────────────────────────────────────────── */}
      {!loading && quiz && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            {badge && (
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${badge.cls}`}
              >
                {badge.label}
              </span>
            )}
            <span className="text-xs font-mono text-gray-400 ml-auto">
              {quiz.formula_preview}
            </span>
          </div>

          {/* 문제 */}
          <div className="px-5 pt-5 pb-4">
            <p className="font-bold text-gray-800 text-base leading-relaxed">
              <MathText text={quiz.question} />
            </p>
          </div>

          {/* 보기 */}
          <div className="flex flex-col gap-2 px-5 pb-5">
            {quiz.options.map((opt, idx) => {
              const isAns = idx === quiz.answer;
              const isChosen = idx === chosen;
              let btnCls =
                "border border-gray-200 text-gray-700 hover:border-[#0047a5] hover:bg-blue-50";

              if (chosen !== null) {
                if (isAns)
                  btnCls =
                    "border-2 border-emerald-500 bg-emerald-50 text-emerald-800";
                else if (isChosen)
                  btnCls = "border-2 border-red-400 bg-red-50 text-red-700";
                else btnCls = "border border-gray-100 text-gray-400 bg-gray-50";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleChoose(idx)}
                  disabled={chosen !== null}
                  className={`
                    flex items-center gap-3 text-left px-4 py-3 rounded-xl
                    transition-all ${btnCls} disabled:cursor-default
                  `}
                >
                  {/* 아이콘 */}
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                    {chosen !== null ? (
                      isAns ? (
                        <CheckCircle2 size={18} className="text-emerald-500" />
                      ) : isChosen ? (
                        <XCircle size={18} className="text-red-400" />
                      ) : (
                        <span className="text-xs text-gray-300 font-bold">
                          {["①", "②", "③", "④"][idx]}
                        </span>
                      )
                    ) : (
                      <span className="text-sm font-bold text-gray-400">
                        {["①", "②", "③", "④"][idx]}
                      </span>
                    )}
                  </span>
                  <span className="text-sm leading-snug">
                    <MathText text={opt} />
                  </span>
                </button>
              );
            })}
          </div>

          {/* 정오표 */}
          {chosen !== null && (
            <div
              className={`mx-5 mb-3 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2
              ${isCorrect ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}
            >
              {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              {isCorrect ? "정답입니다! 🎉" : "오답입니다."}
            </div>
          )}

          {/* 해설 */}
          {showExpl && (
            <div className="mx-5 mb-5 px-4 py-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs font-bold text-blue-600 mb-2">해설</p>
              <div className="text-sm text-blue-900 leading-relaxed whitespace-pre-line">
                <MathText text={quiz.explanation} block />
              </div>
            </div>
          )}

          {/* 다음 문제 */}
          {chosen !== null && (
            <div className="px-5 pb-5">
              <button
                onClick={() => fetchQuiz()}
                className="w-full py-3 rounded-xl border-2 border-[#0047a5] text-[#0047a5]
                           font-bold flex items-center justify-center gap-2
                           hover:bg-blue-50 active:scale-[0.98] transition-all"
              >
                <RotateCcw size={16} /> 다음 문제
              </button>
            </div>
          )}
        </div>
      )}

      {/* 초기 안내 */}
      {!loading && !quiz && (
        <div className="text-center py-8 text-gray-400 text-sm">
          유형을 선택하고 "새로운 문제 도전" 버튼을 누르세요.
        </div>
      )}
    </div>
  );
}
