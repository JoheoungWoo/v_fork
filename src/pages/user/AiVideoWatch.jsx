import apiClient from "@/api/core/apiClient";
import katex from "katex";
import "katex/dist/katex.min.css";
import { Loader2, MoveLeft, Sparkles } from "lucide-react";
import { Suspense, useEffect, useState } from "react"; // Suspense 추가
import { useNavigate, useParams } from "react-router-dom";

// 컴포넌트 Import
import QnaCard from "@/components/quiz/QnaCard";
import RecommendedVideo from "@/components/video/RecommendedVideo";
import VideoInfo from "@/components/video/VideoInfo";
import VideoPlayer from "@/components/video/VideoPlayer";
import VideoPlayerList from "@/components/video/VideoPlayList";

// 💡 대표님께서 만드신 위젯 맵 Import (경로를 확인해 주세요!)
import WIDGET_MAP from "./WIDGET_MAP";

import {
  circuitLectures,
  emLectures,
  mathLectures,
  visionLectures,
} from "@/constants/videoData";

// ==========================================
// 💡 커스텀 Katex 컴포넌트
// ==========================================
const KatexInline = ({ math }) => {
  if (!math) return null;
  const html = katex.renderToString(String(math), { throwOnError: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const KatexBlock = ({ math }) => {
  if (!math) return null;
  const html = katex.renderToString(String(math), {
    throwOnError: false,
    displayMode: true,
  });
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

const ALL_LECTURES = [
  ...mathLectures,
  ...circuitLectures,
  ...emLectures,
  ...visionLectures,
];

export default function AiVideoWatch() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 🌟 상태 관리 강화
  const [videoInfo, setVideoInfo] = useState(null); // URL뿐만 아니라 전체 정보를 담습니다.
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("quiz"); // "quiz" | "widget" | "qna"

  const [problemData, setProblemData] = useState(null);
  const [isFetchingProblem, setIsFetchingProblem] = useState(false);

  // 로컬 상수에 데이터가 있는지 확인
  const localVideoData = ALL_LECTURES.find((l) => l.id === id);
  const isVision = id.startsWith("vision_");

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setLoading(true);
        // 💡 백엔드에서 영상의 전체 데이터(widget_type 포함)를 가져옵니다.
        const res = await apiClient.get(`/api/video/url/${id}`);
        setVideoInfo(res.data);
      } catch (error) {
        console.warn("API 호출 실패, 로컬 데이터를 사용합니다.");
        setVideoInfo(localVideoData);
      } finally {
        setLoading(false);
      }
    };

    setProblemData(null);
    if (id) fetchVideoData();
  }, [id]);

  // 💡 문제 생성 로직 (Matplotlib 이미지 및 LaTeX 대응)
  const handleFetchProblem = async () => {
    setIsFetchingProblem(true);
    try {
      const endpoint = id.includes("circuit")
        ? "/api/circuit/random"
        : "/api/math/random";
      const res = await apiClient.get(`${endpoint}?type=${id}`);
      setProblemData(res.data);
    } catch (e) {
      alert("문제를 가져오는데 실패했습니다.");
    } finally {
      setIsFetchingProblem(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#0047a5]" size={48} />
        <p className="text-gray-500 font-bold">강의를 준비하는 중입니다...</p>
      </div>
    );

  if (!videoInfo)
    return (
      <div className="pt-32 text-center text-xl font-bold">
        영상을 찾을 수 없습니다.
      </div>
    );

  // 🌟 위젯 컴포넌트 추출 (WIDGET_MAP 활용)
  const WidgetComponent = videoInfo.widget_type
    ? WIDGET_MAP[videoInfo.widget_type]
    : null;

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
          <section className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-lg border border-gray-800 flex items-center justify-center">
            <VideoPlayer
              videoUrl={videoInfo.video_url}
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
              {/* 🌟 탭 UI 개선 (실습 도구 추가) */}
              <div className="flex border-b border-gray-200 mt-8 mb-2 overflow-x-auto">
                <button
                  className={`flex-1 min-w-[100px] py-4 px-4 text-center font-bold text-lg transition-colors ${activeTab === "quiz" ? "border-b-4 border-[#0047a5] text-[#0047a5]" : "text-gray-400"}`}
                  onClick={() => setActiveTab("quiz")}
                >
                  실전 퀴즈
                </button>

                {/* 💡 위젯이 있는 경우에만 '실습 도구' 탭을 활성화합니다. */}
                {WidgetComponent && (
                  <button
                    className={`flex-1 min-w-[100px] py-4 px-4 text-center font-bold text-lg transition-colors flex items-center justify-center gap-2 ${activeTab === "widget" ? "border-b-4 border-yellow-500 text-yellow-600" : "text-gray-400"}`}
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
                  className={`flex-1 min-w-[100px] py-4 px-4 text-center font-bold text-lg transition-colors ${activeTab === "qna" ? "border-b-4 border-[#0047a5] text-[#0047a5]" : "text-gray-400"}`}
                  onClick={() => setActiveTab("qna")}
                >
                  질문 및 A/S
                </button>
              </div>

              {/* 🌟 탭별 렌더링 */}
              {activeTab === "quiz" && (
                <div className="mt-8">
                  <div className="w-full text-center mb-8">
                    <button
                      onClick={handleFetchProblem}
                      disabled={isFetchingProblem}
                      className={`font-bold text-lg py-4 px-10 rounded-xl shadow-md transition-all active:scale-[0.98] ${isFetchingProblem ? "bg-gray-400" : "bg-[#0047a5] text-white"}`}
                    >
                      {isFetchingProblem
                        ? "⏳ 문제 생성 중..."
                        : "🎯 랜덤 문제 가져오기"}
                    </button>
                  </div>

                  {problemData && (
                    <div className="mt-8 p-8 bg-white border border-gray-100 rounded-2xl shadow-sm animate-fade-in">
                      {/* Matplotlib 이미지 출력 */}
                      {(problemData.image || problemData.image_url) && (
                        <div className="mb-6 flex justify-center bg-gray-50 p-4 rounded-xl border">
                          <img
                            src={
                              problemData.image
                                ? `data:image/png;base64,${problemData.image}`
                                : problemData.image_url
                            }
                            alt="그래프"
                            className="max-w-full h-auto"
                          />
                        </div>
                      )}
                      <KatexBlock
                        math={problemData.problem || problemData.problem_latex}
                      />
                      {/* ... (해설 및 정답 생략, 기존과 동일) ... */}
                    </div>
                  )}
                </div>
              )}

              {/* 💡 🌟 실습 위젯 렌더링 영역 (WIDGET_MAP 활용) */}
              {activeTab === "widget" && WidgetComponent && (
                <div className="mt-8 p-6 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 min-h-[500px]">
                  <Suspense
                    fallback={
                      <div className="flex h-64 items-center justify-center">
                        <Loader2 className="animate-spin text-[#0047a5]" />
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
