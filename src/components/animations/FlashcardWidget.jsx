import apiClient from "@/api/core/apiClient";
import katex from "katex";
import "katex/dist/katex.min.css";
import { Check, ChevronLeft, ChevronRight, RotateCcw, X } from "lucide-react";
import { useEffect, useState } from "react";

const renderMathContent = (text) => {
  if (!text) return "";

  // 리터럴 \n → 실제 줄바꿈
  let processed = text.replace(/\\n/g, "\n");

  // $$ 블록 수식
  let html = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    try {
      return `<div style="margin:0.75rem 0;text-align:center;overflow-x:auto;">${katex.renderToString(
        math.trim(),
        {
          displayMode: true,
          throwOnError: false,
          strict: false,
        },
      )}</div>`;
    } catch {
      return `<div>${math}</div>`;
    }
  });

  // $ 인라인 수식
  html = html.replace(/\$((?!\$)[^$\n]+?)\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), {
        displayMode: false,
        throwOnError: false,
        strict: false,
      });
    } catch {
      return math;
    }
  });

  // 줄바꿈 → <br>
  html = html.replace(/\n/g, "<br/>");

  return html;
};

const FlashcardWidget = ({ subject, onMarkIncorrect }) => {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/flashcards/${subject.name}`);
        const fetchedData = response.data?.data || [];
        setCards(fetchedData);
        setCurrentIndex(0);
        setIsFlipped(false);
      } catch (error) {
        console.error("플래시카드 데이터를 불러오는 중 오류 발생:", error);
      } finally {
        setLoading(false);
      }
    };

    if (subject?.name) {
      fetchCards();
    }
  }, [subject.name]);

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleIncorrectClick = async (card) => {
    if (!card) return;
    onMarkIncorrect({
      id: card.id,
      keyword: card.title,
      answer: card.content,
    });
    try {
      await apiClient.post("/flashcards/wrongbook", {
        card_id: card.id,
        subject: card.subject,
      });
    } catch (error) {
      console.error("오답노트 DB 저장 실패:", error);
    }
    handleNext();
  };

  if (loading) {
    return (
      <div className="w-full max-w-md h-[26rem] flex flex-col items-center justify-center bg-white rounded-[2rem] shadow-sm border border-slate-100">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-medium">데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="w-full max-w-md h-[26rem] flex flex-col items-center justify-center bg-white rounded-[2rem] shadow-sm border border-slate-100 text-slate-400">
        해당 과목의 데이터가 없습니다.
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const progressPercentage = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="w-full max-w-md flex flex-col items-center">
      {/* 진행률 바 */}
      <div className="w-full mb-6 px-4">
        <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
          <span>진행도</span>
          <span>
            {currentIndex + 1} / {cards.length}
          </span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-500 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* 3D 플립 카드 */}
      <div
        className="w-full relative h-[26rem]"
        style={{ perspective: "1000px" }}
      >
        <div
          className="w-full h-full cursor-pointer transition-transform duration-500 ease-in-out"
          onClick={handleFlip}
          style={{
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            WebkitTransform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transformStyle: "preserve-3d",
            WebkitTransformStyle: "preserve-3d",
          }}
        >
          {/* 앞면: Question */}
          <div
            className="absolute inset-0 w-full h-full bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-100 flex flex-col items-center justify-center p-8 text-center"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <span className="text-xs font-extrabold text-blue-500 mb-4 tracking-widest bg-blue-50 px-3 py-1 rounded-full uppercase">
              Question
            </span>
            <h2 className="text-2xl font-extrabold text-slate-800 break-keep leading-snug">
              {currentCard?.title}
            </h2>
            <div className="absolute bottom-6 flex items-center gap-2 text-slate-300 text-sm font-medium">
              <RotateCcw size={16} /> 터치하여 정답 확인
            </div>
          </div>

          {/* 뒷면: Answer */}
          <div
            className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-500 text-white rounded-[2rem] flex flex-col p-8 overflow-y-auto"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              WebkitTransform: "rotateY(180deg)",
            }}
          >
            {/* Answer 뱃지 */}
            <div className="w-full flex justify-center mb-5 shrink-0">
              <span className="text-xs font-extrabold text-blue-100 tracking-widest bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full uppercase">
                Answer
              </span>
            </div>

            {/* KaTeX 렌더링 */}
            <div
              className="text-[15px] font-medium leading-relaxed w-full flex-1"
              style={{ color: "white" }}
              dangerouslySetInnerHTML={{
                __html: renderMathContent(currentCard?.content),
              }}
            />

            {/* 하단 안내 */}
            <div className="w-full flex justify-center pt-4 shrink-0 text-blue-200 text-sm font-medium">
              <RotateCcw size={16} className="mr-1 inline-block" /> 다시
              터치하여 뒤집기
            </div>
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex items-center justify-between w-full mt-8 px-2 gap-3">
        <button
          onClick={handlePrev}
          className="p-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors shrink-0"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="flex gap-3 flex-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleIncorrectClick(currentCard);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-white text-red-500 font-bold rounded-2xl hover:bg-red-50 transition-all border border-slate-200 hover:border-red-200 active:scale-95 shadow-sm"
          >
            <X size={20} strokeWidth={3} />
            <span className="text-[15px]">몰라요</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-blue-500 text-white font-bold rounded-2xl hover:bg-blue-600 transition-all shadow-md active:scale-95"
          >
            <Check size={20} strokeWidth={3} />
            <span className="text-[15px]">알아요</span>
          </button>
        </div>

        <button
          onClick={handleNext}
          className="p-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors shrink-0"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default FlashcardWidget;
