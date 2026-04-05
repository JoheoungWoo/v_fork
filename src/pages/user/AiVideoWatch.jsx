import apiClient from "@/api/core/apiClient";
import katex from "katex";
import "katex/dist/katex.min.css";
import {
  CheckCircle2,
  Eye,
  Loader2,
  MoveLeft,
  Sparkles,
  XCircle,
} from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import QnaCard from "@/components/quiz/QnaCard";
import RecommendedVideo from "@/components/video/RecommendedVideo";
import VideoInfo from "@/components/video/VideoInfo";
import VideoPlayer from "@/components/video/VideoPlayer";
import VideoPlayList from "@/components/video/VideoPlayList";

import {
  circuitLectures,
  emLectures,
  mathLectures,
  visionLectures,
} from "@/constants/videoData";

// ==========================================
// 💡 1. WIDGET_MAP (내장형)
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
// 💡 2. 대표님 커스텀 Katex 컴포넌트
// ==========================================
const InlineMath = ({ math }) => {
  if (!math) return null;
  const cleanMath = String(math).replace(/\\\\/g, "\\");
  const html = katex.renderToString(cleanMath, {
    throwOnError: false,
    displayMode: false,
  });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const BlockMath = ({ math }) => {
  if (!math) return null;
  const cleanMath = String(math).replace(/\\\\/g, "\\");
  const html = katex.renderToString(cleanMath, {
    throwOnError: false,
    displayMode: true,
  });
  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      className="overflow-x-auto flex justify-center w-full"
    />
  );
};

// 💡 3. 파이썬 백엔드 맞춤형 지능형 수식 렌더러
const AutoMathRenderer = ({ text, isBlock = true }) => {
  if (!text) return null;
  const cleanText = String(text).replace(/\\\$/g, "$");

  const hasMathDelimiters = /\$\$|\\\[|\\\(|\$/.test(cleanText);

  if (!hasMathDelimiters) {
    return isBlock ? (
      <BlockMath math={cleanText} />
    ) : (
      <InlineMath math={cleanText} />
    );
  }

  const regex =
    /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[\s\S]*?\$|\\\([\s\S]*?\\\))/g;
  const parts = cleanText.split(regex);

  return (
    <span className="whitespace-pre-wrap leading-relaxed">
      {parts.map((part, i) => {
        if (!part) return null;
        if (part.startsWith("$$") && part.endsWith("$$"))
          return <BlockMath key={i} math={part.slice(2, -2)} />;
        if (part.startsWith("\\[") && part.endsWith("\\]"))
          return <BlockMath key={i} math={part.slice(2, -2)} />;
        if (part.startsWith("\\(") && part.endsWith("\\)"))
          return <InlineMath key={i} math={part.slice(2, -2)} />;
        if (part.startsWith("$") && part.endsWith("$"))
          return <InlineMath key={i} math={part.slice(1, -1)} />;
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

  // AiVideoWatch.jsx 내부의 useEffect 교체
  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/api/video/url/${id}`);

        // 💡 [핵심 수정] 백엔드에서 null이나 에러가 왔을 때 로컬 데이터를 파괴하지 않도록 방어!
        const backendData = res.data || {};
        const safeData = {};

        Object.keys(backendData).forEach((key) => {
          // 값이 존재하고, "null"이 아니며, "찾을 수 없" 같은 에러 메시지가 아닐 때만 챙깁니다.
          if (
            backendData[key] &&
            backendData[key] !== "null" &&
            !String(backendData[key]).includes("찾을 수 없")
          ) {
            safeData[key] = backendData[key];
          }
        });

        // 안전하게 걸러낸 데이터만 로컬 데이터 위에 덮어씌웁니다.
        setVideoInfo({ ...localVideoData, ...safeData });
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
      alert("백엔드 서버에서 문제를 가져오는데 실패했습니다.");
    } finally {
      setIsFetchingProblem(false);
    }
  };

  const handleChoiceClick = (index) => {
    if (showSolution) return;
    const correct =
      index === (problemData.correct_index ?? problemData.answer_index);
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

  // 💡 파이썬 백엔드 맞춤 데이터 추출
  const problemText =
    problemData?.problem_latex ||
    problemData?.problem ||
    problemData?.question ||
    "";
  const choices = problemData?.choices || problemData?.options || [];
  const stepsList = problemData?.steps || problemData?.explanation || [];
  const answerText =
    problemData?.answer ||
    problemData?.correct_answer ||
    problemData?.answer_latex ||
    "";

  // 🚀 [핵심 수정] 이미지 종류별 철저한 분리 🚀
  // 1. 문제를 푸는 데 필수적인 그림 (회로도, 기본 제공 도형 등)
  const questionImage =
    problemData?.circuit_image ||
    problemData?.image ||
    problemData?.image_base64;

  // 2. 정답 해설용 그림 (수학 그래프, 포물선 교점 시각화 등)
  const solutionImage =
    problemData?.graph_image ||
    problemData?.solution_image ||
    problemData?.explanation_image ||
    problemData?.answer_image;

  // 💡 SVG / PNG 자동 판별 렌더러
  const renderImage = (imgSrc, altText) => {
    if (!imgSrc) return null;
    const src = String(imgSrc).trim();
    if (src === "null" || src === "None" || src.length < 20) return null;

    let finalSrc = src;
    if (!src.startsWith("http") && !src.startsWith("data:")) {
      if (src.startsWith("PHN2") || src.startsWith("PD94")) {
        finalSrc = `data:image/svg+xml;base64,${src}`;
      } else {
        finalSrc = `data:image/png;base64,${src}`;
      }
    }

    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-8 flex justify-center">
        <img
          src={finalSrc}
          alt={altText}
          className="max-w-full h-auto rounded object-contain max-h-[400px]"
        />
      </div>
    );
  };

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
                    <div className="mt-8 p-8 bg-blue-50/30 border border-gray-100 rounded-3xl shadow-xl text-left">
                      <div className="flex items-center justify-between mb-8 border-b pb-4">
                        <h3 className="text-2xl font-black text-[#0047a5] flex items-center gap-2">
                          📝 실전 테스트
                        </h3>
                        {showSolution && choices.length > 0 && (
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

                      {/* 🚀 회로도 같은 필수 이미지만 처음에 보여줍니다! */}
                      {renderImage(questionImage, "문제 이미지")}

                      {/* 문제 지문 렌더링 */}
                      {problemText && (
                        <div className="mb-10 text-xl text-gray-900 font-bold px-4 py-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                          <AutoMathRenderer text={problemText} />
                        </div>
                      )}

                      {/* 4지 선다 버튼 영역 */}
                      {choices.length > 0 ? (
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
                                      index ===
                                        (problemData.correct_index ??
                                          problemData.answer_index)
                                    ? "border-green-500 bg-green-50"
                                    : "border-gray-200 bg-white hover:border-[#0047a5] hover:shadow-md"
                              }`}
                            >
                              <span
                                className={`w-10 h-10 flex items-center justify-center rounded-full font-black shrink-0 transition-colors ${
                                  selectedIndex === index
                                    ? "bg-white text-gray-900"
                                    : "bg-gray-100 text-gray-500 group-hover:bg-[#0047a5] group-hover:text-white"
                                }`}
                              >
                                {index + 1}
                              </span>
                              <span className="text-lg font-bold text-gray-800">
                                <AutoMathRenderer
                                  text={choice}
                                  isBlock={false}
                                />
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        !showSolution && (
                          <div className="text-center mb-10">
                            <button
                              onClick={() => setShowSolution(true)}
                              className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-green-700 shadow-md transition-all flex items-center justify-center gap-2 mx-auto"
                            >
                              <Eye size={20} /> 정답 및 해설 바로보기
                            </button>
                          </div>
                        )
                      )}

                      {/* 💡 단계별 해설 영역 */}
                      {showSolution && (
                        <div className="mt-12 pt-10 border-t-2 border-dashed border-gray-300 animate-slide-up">
                          <h4 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                            💡 전문가의 상세 풀이
                          </h4>

                          {/* 🚀 스포일러 방지: 수학 그래프/교점 이미지는 정답을 확인한 후에만 나타납니다! */}
                          {renderImage(solutionImage, "해설 시각화")}

                          {stepsList.length > 0 && (
                            <div className="space-y-4">
                              {stepsList.map((step, idx) => {
                                const stepText =
                                  step.description || step.text || "";
                                const stepMath =
                                  step.latex || step.math || step.formula || "";

                                return (
                                  <div
                                    key={idx}
                                    className="flex gap-5 items-start bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"
                                  >
                                    <span className="bg-[#e5edff] text-[#0047a5] font-black w-10 h-10 flex items-center justify-center rounded-xl shrink-0 mt-1">
                                      {idx + 1}
                                    </span>
                                    <div className="mt-1 w-full overflow-hidden">
                                      {stepText && (
                                        <p className="text-gray-700 font-bold mb-4 text-lg leading-relaxed">
                                          <AutoMathRenderer text={stepText} />
                                        </p>
                                      )}
                                      {stepMath && (
                                        <div className="bg-gray-50 py-4 px-6 rounded-xl border border-gray-100 overflow-x-auto">
                                          <BlockMath math={stepMath} />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* 최종 정답 출력 */}
                          {answerText && (
                            <div className="mt-12 p-10 bg-gradient-to-r from-[#0047a5] to-blue-700 text-white rounded-3xl text-center shadow-2xl">
                              <p className="text-blue-200 text-sm font-black mb-3 uppercase tracking-widest opacity-90">
                                최종 정답
                              </p>
                              <div className="text-4xl font-black overflow-x-auto drop-shadow-md">
                                <AutoMathRenderer text={answerText} />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "widget" && WidgetComponent && (
                <div className="mt-8 p-6 bg-white rounded-3xl border border-gray-200 shadow-inner min-h-[600px] flex flex-col">
                  <Suspense
                    fallback={
                      <div className="flex flex-1 items-center justify-center">
                        <Loader2
                          className="animate-spin text-[#0047a5]"
                          size={48}
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
          <VideoPlayList />
          <RecommendedVideo count={4} />
        </aside>
      </div>
    </main>
  );
}
