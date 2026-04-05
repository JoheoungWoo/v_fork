import { useEffect, useRef, useState } from "react";
import { BlockMath, InlineMath } from "react-katex";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { submitAnswer } from "@/api/answerApi";
import { getQuestionById } from "@/api/questionApi";
import { aiChatGraph } from "@/api/aiApi";
import useCustomLogin from "@/hooks/useCustomLogin";
import apiClient from "@/api/core/apiClient"; // ✅ axios 대신 apiClient 임포트

export default function QuestionSolvePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);

  const { isLogin, token } = useCustomLogin();
  const mode = new URLSearchParams(location.search).get("mode");
  const idx = Number(new URLSearchParams(location.search).get("idx"));
  const wrongIds = location.state?.wrongIds || [];

  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [showSolution, setShowSolution] = useState(false);

  // ✅ 동영상 관련 상태
  const [showVideo, setShowVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  // ✅ AI 튜터 관련 상태
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const [loading, setLoading] = useState(true);

  // 문제 로딩
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const q = await getQuestionById(id);
        setQuestion(q);
        setAiQuestion(q.question || q.title || "");
      } catch (e) {
        console.error("문제 로딩 실패:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // 답안 제출
  const onSubmit = async () => {
    if (!selected || result || submitting) return;
    if (!isLogin || !token) {
      alert("로그인이 필요합니다.");
      navigate("/member/login");
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitAnswer(
        {
          question_id: id,
          selected_answer: Number(selected),
        },
        token,
      );
      setResult(res);
    } catch (e) {
      alert("로그인해주세요");
    } finally {
      setSubmitting(false);
    }
  };

  // 다음 오답 이동
  const goNextWrong = () => {
    if (idx + 1 >= wrongIds.length) {
      alert("오답 다시풀기 완료 🎉");
      navigate("/stats");
      return;
    }
    navigate(`/questions/${wrongIds[idx + 1]}?mode=retry&idx=${idx + 1}`, {
      state: { wrongIds },
    });
  };

  // 동영상 해설 보기 핸들러
  const handleShowVideo = async () => {
    if (showVideo) {
      setShowVideo(false);
      setVideoUrl(null);
      return;
    }

    setShowVideo(true);
    setIsVideoLoading(true);

    const searchConcept =
      question?.concept || question?.chapter || "전기자기학";

    try {
      // ✅ axios 대신 apiClient 사용, baseURL 자동 적용됨
      const res = await apiClient.get(`/api/video/play/by-concept`, {
        params: { concept: searchConcept },
      });
      setVideoUrl(res.data.video_url);
    } catch (err) {
      if (question?.video_url) {
        let finalUrl = question.video_url;
        if (finalUrl.includes("youtu.be/")) {
          finalUrl = finalUrl.replace("youtu.be/", "www.youtube.com/embed/");
        } else if (finalUrl.includes("youtube.com/watch?v=")) {
          finalUrl = finalUrl.replace("watch?v=", "embed/");
        }
        setVideoUrl(finalUrl);
      } else {
        alert("등록된 해설 영상이 없습니다. 😅");
        setShowVideo(false);
      }
    } finally {
      setIsVideoLoading(false);
    }
  };

  // AI 질문하기 핸들러
  const handleAiSearch = async (e) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    setAiLoading(true);
    setAiAnswer("");
    setAiError(null);

    try {
      const data = await aiChatGraph({ question: aiQuestion }, token);
      setAiAnswer(data.answer);
      if (data.remaining_count !== undefined) {
        console.log(`남은 횟수: ${data.remaining_count}`);
      }
    } catch (err) {
      console.error("AI Error:", err);
      // apiClient 인터셉터에서 넘겨준 customError의 status 활용 가능
      if (err.status === 429 || (err.response && err.response.status === 429)) {
        setAiError(
          err?.response?.data?.detail ||
            "⛔ 일일 질문 한도(3회)를 초과했습니다.",
        );
      } else {
        setAiError("시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    } finally {
      setAiLoading(false);
    }
  };

  // 캔버스 로직
  const startDraw = (e) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.strokeStyle = "#0052cc"; // 테마 컬러(파란색)로 변경
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    isDrawingRef.current = true;
  };
  const draw = (e) => {
    if (!isDrawingRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };
  const endDraw = () => {
    isDrawingRef.current = false;
  };
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  };

  // 수식 렌더링
  const renderSolution = (text) => {
    if (!text) return null;
    return text.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g).map((part, idx) => {
      if (part.startsWith("$$"))
        return <BlockMath key={idx}>{part.slice(2, -2)}</BlockMath>;
      if (part.startsWith("$"))
        return <InlineMath key={idx}>{part.slice(1, -1)}</InlineMath>;
      return (
        <span key={idx}>
          {part.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </span>
      );
    });
  };

  if (loading || !question)
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 font-medium">
        <span className="material-symbols-outlined animate-spin text-3xl mr-3 text-[#0052cc]">
          autorenew
        </span>
        문제 로딩 중...
      </div>
    );

  return (
    <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto min-h-screen flex flex-col lg:flex-row gap-8 font-sans bg-[#f8fafc]">
      {/* ======================= 왼쪽: 문제 및 옵션 영역 ======================= */}
      <div className="flex-1 flex flex-col gap-8">
        {/* 문제 헤더 */}
        <section className="bg-white rounded-xl p-8 shadow-[0_4px_20px_rgba(0,82,204,0.04)] border border-slate-100 transition-all">
          <div className="flex items-center gap-4 mb-6">
            <span className="bg-[#0052cc] text-white px-4 py-1 rounded-full text-sm font-bold tracking-widest uppercase">
              Question {id.split("-")[0] || id}
            </span>
            <span className="text-slate-500 text-sm font-medium">
              {question?.chapter || question?.concept || "전기기사 과목"}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 leading-tight font-['Manrope'] tracking-tight">
            {question?.question || question?.title}
          </h1>

          {/* 이미지가 있을 경우 (옵션) */}
          {question?.image_url && (
            <div className="mt-8 relative group overflow-hidden rounded-xl bg-slate-50 border border-slate-200 p-6">
              <img
                alt="Question Diagram"
                className="w-full h-auto object-contain rounded-lg mix-blend-multiply opacity-90 transition-transform duration-700"
                src={question.image_url}
              />
            </div>
          )}
        </section>

        {/* 선택지 목록 */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question?.choices?.map((text, i) => {
            const number = i + 1;
            const isSubmitted = !!result;
            const isCorrectAnswer = isSubmitted && number === result.answer;
            const isUserSelected = number === selected;
            const shouldStrikeThrough =
              isSubmitted && isUserSelected && !isCorrectAnswer;

            // 레퍼런스 디자인에 맞춘 동적 클래스 적용
            let btnClass =
              "bg-white text-slate-800 border-2 border-transparent hover:border-[#0052cc] hover:shadow-xl";
            let circleClass =
              "bg-slate-100 text-slate-500 group-hover:bg-[#0052cc] group-hover:text-white";

            if (isCorrectAnswer) {
              btnClass =
                "bg-green-50 border-green-500 text-green-900 shadow-md";
              circleClass = "bg-green-500 text-white";
            } else if (shouldStrikeThrough) {
              btnClass =
                "bg-red-50 border-red-400 text-red-500 line-through opacity-80";
              circleClass = "bg-red-400 text-white";
            } else if (isSubmitted) {
              btnClass =
                "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
              circleClass = "bg-slate-200 text-slate-400";
            } else if (isUserSelected) {
              btnClass =
                "bg-[#e6f0ff] border-[#0052cc] text-[#0052cc] font-bold";
              circleClass = "bg-[#0052cc] text-white";
            }

            return (
              <button
                key={number}
                onClick={() => !isSubmitted && setSelected(number)}
                disabled={isSubmitted}
                className={`group flex items-center p-6 rounded-xl text-left transition-all active:scale-[0.98] ${btnClass}`}
              >
                <span
                  className={`min-w-[3rem] w-12 h-12 flex items-center justify-center rounded-full font-bold transition-colors mr-6 ${circleClass}`}
                >
                  {isCorrectAnswer ? "✔" : shouldStrikeThrough ? "✖" : number}
                </span>
                <span className="text-lg font-medium leading-relaxed">
                  {text}
                </span>
              </button>
            );
          })}
        </section>

        {/* 제출 버튼 */}
        {!result && (
          <button
            onClick={onSubmit}
            disabled={!selected || submitting}
            className={`mt-4 w-full md:w-auto self-end px-8 py-4 rounded-xl text-white font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all ${
              submitting
                ? "bg-[#acc7ff] cursor-not-allowed"
                : selected
                  ? "bg-gradient-to-r from-[#0052cc] to-[#0070f3] hover:scale-[1.02] active:scale-95 shadow-[#0052cc]/20"
                  : "bg-slate-300 cursor-not-allowed"
            }`}
          >
            {submitting ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "최종 답안 제출"
            )}
          </button>
        )}

        {/* ======================= 결과, 해설 및 AI 영역 ======================= */}
        {result && (
          <div className="mt-8 space-y-6 animate-fade-in-up">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowSolution(!showSolution)}
                className="px-5 py-3 bg-slate-800 text-white font-semibold rounded-xl shadow hover:bg-slate-900 transition flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-xl">
                  description
                </span>
                {showSolution ? "해설 닫기" : "텍스트 풀이 보기"}
              </button>

              <button
                onClick={handleShowVideo}
                className="px-5 py-3 bg-red-600 text-white font-semibold rounded-xl shadow hover:bg-red-700 transition flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-xl">
                  play_circle
                </span>
                {showVideo ? "동영상 닫기" : "동영상 해설 보기"}
              </button>

              <button
                onClick={() => setShowAiChat(!showAiChat)}
                className="px-5 py-3 bg-[#0052cc] text-white font-semibold rounded-xl shadow hover:bg-[#004491] transition flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-xl">
                  smart_toy
                </span>
                {showAiChat ? "AI 닫기" : "AI 튜터에게 질문"}
              </button>
            </div>

            {/* 텍스트 해설 */}
            {showSolution && (
              <div className="bg-[#e6f0ff] border border-[#acc7ff] rounded-2xl p-6 shadow-sm">
                <h4 className="font-bold text-[#003366] mb-4 flex items-center gap-2 text-lg">
                  <span className="material-symbols-outlined text-[#0052cc]">
                    lightbulb
                  </span>
                  상세 해설
                </h4>
                <div className="text-slate-800 leading-relaxed text-base font-medium space-y-2">
                  {renderSolution(result.solution || question.solution)}
                </div>
              </div>
            )}

            {/* 동영상 플레이어 */}
            {showVideo && (
              <div className="bg-black rounded-2xl overflow-hidden aspect-video shadow-2xl relative border border-slate-800">
                {isVideoLoading ? (
                  <div className="w-full h-full flex items-center justify-center text-white space-x-3">
                    <span className="w-6 h-6 border-2 border-[#0052cc] border-t-transparent rounded-full animate-spin" />
                    <span className="font-medium">영상 불러오는 중...</span>
                  </div>
                ) : videoUrl ? (
                  <iframe
                    src={videoUrl}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="해설 강의"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-900">
                    <span className="material-symbols-outlined text-5xl mb-2">
                      videocam_off
                    </span>
                    <p>재생 가능한 영상이 없습니다.</p>
                  </div>
                )}
              </div>
            )}

            {/* AI 튜터 채팅 영역 */}
            {showAiChat && (
              <div className="bg-white border-2 border-[#acc7ff] rounded-2xl p-6 shadow-xl">
                <h4 className="font-bold text-[#003366] mb-4 flex items-center gap-2 text-lg">
                  🤖 AI 전기기사 튜터
                  <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    Claude 3.5 & Neo4j
                  </span>
                </h4>

                <form onSubmit={handleAiSearch} className="flex gap-2 mb-6">
                  <input
                    type="text"
                    className="flex-1 p-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0052cc]/30 focus:border-[#0052cc] bg-slate-50 transition-all font-medium"
                    placeholder="이 문제의 개념이나 공식에 대해 물어보세요."
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={aiLoading}
                    className="px-6 bg-[#0052cc] text-white rounded-xl hover:bg-[#004491] disabled:bg-slate-300 font-bold transition-colors"
                  >
                    {aiLoading ? "분석 중..." : "질문하기"}
                  </button>
                </form>

                {/* AI 답변 영역 */}
                {aiLoading ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0052cc]"></div>
                    <span className="text-sm text-[#0052cc] font-bold">
                      지식 그래프를 분석하여 최적의 해설을 생성 중입니다...
                    </span>
                  </div>
                ) : aiError ? (
                  <div
                    className={`p-5 rounded-xl flex items-start gap-3 ${
                      aiError.includes("한도") || aiError.includes("3회")
                        ? "bg-orange-50 text-orange-800 border border-orange-200"
                        : "bg-red-50 text-red-600 border border-red-200"
                    }`}
                  >
                    <span className="text-2xl mt-0.5">
                      {aiError.includes("한도") ? "🛑" : "⚠️"}
                    </span>
                    <div className="text-sm font-semibold leading-relaxed">
                      {aiError}
                    </div>
                  </div>
                ) : aiAnswer ? (
                  <div className="prose max-w-none text-sm bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-extrabold tracking-widest text-[#0052cc] bg-white px-3 py-1 rounded shadow-sm border border-[#e6f0ff]">
                        💡 AI ANALYSIS
                      </span>
                    </div>
                    <p className="whitespace-pre-line leading-[1.8] text-slate-700 font-medium text-[15px]">
                      {aiAnswer}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                    <p className="text-slate-500 font-medium">
                      궁금한 내용을 입력하면 <br />
                      <span className="font-extrabold text-[#0052cc]">
                        하루 3회
                      </span>{" "}
                      무료로 답변해 드립니다. 🎁
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ======================= 오른쪽: 스터디 노트 (캔버스) ======================= */}
      <aside className="w-full lg:w-96 flex flex-col gap-6">
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden flex flex-col h-[500px] lg:sticky lg:top-24">
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-[#0052cc]"
                data-icon="edit_note"
              >
                edit_note
              </span>
              <h2 className="font-extrabold text-slate-800 uppercase tracking-widest text-sm">
                Study Note
              </h2>
            </div>
            <button
              onClick={clearCanvas}
              className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
            >
              지우기
            </button>
          </div>

          {/* 캔버스 영역 (모눈종이 패턴 스타일 유지) */}
          <div className="flex-1 relative bg-[radial-gradient(#e1e3e4_1px,transparent_1px)] [background-size:20px_20px] cursor-crosshair">
            {/* 캔버스 크기를 고정하여 좌표 틀어짐 방지 (필요 시 width/height 조정 가능) */}
            <canvas
              ref={canvasRef}
              width={400}
              height={440}
              className="absolute top-0 left-0 w-full h-full touch-none"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={(e) => {
                const touch = e.touches[0];
                const rect = e.target.getBoundingClientRect();
                const mouseEvent = new MouseEvent("mousedown", {
                  clientX: touch.clientX,
                  clientY: touch.clientY,
                });
                // 터치 이벤트를 처리하기 위한 임시 방편 (필요 시 강화)
                startDraw({
                  nativeEvent: {
                    offsetX: touch.clientX - rect.left,
                    offsetY: touch.clientY - rect.top,
                  },
                });
              }}
              onTouchMove={(e) => {
                const touch = e.touches[0];
                const rect = e.target.getBoundingClientRect();
                draw({
                  nativeEvent: {
                    offsetX: touch.clientX - rect.left,
                    offsetY: touch.clientY - rect.top,
                  },
                });
              }}
              onTouchEnd={endDraw}
            />
            {!isDrawingRef.current && (
              <div className="absolute top-4 left-6 pointer-events-none opacity-40 italic text-slate-400 font-medium">
                여기에 풀이 과정을 메모하세요...
              </div>
            )}
          </div>
        </div>

        {/* 오답 다시풀기 모드일 경우 다음 문제 버튼 표시 */}
        {mode === "retry" && result && (
          <button
            onClick={goNextWrong}
            className="w-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white py-5 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            다음 오답 문제로
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        )}
      </aside>
    </main>
  );
}
