import apiClient from "@/api/core/apiClient";
import "katex/dist/katex.min.css";
import { Loader2, MoveLeft, Sparkles } from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// ✅ 하위 컴포넌트 임포트
import LocalQuizCard from "@/components/quiz/LocalQuizCard";
import QnaCard from "@/components/quiz/QnaCard";
import RecommendedVideo from "@/components/video/RecommendedVideo";
import VideoInfo from "@/components/video/VideoInfo";
import VideoPlayer from "@/components/video/VideoPlayer";
import VideoPlayList from "@/components/video/VideoPlayList";

// ✅ 위젯 매핑 유틸리티
import WIDGET_MAP from "@/utils/widgetData";

// 🌟 [핵심 방어막] URL의 옛날 해시 ID를 직관적인 새 ID로 변환
const ID_MAPPING = {
  "0439b5168355bedd244f2c4cbd79c82f": "8_time_constant",
  "1234qwer": "21_control_test",
  "1da7f54684d76e361736580a26e6917c": "207_cho_hw_cheer",
  "201092af306ff8cb381808e4c3f45e0c": "13_vector_dot_product",
  "30d2bd6d1675fb17fe237d8c9d930413": "14_vector_cross_product",
  "5f16ede4e7730bdbf86da518cfd232e9": "25_circuit_test_video",
  "605e4d59a8fdcfe8f914734370c726f4": "18_angular_velocity",
  "61b1ec56bcd7e87535d18c40bb9afb21": "8_parabola_line_intersection",
  "62069c25429c16e898888d5611eb67b4": "7_line_intersection",
  "8fc05f0f6c31f19deeb976cb2b1562cf": "11_trig_function_2",
  a778e615bf667e6db830b498baa5ec66: "16_partial_derivative",
  acf4500a94d8492cde7139e71760ff71: "25_control_test_video",
  c3d27bab5e1cf6ae9f07f70ae08c1e26: "10_trig_function_1",
  c44dc0cd81fbb02320299a7bff062e4d: "15_derivative",
  e935dc2d2e592a79688c5f40da5fbe23: "9_perfect_square",
  circuit_ohm_law_equivalent: "6_ohms_law",
  circuit_power: "2_circuit_power",
  circuit_reactance_3d: "7_reactance_3d",
  circuit_resistance: "1_circuit_resistance",
  circuit_y_voltage: "4_circuit_y_voltage",
  circuit_ydelta: "3_circuit_ydelta",
  control_laplace_stability: "1_laplace_stability",
  em_ampere_law: "3_ampere_law",
  em_coulomb: "1_coulombs_law",
  lec_poten_3d: "2_equipotential_3d",
  math_exponent: "2_math_exponent",
  math_factorization: "4_math_factorization",
  math_fraction: "1_math_fraction",
  math_function: "5_math_function",
  math_integral_3d: "17_math_integral_3d",
  math_logarithm: "3_math_logarithm",
  math_polynomial: "6_math_polynomial",
  math_radian: "12_math_radian",
};

export default function AiVideoWatch() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [videoInfo, setVideoInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("quiz");

  // 🌟 URL에서 받은 id를 새 버전(cleanId)으로 정화
  const cleanId = useMemo(() => ID_MAPPING[id] || id, [id]);
  const isVision = cleanId.startsWith("vision_");

  // AiVideoWatch.jsx 내의 fetchVideoData 함수 부분 수정
  useEffect(() => {
    const fetchVideoData = async () => {
      if (!cleanId) return;
      try {
        setLoading(true);
        const res = await apiClient.get(`/api/video/url/${cleanId}`);
        console.log("res:", res);
        // 🌟 [보정] res.data.data 또는 res.data 둘 다 지원하도록 수정
        const backendData = res.data?.data || res.data;

        if (!backendData || backendData.id === undefined) {
          console.warn("⚠️ 강의 데이터를 찾지 못함:", cleanId);
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
  // 2. 인터랙티브 위젯 컴포넌트 매핑
  const WidgetComponent = useMemo(() => {
    if (!cleanId) return null;
    // DB의 widget_type이 우선, 없으면 cleanId로 매핑 시도
    const type = videoInfo?.widget_type || videoInfo?.widgetType || cleanId;
    return WIDGET_MAP[type] || null;
  }, [videoInfo, cleanId]);

  // 로딩 및 에러 처리 UI
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
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => navigate("/user/videos")}
        className="mb-6 text-[#0047a5] font-bold flex items-center gap-1 hover:underline active:scale-95 transition-all"
      >
        <MoveLeft size={20} /> 돌아가기
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 메인 콘텐츠 (좌측) */}
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

              {/* 탭 내용 분기 */}
              <div className="min-h-[400px]">
                {activeTab === "quiz" && <LocalQuizCard id={cleanId} />}

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
              </div>
            </section>
          )}
        </div>

        {/* 사이드바 (우측) */}
        <aside className="lg:col-span-4 space-y-8">
          <VideoPlayList />
          <RecommendedVideo count={4} />
        </aside>
      </div>
    </main>
  );
}
