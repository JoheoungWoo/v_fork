import apiClient from "@/api/core/apiClient";
import katex from "katex";
import "katex/dist/katex.min.css";
import {
  CheckCircle2,
  Loader2,
  MoveLeft,
  Sparkles,
  XCircle,
} from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// 컴포넌트 Import
import QnaCard from "@/components/quiz/QnaCard";
import RecommendedVideo from "@/components/video/RecommendedVideo";
import VideoInfo from "@/components/video/VideoInfo";
import VideoPlayer from "@/components/video/VideoPlayer";
import VideoPlayerList from "@/components/video/VideoPlayList";

import {
  circuitLectures,
  emLectures,
  mathLectures,
  visionLectures,
} from "@/constants/videoData";

// ==========================================
// 💡 1. WIDGET_MAP 완전 내장 (경로 에러 원천 차단!)
// ==========================================
const WIDGET_MAP = {
  trig_circle: lazy(
    () => import("@/components/animations/InteractiveUnitCircle"),
  ),
  ohms_law: lazy(
    () => import("@/components/animations/ParallelResistanceWidget"),
  ),
  y_delta_converter: lazy(
    () => import("@/components/animations/YDeltaConverterWidget"),
  ),
  coulombs_law: lazy(() => import("@/components/animations/CoulombsLaw3DPage")),
  rotating_field: lazy(
    () => import("@/components/animations/RotatingMagneticFieldWidget"),
  ),
  dc_rectifier: lazy(
    () => import("@/components/animations/DcRectificationWidget"),
  ),
  equipotential: lazy(
    () => import("@/components/animations/Equipotential3DWidget"),
  ),
  ampere_law: lazy(() => import("@/components/animations/AmpereLawWidget")),
  parabolaWidget: lazy(
    () => import("@/components/animations/ParabolaIntersection"),
  ),
  vectorInnerProject: lazy(
    () => import("@/components/animations/VectorInnerProductWidget"),
  ),
  derivative: lazy(() => import("@/components/animations/DerivativeWidget")),
};

// ==========================================
// 💡 2. 무적의 수식 렌더링 도구 모음
// ==========================================
const KatexInline = ({ math }) => {
  if (!math) return null;
  const cleanMath = String(math).replace(/\\\\/g, "\\");
  const html = katex.renderToString(cleanMath, { throwOnError: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const KatexBlock = ({ math }) => {
  if (!math) return null;
  const cleanMath = String(math).replace(/\\\\/g, "\\");
  const html = katex.renderToString(cleanMath, {
    throwOnError: false,
    displayMode: true,
  });
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

const MixedText = ({ text }) => {
  if (!text) return null;
  const parts = String(text).split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          return <KatexBlock key={i} math={part.slice(2, -2)} />;
        } else if (part.startsWith("$") && part.endsWith("$")) {
          return <KatexInline key={i} math={part.slice(1, -1)} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};
// ==========================================

const ALL_LECTURES = [
  ...mathLectures,
  ...circuitLectures,
  ...emLectures,
  ...visionLectures,
];

export default function AiVideoWatch() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [videoInfo, setVideoInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("quiz");

  const [problemData, setProblemData] = useState(null);
  const [isFetchingProblem, setIsFetchingProblem] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  const localVideoData = ALL_LECTURES.find((l) => l.id === id);
  const isVision = id.startsWith("vision_");

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/api/video/url/${id}`);
        // 💡 콘솔에 찍힌 API 데이터(res.data)를 로컬 데이터와 덮어씌웁니다.
        const merged = { ...localVideoData, ...res.data };
        setVideoInfo(merged);
      } catch (error) {
        setVideoInfo(localVideoData);
      } finally {
        setLoading(false);
      }
    };

    setProblemData(null);
    setSelectedIndex(null);
    setShowSolution(false);
    setIsCorrect(null);

    if (id) fetchVideoData();
  }, [id, localVideoData]);

  // 💡 3. 위젯 맵 연결 (이제 무조건 인식됩니다!)
  const WidgetComponent = useMemo(() => {
    const type = videoInfo?.widget_type || videoInfo?.widgetType;
    if (!type) return null;
    return WIDGET_MAP[type] || null;
  }, [videoInfo]);

  const handleFetchProblem = async () => {
    setIsFetchingProblem(true);
    setSelectedIndex(null);
    setShowSolution(false);
    setIsCorrect(null);

    try {
      let newData = null;
      if (videoInfo && videoInfo.generator) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        newData = videoInfo.generator();
      } else {
        const endpoint = id.includes("circuit")
          ? "/api/circuit/random"
          : "/api/math/random";
        const res = await apiClient.get(`${endpoint}?type=${id}`);
        newData = res.data;
      }
      setProblemData(newData);
    } catch (e) {
      alert("백엔드에서 문제를 가져오는데 실패했습니다.");
    } finally {
      setIsFetchingProblem(false);
    }
  };

  const handleChoiceClick = (index) => {
    if (showSolution) return;
    const correct = index === problemData.correct_index;
    setSelectedIndex(index);
    setIsCorrect(correct);
    setShowSolution(true);
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-[#0047a5]" size={48} />
      </div>
    );

  if (!videoInfo)
    return (
      <div className="pt-32 text-center text-xl font-bold">
        영상을 찾을 수 없습니다.
      </div>
    );

  const problemText =
    problemData?.problem || problemData?.question || problemData?.problem_latex;
  const answerText = problemData?.answer || problemData?.correct_answer;
  const stepsList = problemData?.steps || problemData?.explanation || [];
  const imageUrl =
    problemData?.image || problemData?.image_url || problemData?.image_base64;
  const choices = problemData?.choices || [];

  return (
    <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto font-body">
      <button
        onClick={() => navigate("/user/videos")}
        className="mb-6 text-[#0047a5] font-bold flex items-center gap-1 hover:underline"
      >
        <MoveLeft size={20} /> 돌아가기
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <section className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-lg border border-gray-800">
            <VideoPlayer
              videoUrl={videoInfo.video_url || videoInfo.videoUrls?.[0]}
              title={videoInfo.title}
            />
          </section>

          <VideoInfo
            title={isVision ? "🚀 AI Company 비전" : videoInfo.title}
            subject={videoInfo.subject}
            description={videoInfo.description}
          />

          {!isVision && (
            <section className="scroll-mt-24">
              <div className="flex border-b border-gray-200 mt-8 mb-2">
                <button
                  className={`flex-1 py-4 text-center font-bold text-lg transition-colors ${activeTab === "quiz" ? "border-b-4 border-[#0047a5] text-[#0047a5]" : "text-gray-400 hover:text-gray-600"}`}
                  onClick={() => setActiveTab("quiz")}
                >
                  실전 퀴즈
                </button>

                {/* 🌟 위젯 탭이 드디어 등장합니다! */}
                {WidgetComponent && (
                  <button
                    className={`flex-1 py-4 text-center font-bold text-lg transition-colors flex items-center justify-center gap-2 ${activeTab === "widget" ? "border-b-4 border-yellow-500 text-yellow-600" : "text-gray-400 hover:text-gray-600"}`}
                    onClick={() => setActiveTab("widget")}
                  >
                    <Sparkles
                      size={20}
                      className={
                        activeTab === "widget" ? "fill-yellow-500" : ""
                      }
                    />
                    인터랙티브 실습
                  </button>
                )}

                <button
                  className={`flex-1 py-4 text-center font-bold text-lg transition-colors ${activeTab === "qna" ? "border-b-4 border-[#0047a5] text-[#0047a5]" : "text-gray-400 hover:text-gray-600"}`}
                  onClick={() => setActiveTab("qna")}
                >
                  질문 및 A/S
                </button>
              </div>

              {activeTab === "quiz" && (
                <div className="mt-8 text-center">
                  <div className="mb-8">
                    <button
                      onClick={handleFetchProblem}
                      disabled={isFetchingProblem}
                      className={`font-bold text-lg py-4 px-10 rounded-xl shadow-md transition-all active:scale-[0.98] ${isFetchingProblem ? "bg-gray-400 text-white cursor-not-allowed animate-pulse" : "bg-[#0047a5] text-white hover:bg-blue-800"}`}
                    >
                      {isFetchingProblem
                        ? "⏳ 문제를 만드는 중..."
                        : "🎯 랜덤 문제 가져오기"}
                    </button>
                  </div>

                  {problemData && (
                    <div className="mt-8 p-8 bg-white border border-gray-100 rounded-3xl shadow-xl animate-fade-in text-left">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                          📝 실전 테스트
                        </h3>
                        {showSolution && (
                          <div
                            className={`flex items-center gap-2 font-black text-xl ${isCorrect ? "text-green-600" : "text-red-600"}`}
                          >
                            {isCorrect ? (
                              <>
                                <CheckCircle2 size={28} /> 정답입니다!
                              </>
                            ) : (
                              <>
                                <XCircle size={28} /> 아쉬워요!
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {imageUrl && (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6 flex justify-center">
                          <img
                            src={
                              String(imageUrl).startsWith("http") ||
                              String(imageUrl).startsWith("data:")
                                ? imageUrl
                                : `data:image/png;base64,${imageUrl}`
                            }
                            alt="그래프"
                            className="max-w-full h-auto rounded-lg shadow-sm"
                          />
                        </div>
                      )}

                      {problemText && (
                        <div className="mb-10 text-xl text-gray-800 font-bold leading-relaxed px-2 flex justify-center overflow-x-auto">
                          <KatexBlock math={problemText} />
                        </div>
                      )}

                      {choices.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                          {choices.map((choice, index) => (
                            <button
                              key={index}
                              onClick={() => handleChoiceClick(index)}
                              disabled={showSolution}
                              className={`p-6 text-left rounded-2xl border-2 transition-all flex items-center gap-4 group ${
                                selectedIndex === index
                                  ? isCorrect
                                    ? "border-green-500 bg-green-50"
                                    : "border-red-500 bg-red-50"
                                  : showSolution &&
                                      index === problemData.correct_index
                                    ? "border-green-500 bg-green-50"
                                    : "border-gray-200 hover:border-[#0047a5] hover:shadow-md"
                              }`}
                            >
                              <span
                                className={`w-10 h-10 flex items-center justify-center rounded-full font-black shrink-0 ${
                                  selectedIndex === index
                                    ? "bg-white text-gray-900"
                                    : "bg-gray-100 text-gray-500 group-hover:bg-[#0047a5] group-hover:text-white"
                                }`}
                              >
                                {index + 1}
                              </span>
                              <span className="text-lg font-bold">
                                <MixedText text={choice} />
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {showSolution && stepsList.length > 0 && (
                        <div className="mt-12 pt-10 border-t-2 border-dashed border-gray-200 animate-slide-up">
                          <h4 className="text-xl font-black text-[#0047a5] mb-6 flex items-center gap-2">
                            💡 전문가의 상세 풀이
                          </h4>
                          <div className="space-y-4">
                            {stepsList.map((step, idx) => (
                              <div
                                key={idx}
                                className="flex gap-4 items-start bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50"
                              >
                                <span className="bg-[#0047a5] text-white font-black w-8 h-8 flex items-center justify-center rounded-lg shrink-0 mt-1">
                                  {idx + 1}
                                </span>
                                <div className="mt-1 w-full overflow-hidden">
                                  <p className="text-gray-700 font-bold mb-3 leading-relaxed">
                                    <MixedText
                                      text={
                                        typeof step === "string"
                                          ? step
                                          : step.text || step.description
                                      }
                                    />
                                  </p>
                                  {(step.math || step.formula) && (
                                    <div className="bg-white p-4 rounded-xl shadow-sm overflow-x-auto">
                                      <KatexBlock
                                        math={step.math || step.formula}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {answerText && (
                            <div className="mt-10 p-8 bg-[#0047a5] text-white rounded-3xl text-center shadow-lg">
                              <p className="text-blue-200 text-sm font-black mb-2 uppercase tracking-widest">
                                Final Answer
                              </p>
                              <div className="text-4xl font-black overflow-x-auto">
                                <KatexBlock math={answerText} />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 🌟 실습 위젯 렌더링 영역 */}
              {activeTab === "widget" && WidgetComponent && (
                <div className="mt-8 p-6 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 min-h-[500px]">
                  <Suspense
                    fallback={
                      <div className="flex h-64 items-center justify-center">
                        <Loader2
                          className="animate-spin text-[#0047a5]"
                          size={32}
                        />
                      </div>
                    }
                  >
                    <WidgetComponent />
                  </Suspense>
                </div>
              )}

              {activeTab === "qna" && <QnaCard />}
            </section>
          )}
        </div>

        <aside className="lg:col-span-4 space-y-8">
          <VideoPlayerList />
          <RecommendedVideo count={4} />
        </aside>
      </div>
    </main>
  );
}
