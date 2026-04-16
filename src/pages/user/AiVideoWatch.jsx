import apiClient from "@/api/core/apiClient";
import "katex/dist/katex.min.css";
import { Loader2, MoveLeft, Sparkles } from "lucide-react";
// 🌟 startTransition 추가
import { startTransition, Suspense, useEffect, useMemo, useState } from "react";
// 🌟 useSearchParams 추가
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import LocalQuizCard from "@/components/quiz/LocalQuizCard";
import QnaCard from "@/components/quiz/QnaCard";
import RecommendedVideo from "@/components/video/RecommendedVideo";
import VideoInfo from "@/components/video/VideoInfo";
import VideoPlayer from "@/components/video/VideoPlayer";
import VideoPlayList from "@/components/video/VideoPlayList";

import WIDGET_MAP from "@/utils/widgetData";

export default function AiVideoWatch() {
  const { id } = useParams();
  const navigate = useNavigate();
  // 🌟 URL에서 탭 상태 가져오기
  const [searchParams, setSearchParams] = useSearchParams();

  const [videoInfo, setVideoInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🌟 URL의 ?tab= 값이 없으면 기본으로 "quiz"를 씁니다.
  const activeTab = searchParams.get("tab") || "quiz";

  const cleanId = useMemo(() => id, [id]);
  const isVision = cleanId.startsWith("vision_");

  useEffect(() => {
    const fetchVideoData = async () => {
      if (!cleanId) return;
      try {
        setLoading(true);
        const res = await apiClient.get(`/api/video/url/${cleanId}`);
        console.log("video fetch data:", res, res?.data);

        const { data } = res;
        const { data: data3 } = data;
        const backendData = data3;

        if (!backendData || backendData.lecture_id === undefined) {
          setVideoInfo(null);
        } else {
          setVideoInfo(backendData);
        }
      } catch (error) {
        console.error("❌ 데이터 페칭 실패:", error);
        setVideoInfo(null);
      } finally {
        setLoading(false);
      }
    };
    fetchVideoData();
  }, [cleanId]);

  // 🌟 [핵심 수정] DB의 widget_type 무시하고 오직 lecture_id로만 배열(Array) 형태로 매핑!
  const WidgetComponents = useMemo(() => {
    const targetId = videoInfo?.lecture_id;
    if (!targetId) return [];

    const widgets = WIDGET_MAP[targetId];
    if (!widgets) return [];

    // 배열이 아닐 경우(레거시 코드)를 대비해 무조건 배열 형태로 반환하도록 안전장치 추가
    return Array.isArray(widgets) ? widgets : [widgets];
  }, [videoInfo]);

  // 🌟 탭 변경 핸들러 (URL 업데이트 및 화면 깨짐 방지)
  const handleTabChange = (newTab) => {
    startTransition(() => {
      setSearchParams({ tab: newTab }, { replace: true });
    });
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-[#0047a5]" size={48} />
      </div>
    );

  if (!videoInfo)
    return (
      <div className="pt-32 text-center text-xl font-bold flex flex-col items-center gap-6">
        <p className="text-gray-500">영상을 찾을 수 없거나 준비 중입니다. 😢</p>
        <button
          onClick={() => navigate("/user/videos")}
          className="px-6 py-2 bg-[#0047a5] text-white rounded-full text-base font-medium hover:bg-blue-800 transition-colors"
        >
          강의 목록으로 돌아가기
        </button>
      </div>
    );

  return (
    <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto font-body">
      <button
        onClick={() => navigate("/user/videos")}
        className="mb-6 text-[#0047a5] font-bold flex items-center gap-1 hover:underline active:scale-95 transition-all"
      >
        <MoveLeft size={20} /> 돌아가기
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <section className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-lg border border-gray-800">
            <VideoPlayer
              videoUrl={videoInfo.video_url || videoInfo.video_urls?.[0]}
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
                  onClick={() => handleTabChange("quiz")}
                >
                  실전 퀴즈
                </button>

                {/* 🌟 배열에 위젯이 1개라도 있으면 탭을 표시하고, 2개 이상이면 개수도 표시해줍니다. */}
                {WidgetComponents.length > 0 && (
                  <button
                    className={`flex-1 py-4 text-center font-bold text-lg transition-colors flex items-center justify-center gap-2 ${activeTab === "widget" ? "border-b-4 border-yellow-500 text-yellow-600" : "text-gray-400 hover:text-gray-600"}`}
                    onClick={() => handleTabChange("widget")}
                  >
                    <Sparkles
                      size={20}
                      className={
                        activeTab === "widget" ? "fill-yellow-500" : ""
                      }
                    />
                    인터랙티브 실습{" "}
                    {WidgetComponents.length > 1 &&
                      `(${WidgetComponents.length})`}
                  </button>
                )}

                <button
                  className={`flex-1 py-4 text-center font-bold text-lg transition-colors ${activeTab === "qna" ? "border-b-4 border-[#0047a5] text-[#0047a5]" : "text-gray-400 hover:text-gray-600"}`}
                  onClick={() => handleTabChange("qna")}
                >
                  질문 및 A/S
                </button>
              </div>

              <div className="min-h-[400px]">
                {activeTab === "quiz" && (
                  <LocalQuizCard
                    id={videoInfo.lecture_id}
                    subject={videoInfo.subject} /* 🌟 요기를 추가! */
                    onWrongAnswer={() => {
                      if (WidgetComponents.length > 0) {
                        handleTabChange("widget");
                      }
                    }}
                  />
                )}

                {/* 🌟 다중 인터랙티브 위젯 렌더링 영역 */}
                {activeTab === "widget" && WidgetComponents.length > 0 && (
                  <div className="mt-8 flex flex-col gap-8">
                    {WidgetComponents.map((Widget, index) => (
                      <div
                        key={index}
                        className="p-6 bg-white rounded-3xl border border-gray-200 shadow-inner min-h-[600px] flex flex-col"
                      >
                        <Suspense
                          fallback={
                            <div className="flex flex-1 items-center justify-center h-full">
                              <Loader2
                                className="animate-spin text-[#0047a5]"
                                size={48}
                              />
                            </div>
                          }
                        >
                          <Widget />
                        </Suspense>
                      </div>
                    ))}
                  </div>
                )}

                {/* QnA */}
                {activeTab === "qna" && <QnaCard />}
              </div>
            </section>
          )}
        </div>

        <aside className="lg:col-span-4 space-y-8">
          <VideoPlayList currentLectureId={videoInfo.lecture_id} />
          <RecommendedVideo count={4} currentLectureId={videoInfo.lecture_id} />
        </aside>
      </div>
    </main>
  );
}
