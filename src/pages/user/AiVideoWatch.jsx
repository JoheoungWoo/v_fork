import apiClient from "@/api/core/apiClient";
import katex from "katex";
import "katex/dist/katex.min.css";
import { Loader2, MoveLeft, Sparkles } from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// 컴포넌트 Import
import QnaCard from "@/components/quiz/QnaCard";
import RecommendedVideo from "@/components/video/RecommendedVideo";
import VideoInfo from "@/components/video/VideoInfo";
import VideoPlayer from "@/components/video/VideoPlayer";
import VideoPlayerList from "@/components/video/VideoPlayList";

// 💡 위젯 데이터 맵 Import
import WIDGET_MAP from "@/utils/widgetData";

import {
  circuitLectures,
  emLectures,
  mathLectures,
  visionLectures,
} from "@/constants/videoData";

// ==========================================
// 💡 커스텀 Katex 컴포넌트
// ==========================================
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

  const [videoInfo, setVideoInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("quiz");
  const [problemData, setProblemData] = useState(null);
  const [isFetchingProblem, setIsFetchingProblem] = useState(false);

  const localVideoData = ALL_LECTURES.find((l) => l.id === id);
  const isVision = id.startsWith("vision_");

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/api/video/url/${id}`);

        // 💡 1. 백엔드 데이터와 로컬 데이터를 합칩니다.
        // 콘솔에 찍힌 'widget_type'을 우선적으로 챙깁니다.
        const merged = {
          ...localVideoData, // 기본 로컬 데이터
          ...res.data, // 백엔드 실시간 데이터 (widget_type 포함)
        };

        console.log("🚀 최종 병합된 데이터:", merged);
        setVideoInfo(merged);
      } catch (error) {
        console.warn("API 호출 실패, 로컬 데이터를 사용합니다.");
        setVideoInfo(localVideoData);
      } finally {
        setLoading(false);
      }
    };

    setProblemData(null);
    if (id) fetchVideoData();
  }, [id, localVideoData]);

  // 💡 2. 위젯 컴포넌트를 찾는 로직 (widget_type 필드 엄격 체크)
  const WidgetComponent = useMemo(() => {
    const type = videoInfo?.widget_type || videoInfo?.widgetType;
    if (!type) return null;
    return WIDGET_MAP[type] || null;
  }, [videoInfo]);

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

                {/* 💡 3. 위젯 탭 노출 조건 강화 */}
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
                  <button
                    onClick={handleFetchProblem}
                    disabled={isFetchingProblem}
                    className={`font-bold text-lg py-4 px-10 rounded-xl shadow-md ${isFetchingProblem ? "bg-gray-400" : "bg-[#0047a5] text-white"}`}
                  >
                    {isFetchingProblem
                      ? "⏳ 문제 생성 중..."
                      : "🎯 랜덤 문제 가져오기"}
                  </button>
                  {problemData && (
                    <div className="mt-8 p-8 bg-white border rounded-2xl shadow-sm text-left">
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
                    </div>
                  )}
                </div>
              )}

              {/* 💡 4. 실습 위젯 렌더링 영역 */}
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
