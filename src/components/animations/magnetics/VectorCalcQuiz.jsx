// src/components/animations/magnetics/VectorCalcQuiz.jsx
import { generateVCQuiz } from "@/api/vectorCalcApi";
import katex from "katex";
import "katex/dist/katex.min.css";
import {
  CheckCircle2,
  Loader2,
  RotateCcw,
  RotateCcw as RotateIcon,
  Shuffle,
  TrendingUp,
  Waves,
  XCircle,
  Zap,
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
    sub: "전체 유형",
    Icon: Shuffle,
    gradient: "from-violet-500 to-purple-600",
    ring: "ring-violet-400",
    badge: "bg-violet-100 text-violet-700",
  },
  {
    id: "gradient",
    label: "기울기",
    sub: "∇f",
    Icon: TrendingUp,
    gradient: "from-orange-400 to-amber-500",
    ring: "ring-orange-400",
    badge: "bg-orange-100 text-orange-700",
  },
  {
    id: "divergence",
    label: "발산",
    sub: "∇·A",
    Icon: Waves,
    gradient: "from-blue-500 to-indigo-500",
    ring: "ring-blue-400",
    badge: "bg-blue-100 text-blue-700",
  },
  {
    id: "curl",
    label: "회전",
    sub: "∇×A",
    Icon: RotateIcon,
    gradient: "from-emerald-500 to-teal-500",
    ring: "ring-emerald-400",
    badge: "bg-emerald-100 text-emerald-700",
  },
];

const TOPIC_MAP = Object.fromEntries(TOPICS.map((t) => [t.id, t]));

// ──────────────────────────────────────────────────────────────────────────────
// MathText: $ $ 혼합 텍스트 렌더러
// ──────────────────────────────────────────────────────────────────────────────
function MathText({ text }) {
  if (!text) return null;
  const parts = String(text).split(/(\$[^$]+\$)/g);
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

// ──────────────────────────────────────────────────────────────────────────────
// 점수 바
// ──────────────────────────────────────────────────────────────────────────────
function ScoreBar({ correct, total }) {
  if (total === 0) return null;
  const pct = Math.round((correct / total) * 100);
  return (
    <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex-1">
        <div className="flex justify-between text-sm font-bold mb-1.5">
          <span className="text-gray-500">
            {correct}/{total} 정답
          </span>
          <span className="text-[#0047a5]">{pct}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background:
                pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444",
            }}
          />
        </div>
      </div>
      <div className="text-2xl">
        {pct >= 80 ? "🏆" : pct >= 50 ? "💪" : "📚"}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// 메인 퀴즈 컴포넌트
// ──────────────────────────────────────────────────────────────────────────────
export default function VectorCalcQuiz({ onProbeUpdate }) {
  const [topic, setTopic] = useState("random");
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chosen, setChosen] = useState(null);
  const [showExp, setShowExp] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const fetch = useCallback(
    async (t = topic) => {
      setLoading(true);
      setChosen(null);
      setShowExp(false);
      setQuiz(null);
      try {
        const data = await generateVCQuiz(t);
        setQuiz(data);
        if (onProbeUpdate && data.probe) {
          onProbeUpdate(data.probe, data.field_id, data.topic);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [topic, onProbeUpdate],
  );

  const handleTopicSelect = (id) => {
    setTopic(id);
    setQuiz(null);
    setChosen(null);
    setShowExp(false);
  };

  const handleChoose = (idx) => {
    if (chosen !== null) return;
    setChosen(idx);
    setShowExp(true);
    setScore((prev) => ({
      correct: prev.correct + (idx === quiz.answer ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const topicCfg = TOPIC_MAP[topic];
  const quizTopicCfg = quiz ? TOPIC_MAP[quiz.topic] : null;
  const isCorrect = chosen !== null && chosen === quiz?.answer;

  return (
    <div className="flex flex-col gap-5">
      {/* ── 토픽 선택 그리드 ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-base font-black text-gray-700 mb-4">
          문제 유형 선택
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {TOPICS.map((t) => {
            const active = topic === t.id;
            const Icon = t.Icon;
            return (
              <button
                key={t.id}
                onClick={() => handleTopicSelect(t.id)}
                className={`
                  flex flex-col items-center py-4 px-2 rounded-2xl transition-all duration-200
                  ${
                    active
                      ? `bg-gradient-to-br ${t.gradient} text-white shadow-lg ring-2 ${t.ring} ring-offset-2`
                      : "bg-gray-50 text-gray-400 hover:bg-gray-100 border-2 border-transparent"
                  }
                `}
              >
                <Icon
                  size={24}
                  className="mb-2"
                  strokeWidth={active ? 2.5 : 1.8}
                />
                <span className="text-sm font-black">{t.label}</span>
                <span
                  className={`text-xs font-bold mt-0.5 ${active ? "text-white/75" : "text-gray-400"}`}
                >
                  {t.sub}
                </span>
              </button>
            );
          })}
        </div>

        {/* 도전 버튼 */}
        <button
          onClick={() => fetch()}
          disabled={loading}
          className={`
            w-full py-4 rounded-xl font-black text-lg
            flex items-center justify-center gap-2.5
            transition-all active:scale-[0.98] disabled:opacity-60
            bg-gradient-to-r ${topicCfg.gradient} text-white
            shadow-lg hover:opacity-90
          `}
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" /> 생성 중...
            </>
          ) : (
            <>
              <Zap size={20} className="fill-current" /> 새로운 문제 도전
            </>
          )}
        </button>
      </div>

      {/* ── 점수 ─────────────────────────────────────────────────────────────── */}
      {score.total > 0 && (
        <ScoreBar correct={score.correct} total={score.total} />
      )}

      {/* ── 로딩 ─────────────────────────────────────────────────────────────── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 size={40} className="animate-spin text-[#0047a5]" />
          <p className="text-sm font-bold text-gray-400">문제 생성 중...</p>
        </div>
      )}

      {/* ── 퀴즈 카드 ───────────────────────────────────────────────────────── */}
      {!loading && quiz && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* 카드 헤더 */}
          <div
            className={`px-5 py-4 bg-gradient-to-r ${quizTopicCfg?.gradient ?? "from-gray-400 to-gray-500"}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-white font-black text-base">
                {quizTopicCfg?.label} {quizTopicCfg?.sub}
              </span>
              <span className="text-white/70 text-xs font-mono bg-white/20 px-2.5 py-1 rounded-full">
                {quiz.formula_preview}
              </span>
            </div>
          </div>

          {/* 문제 */}
          <div className="px-5 pt-5 pb-4">
            <p className="text-lg font-bold text-gray-800 leading-relaxed">
              <MathText text={quiz.question} />
            </p>
          </div>

          {/* 보기 */}
          <div className="flex flex-col gap-2.5 px-5 pb-5">
            {quiz.options.map((opt, idx) => {
              const isAns = idx === quiz.answer;
              const isChosen = idx === chosen;

              let cls =
                "border-2 border-gray-100 bg-gray-50 text-gray-700 hover:border-[#0047a5] hover:bg-blue-50 cursor-pointer";
              if (chosen !== null) {
                if (isAns)
                  cls =
                    "border-2 border-emerald-400 bg-emerald-50 text-emerald-800";
                else if (isChosen)
                  cls = "border-2 border-red-400 bg-red-50 text-red-700";
                else cls = "border-2 border-gray-100 bg-gray-50 text-gray-400";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleChoose(idx)}
                  disabled={chosen !== null}
                  className={`
                    flex items-center gap-4 px-4 py-3.5 rounded-xl text-left
                    transition-all duration-150 ${cls} disabled:cursor-default
                  `}
                >
                  {/* 번호/아이콘 */}
                  <span
                    className={`
                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black
                    ${
                      chosen === null
                        ? "bg-gray-200 text-gray-600"
                        : isAns
                          ? "bg-emerald-500 text-white"
                          : isChosen
                            ? "bg-red-400 text-white"
                            : "bg-gray-100 text-gray-400"
                    }
                  `}
                  >
                    {chosen !== null && isAns ? (
                      <CheckCircle2 size={16} />
                    ) : chosen !== null && isChosen ? (
                      <XCircle size={16} />
                    ) : (
                      ["①", "②", "③", "④"][idx]
                    )}
                  </span>
                  <span className="text-base font-semibold leading-snug">
                    <MathText text={opt} />
                  </span>
                </button>
              );
            })}
          </div>

          {/* 정오 배너 */}
          {chosen !== null && (
            <div
              className={`mx-5 mb-4 flex items-center gap-3 px-4 py-3 rounded-xl font-black text-base
              ${isCorrect ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}
            >
              {isCorrect ? (
                <>
                  <CheckCircle2 size={20} /> 정답입니다! 🎉
                </>
              ) : (
                <>
                  <XCircle size={20} /> 아쉬워요! 다시 도전하세요
                </>
              )}
            </div>
          )}

          {/* 해설 */}
          {showExp && (
            <div className="mx-5 mb-5 rounded-2xl overflow-hidden border border-blue-100">
              <div className="px-4 py-2.5 bg-blue-600 flex items-center gap-2">
                <span className="text-white font-black text-sm">💡 해설</span>
              </div>
              <div className="px-4 py-4 bg-blue-50">
                <p className="text-sm font-semibold text-blue-900 leading-loose whitespace-pre-line">
                  <MathText text={quiz.explanation} />
                </p>
              </div>
            </div>
          )}

          {/* 다음 문제 */}
          {chosen !== null && (
            <div className="px-5 pb-5">
              <button
                onClick={() => fetch()}
                className={`
                  w-full py-3.5 rounded-xl font-black text-base
                  flex items-center justify-center gap-2
                  border-2 transition-all active:scale-[0.98]
                  ${
                    isCorrect
                      ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                      : "border-[#0047a5] text-[#0047a5] hover:bg-blue-50"
                  }
                `}
              >
                <RotateCcw size={18} /> 다음 문제
              </button>
            </div>
          )}
        </div>
      )}

      {/* 초기 안내 */}
      {!loading && !quiz && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="text-5xl">🧮</div>
          <p className="text-base font-bold text-gray-500">
            유형을 선택하고 도전 버튼을 누르세요
          </p>
          <p className="text-sm text-gray-400">
            Gradient · Divergence · Curl 랜덤 문제
          </p>
        </div>
      )}
    </div>
  );
}
