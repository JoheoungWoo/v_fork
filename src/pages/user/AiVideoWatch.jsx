import "katex/dist/katex.min.css";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "@/api/core/apiClient";
import RecommendedVideo from "@/components/video/RecommendedVideo";

import VideoPlayer from "@/components/video/VideoPlayer";
import VideoInfo from "@/components/video/VideoInfo";
import LocalQuizCard from "@/components/quiz/LocalQuizCard";
import ApiQuizCard from "@/components/quiz/ApiQuizCard";
import QnaCard from "@/components/quiz/QnaCard";

import {
  mathLectures,
  circuitLectures,
  emLectures,
  visionLectures,
} from "@/constants/videoData";
import {
  generateBasicFunctionQuiz,
  generateCompositeFunctionQuiz,
  generateExponentQuiz,
  generateFactorizationQuiz,
  generateFractionQuiz,
  generateLogarithmQuiz,
} from "@/utils/quizUtils";
import { MoveLeft } from "lucide-react";
import VideoPlayerList from "@/components/video/VideoPlayList";

const ALL_LECTURES = [
  ...mathLectures,
  ...circuitLectures,
  ...emLectures,
  ...visionLectures,
];

export default function AiVideoWatch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.login?.user) || { id: "guest_123" };

  const [quizData, setQuizData] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("quiz"); // 🌟 탭 상태 추가 ("quiz" | "qna")

  const videoData = ALL_LECTURES.find((l) => l.id === id);
  const isVision = id.startsWith("vision_");

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/api/video/url/${id}`);
        setVideoUrl(res.data.video_url);
      } catch (error) {
        setVideoUrl(videoData?.videoUrls?.[0] || "");
      } finally {
        setLoading(false);
      }
    };
    if (videoData) fetchVideoData();
    else setLoading(false);
  }, [id, videoData]);

  const fetchRandomProblem = async () => {
    try {
      setSelectedIndex(null);
      setIsCorrect(null);
      setShowSolution(false);
      const endpoint = id.startsWith("circuit_")
        ? "/api/circuit/random"
        : id.startsWith("em_")
          ? "/api/em/random"
          : "/api/math/random";
      const res = await apiClient.get(`${endpoint}?type=${id}`);
      setQuizData(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuizSelect = async (index) => {
    const correct = index === quizData.correct_index;
    setSelectedIndex(index);
    setIsCorrect(correct);
    setShowSolution(true);
    const endpoint = id.startsWith("circuit_")
      ? "/api/circuit/record"
      : id.startsWith("em_")
        ? "/api/em/record"
        : "/api/math/record";
    try {
      await apiClient.post(endpoint, {
        user_id: user.id,
        concept_name: id,
        is_correct: correct,
        chosen_answer: quizData.choices[index],
        problem_latex: quizData.problem_latex,
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (loading)
    return (
      <div className="pt-32 text-center font-body text-xl font-bold">
        로딩 중...
      </div>
    );
  if (!videoData)
    return (
      <div className="pt-32 text-center font-body text-xl font-bold">
        영상을 찾을 수 없습니다.
      </div>
    );

  return (
    <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto font-body">
      <button
        onClick={() => navigate("/user/videos")}
        className="mb-6 text-[#0047a5] font-bold flex items-center gap-1"
      >
        <MoveLeft />
        돌아가기
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <section className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-lg border border-gray-800 flex items-center justify-center">
            <VideoPlayer videoUrl={videoUrl} title={videoData.title} />
          </section>

          <VideoInfo
            title={isVision ? "🚀 AI Company 비전" : videoData.title}
            subject={videoData.subject}
            description={videoData.description}
          />

          {!isVision && (
            <section className="scroll-mt-24">
              {/* 🌟 탭 버튼 UI 추가 */}
              <div className="flex border-b border-gray-200 mt-8 mb-2">
                <button
                  className={`flex-1 py-4 px-6 text-center font-bold text-lg transition-colors ${
                    activeTab === "quiz"
                      ? "border-b-4 border-[#0047a5] text-[#0047a5]"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  onClick={() => setActiveTab("quiz")}
                >
                  실전 퀴즈
                </button>
                <button
                  className={`flex-1 py-4 px-6 text-center font-bold text-lg transition-colors ${
                    activeTab === "qna"
                      ? "border-b-4 border-[#0047a5] text-[#0047a5]"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  onClick={() => setActiveTab("qna")}
                >
                  질문 및 A/S
                </button>
              </div>

              {/* 🌟 탭 상태에 따른 렌더링 분기 */}
              {activeTab === "quiz" ? (
                <>
                  {id === "math_fraction" ? (
                    <LocalQuizCard
                      title="분수와 비례식"
                      generateFunc={generateFractionQuiz}
                    />
                  ) : id === "math_exponent" ? (
                    <LocalQuizCard
                      title="지수법칙"
                      generateFunc={generateExponentQuiz}
                    />
                  ) : id === "math_logarithm" ? (
                    <LocalQuizCard
                      title="로그의 이해"
                      generateFunc={generateLogarithmQuiz}
                    />
                  ) : id === "math_factorization" ? (
                    <LocalQuizCard
                      title="인수분해"
                      generateFunc={generateFactorizationQuiz}
                    />
                  ) : id === "math_function" ? (
                    <LocalQuizCard
                      title="함수의 이해"
                      generateFunc={generateBasicFunctionQuiz}
                    />
                  ) : id === "math_composite_function" ? (
                    <LocalQuizCard
                      title="합성함수 연산"
                      generateFunc={generateCompositeFunctionQuiz}
                    />
                  ) : (
                    <ApiQuizCard
                      quizData={quizData}
                      selectedIndex={selectedIndex}
                      isCorrect={isCorrect}
                      showSolution={showSolution}
                      onSelect={handleQuizSelect}
                      onFetch={fetchRandomProblem}
                    />
                  )}
                </>
              ) : (
                <QnaCard />
              )}
            </section>
          )}
        </div>

        <aside className="lg:col-span-4 space-y-8">
          <VideoPlayerList />
          <div>
            <h2 className="text-xl font-bold mb-6 text-gray-900">추천 강의</h2>
            <RecommendedVideo count={4} />
          </div>
        </aside>
      </div>
    </main>
  );
}
