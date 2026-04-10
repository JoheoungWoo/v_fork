import { useEffect, useState } from "react";
import apiClient from "./apiClient"; // 기존에 만든 apiClient 경로에 맞게 수정

const FlashcardWidget = ({ subject, onMarkIncorrect }) => {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  // 과목이 변경될 때마다 백엔드 API에서 데이터 Fetch
  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      try {
        // FastAPI의 GET /flashcards/{subject} 호출
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
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // '모르겠어요(X)' 버튼 클릭 시 상위(Page)로 올리고, 백엔드에도 저장
  const handleIncorrectClick = async (card) => {
    // 1. UI 상태 업데이트 (FlashcardPage의 오답노트에 추가)
    onMarkIncorrect({
      id: card.id,
      keyword: card.title,
      answer: card.content,
    });

    // 2. 백엔드 DB 오답노트에 연동 저장
    try {
      await apiClient.post("/flashcards/wrongbook", {
        card_id: card.id,
        subject: card.subject,
      });
    } catch (error) {
      console.error("오답노트 DB 저장 실패:", error);
    }

    // 다음 카드로 넘어가기
    handleNext();
  };

  if (loading) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-white rounded-xl shadow">
        데이터를 불러오는 중...
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-white rounded-xl shadow">
        해당 과목의 데이터가 없습니다.
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center">
      <div className="text-gray-500 text-sm mb-4">
        {currentIndex + 1} / {cards.length}
      </div>

      {/* 카드 영역 */}
      <div
        onClick={handleFlip}
        className="w-full h-64 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center p-6 cursor-pointer hover:bg-gray-50 transition-colors"
      >
        {!isFlipped ? (
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            {currentCard.title}
          </h2>
        ) : (
          <p className="text-lg text-gray-700 text-center whitespace-pre-wrap">
            {currentCard.content}
          </p>
        )}
      </div>

      <p className="text-sm text-gray-400 mt-2">카드를 터치하여 뒤집기</p>

      {/* 하단 컨트롤러 */}
      <div className="flex w-full justify-between items-center mt-6">
        <button
          onClick={handlePrev}
          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          이전
        </button>

        <button
          onClick={() => handleIncorrectClick(currentCard)}
          className="px-6 py-2 bg-red-100 text-red-600 font-bold rounded-lg hover:bg-red-200"
        >
          모르겠어요
        </button>

        <button
          onClick={handleNext}
          className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default FlashcardWidget;
