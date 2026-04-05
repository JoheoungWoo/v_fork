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
import { Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import QnaCard from "@/components/quiz/QnaCard";
import RecommendedVideo from "@/components/video/RecommendedVideo";
import VideoInfo from "@/components/video/VideoInfo";
import VideoPlayer from "@/components/video/VideoPlayer";
import VideoPlayerList from "@/components/video/VideoPlayList";
import WIDGET_MAP from "@/utils/widgetData";

import {
  circuitLectures,
  emLectures,
  mathLectures,
  visionLectures,
} from "@/constants/videoData";

// ==========================================
// 💡 1. 만능 수식 렌더러 (어떤 형태의 백엔드 수식도 다 잡아냅니다)
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
  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      className="overflow-x-auto my-4"
    />
  );
};

// 💡 텍스트와 수식($ $, \( \), \[ \])이 섞인 문장을 완벽히 분리해서 그려주는 컴포넌트
const MixedText = ({ text }) => {
  if (!text) return null;
  // 정규식: $$, \[, \], $, \(, \) 패턴을 모두 잡아냅니다.
  const regex =
    /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[\s\S]*?\$|\\\([\s\S]*?\\\))/g;
  const parts = String(text).split(regex);

  return (
    <span className="whitespace-pre-wrap leading-relaxed">
      {parts.map((part, i) => {
        if (!part) return null;
        if (part.startsWith("$$") && part.endsWith("$$")) {
          return <KatexBlock key={i} math={part.slice(2, -2)} />;
        } else if (part.startsWith("\\[") && part.endsWith("\\]")) {
          return <KatexBlock key={i} math={part.slice(2, -2)} />;
        } else if (part.startsWith("$") && part.endsWith("$")) {
          return <KatexInline key={i} math={part.slice(1, -1)} />;
        } else if (part.startsWith("\\(") && part.endsWith("\\)")) {
          return <KatexInline key={i} math={part.slice(2, -2)} />;
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
        setVideoInfo({ ...localVideoData, ...res.data });
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
        const localData = videoInfo.generator();
        // 로컬 데이터를 MixedText 포맷에 맞게 강제 변환
        newData = {
          ...localData,
          problem: `$$${localData.problem}$$`,
          answer: `$$${localData.answer}$$`,
          steps: localData.steps.map((s) => ({
            text: `${s.text}${s.math ? `\n$$${s.math}$$` : ""}`,
          })),
        };
      } else {
        const endpoint = id.includes("circuit")
          ? "/api/circuit/random"
          : "/api/math/random";
        const res = await apiClient.get(`${endpoint}?type=${id}`);
        newData = res.data;
      }
      setProblemData(newData);
    } catch (e) {
      console.error(e);
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

  // 💡 2. 데이터 추출 로직 대폭 강화 (백엔드 변수명 파편화 완벽 방어)
  const problemText =
    problemData?.problem ||
    problemData?.question ||
    problemData?.problem_latex ||
    "";
  const answerText =
    problemData?.answer ||
    problemData?.correct_answer ||
    problemData?.answer_latex ||
    "";
  const stepsList = problemData?.steps || problemData?.explanation || [];
  const choices = problemData?.choices || problemData?.options || [];

  // 문제용 그림 (회로도, 기본 그래프)
  const problemImage =
    problemData?.image ||
    problemData?.image_url ||
    problemData?.image_base64 ||
    problemData?.circuit_image ||
    problemData?.plot;
  // 해설용 그림 (Matplotlib 답안)
  const solutionImage =
    problemData?.solution_image ||
    problemData?.explanation_image ||
    problemData?.answer_image;

  // 이미지 렌더링 헬퍼 함수
  const renderImage = (imgSrc, altText) => {
    if (!imgSrc) return null;
    const src =
      String(imgSrc).startsWith("http") || String(imgSrc).startsWith("data:")
        ? imgSrc
        : `data:image/png;base64,${imgSrc}`;
    return (
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex justify-center">
        <img
          src={src}
          alt={altText}
          className="max-w-full h-auto rounded object-contain"
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
                  className={`flex-1 py-4 text-center font-bold text-lg transition-colors ${activeTab === "quiz" ? "border-b-4 border-[#0047a5] text-[#0047a5]" : "text-gray-400"}`}
                  onClick={() => setActiveTab("quiz")}
                >
                  실전 퀴즈
                </button>

                {WidgetComponent && (
                  <button
                    className={`flex-1 py-4 text-center font-bold text-lg transition-colors flex items-center justify-center gap-2 ${activeTab === "widget" ? "border-b-4 border-yellow-500 text-yellow-600" : "text-gray-400"}`}
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
                  className={`flex-1 py-4 text-center font-bold text-lg transition-colors ${activeTab === "qna" ? "border-b-4 border-[#0047a5] text-[#0047a5]" : "text-gray-400"}`}
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
                    <div className="mt-8 p-8 bg-white border border-gray-100 rounded-3xl shadow-xl text-left">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
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

                      {/* 💡 문제 회로도/그래프 출력 */}
                      {renderImage(problemImage, "문제 이미지")}

                      {/* 💡 문제 지문 (MixedText로 텍스트와 수식 완벽 혼합 렌더링) */}
                      {problemText && (
                        <div className="mb-10 text-xl text-gray-800 font-bold px-2">
                          <MixedText text={problemText} />
                        </div>
                      )}

                      {/* 💡 4지 선다 버튼 영역 (주관식 방어 로직 추가) */}
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
                      ) : (
                        // 백엔드에서 4지선다를 안 보냈을 경우 주관식 모드로 변경
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
                        <div className="mt-12 pt-10 border-t-2 border-dashed border-gray-200 animate-slide-up">
                          <h4 className="text-xl font-black text-[#0047a5] mb-6 flex items-center gap-2">
                            💡 전문가의 상세 풀이
                          </h4>

                          {/* 해설용 그래프/그림 (Matplotlib) */}
                          {renderImage(solutionImage, "해설 이미지")}

                          {stepsList.length > 0 && (
                            <div className="space-y-4">
                              {stepsList.map((step, idx) => {
                                const stepText =
                                  typeof step === "string"
                                    ? step
                                    : step.text || step.description;
                                const stepMath = step.math || step.formula;
                                return (
                                  <div
                                    key={idx}
                                    className="flex gap-4 items-start bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50"
                                  >
                                    <span className="bg-[#0047a5] text-white font-black w-8 h-8 flex items-center justify-center rounded-lg shrink-0 mt-1">
                                      {idx + 1}
                                    </span>
                                    <div className="mt-1 w-full overflow-hidden">
                                      {stepText && (
                                        <p className="text-gray-700 font-bold mb-3">
                                          <MixedText text={stepText} />
                                        </p>
                                      )}
                                      {stepMath && (
                                        <div className="bg-white p-4 rounded-xl shadow-sm overflow-x-auto">
                                          <KatexBlock math={stepMath} />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {answerText && (
                            <div className="mt-10 p-8 bg-[#0047a5] text-white rounded-3xl text-center shadow-lg">
                              <p className="text-blue-200 text-sm font-black mb-2 uppercase tracking-widest">
                                Final Answer
                              </p>
                              <div className="text-4xl font-black overflow-x-auto">
                                <MixedText text={answerText} />
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
