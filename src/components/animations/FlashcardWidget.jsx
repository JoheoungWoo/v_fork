import apiClient from "@/api/core/apiClient";
import { Check, ChevronLeft, ChevronRight, RotateCcw, X } from "lucide-react";
import { useEffect, useState } from "react";

// 🚀 수식 렌더링을 위한 라이브러리 추가
//import "katex/dist/katex.min.css"; // 👈 수식이 예쁘게 나오려면 CSS 임포트 필수!
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

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
        setCards(response.data.data);
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

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleIncorrectClick = async (card) => {
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
      <div className="w-full max-w-md h-96 flex flex-col items-center justify-center bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-medium">데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="w-full max-w-md h-96 flex flex-col items-center justify-center bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-slate-400">
        해당 과목의 데이터가 없습니다.
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const progressPercentage = ((currentIndex + 1) / cards.length) * 100;
  const formatMathText = (text) => {
    if (!text) return "";
    return text.replace(/\$\$([\s\S]*?)\$\$/g, "\n\n$$\n$1\n$$\n\n");
  };
  return (
    <div className="w-full max-w-md flex flex-col items-center">
      {/* 상단 진행률 바 */}
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
          ></div>
        </div>
      </div>

      {/* 3D 플립 카드 영역 */}
      <div
        className="w-full relative h-96 w-full"
        style={{ perspective: "1000px" }}
      >
        <div
          className="w-full h-full cursor-pointer transition-transform duration-500 ease-in-out"
          onClick={handleFlip}
          style={{
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* 앞면: 문제 (Question) */}
          <div
            className="absolute inset-0 w-full h-full bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-100 flex flex-col items-center justify-center p-8 text-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span className="text-xs font-extrabold text-blue-500 mb-4 tracking-widest bg-blue-50 px-3 py-1 rounded-full uppercase">
              Question
            </span>
            <h2 className="text-2xl font-extrabold text-slate-800 break-keep leading-snug">
              {currentCard.title}
            </h2>
            <div className="absolute bottom-6 flex items-center gap-2 text-slate-300 text-sm font-medium">
              <RotateCcw size={16} /> 터치하여 정답 확인
            </div>
          </div>

          {/* 뒷면: 정답 (Answer) - 수식 렌더링 적용 */}
          <div
            className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-500 text-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(59,130,246,0.4)] flex flex-col items-center justify-start p-8 text-left overflow-y-auto custom-scrollbar"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="w-full flex justify-center mb-4 shrink-0">
              <span className="text-xs font-extrabold text-blue-100 tracking-widest bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full uppercase shadow-sm">
                Answer
              </span>
            </div>

            {/* 🚀 ReactMarkdown을 통해 일반 텍스트와 LaTeX 수식을 혼합하여 렌더링 */}
            <div className="text-lg font-medium leading-relaxed w-full">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {formatMathText(currentCard.content)}
              </ReactMarkdown>
            </div>

            <div className="w-full flex justify-center mt-auto pt-6 shrink-0 text-blue-200 text-sm font-medium">
              <RotateCcw size={16} className="mr-1 inline-block" /> 다시
              터치하여 뒤집기
            </div>
          </div>
        </div>
      </div>

      {/* 하단 컨트롤러 (버튼) */}
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
            className="flex-1 flex flex-col items-center justify-center gap-1 py-3 bg-red-50 text-red-500 font-bold rounded-2xl hover:bg-red-100 hover:shadow-md transition-all border border-red-100 active:scale-95"
          >
            <X size={20} strokeWidth={3} />
            <span className="text-sm">몰라요</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-3 bg-blue-50 text-blue-600 font-bold rounded-2xl hover:bg-blue-100 hover:shadow-md transition-all border border-blue-100 active:scale-95"
          >
            <Check size={20} strokeWidth={3} />
            <span className="text-sm">알아요</span>
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
