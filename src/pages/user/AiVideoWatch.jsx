import apiClient from "@/api/core/apiClient";
import "katex/dist/katex.min.css";
import { Loader2, MoveLeft, Sparkles } from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// 🚀 리팩토링된 LocalQuizCard 임포트
import LocalQuizCard from "@/components/quiz/LocalQuizCard";
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
  controlLectures,
} from "@/constants/videoData";
import WIDGET_MAP from "@/utils/widgetData";

const ALL_LECTURES = [
  ...mathLectures,
  ...circuitLectures,
  ...emLectures,
  ...visionLectures,
  ...controlLectures,
];

export default function AiVideoWatch() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [videoInfo, setVideoInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("quiz");

  const localVideoData = ALL_LECTURES.find((l) => l.id === id);
  const isVision = id.startsWith("vision_");

  // 영상 데이터 페칭
  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/api/video/url/${id}`);
        const backendData = res.data || {};
        const safeData = {};

        // 안전한 데이터만 추출
        Object.keys(backendData).forEach((key) => {
          if (
            backendData[key] &&
            backendData[key] !== "null" &&
            !String(backendData[key]).includes("찾을 수 없")
          ) {
            safeData[key] = backendData[key];
          }
        });

        // 로컬 데이터 위에 백엔드 데이터 덮어쓰기
        setVideoInfo({ ...localVideoData, ...safeData });
      } catch (error) {
        // 에러 시 로컬 데이터만 사용
        setVideoInfo(localVideoData);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchVideoData();
  }, [id, localVideoData]);

  // 인터랙티브 위젯 컴포넌트 memoization
  const WidgetComponent = useMemo(() => {
    console.log(videoInfo);
    const type = videoInfo?.widget_type || videoInfo?.widgetType;
    if (!type) return null;
    return WIDGET_MAP[type] || null;
  }, [videoInfo]);

  // 로딩 화면
  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-[#0047a5]" size={48} />
      </div>
    );

  // 데이터 없음 화면
  if (!videoInfo)
    return (
      <div className="pt-32 text-center text-xl font-bold">
        영상을 찾을 수 없습니다.
      </div>
    );

  return (
    <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto font-body">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => navigate("/user/videos")}
        className="mb-6 text-[#0047a5] font-bold flex items-center gap-1 hover:underline active:scale-95 transition-all"
      >
        <MoveLeft size={20} /> 돌아가기
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 메인 영상 및 탭 영역 */}
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

          {/* 비전 영상이 아닐 때만 퀴즈/위젯/Q&A 탭 표시 */}
          {!isVision && (
            <section className="scroll-mt-24">
              {/* 탭 헤더 */}
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

              {/* 탭 내용 */}
              {activeTab === "quiz" && (
                // 💡 리팩토링된 LocalQuizCard 사용. 오직 동적 id만 넘겨 백엔드 API 호출 유도
                <LocalQuizCard id={id} />
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

        {/* 사이드바 영역 */}
        <aside className="lg:col-span-4 space-y-8">
          <VideoPlayList />
          <RecommendedVideo count={4} />
        </aside>
      </div>
    </main>
  );
}
