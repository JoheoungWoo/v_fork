import FlashcardWidget from "@/components/animations/FlashcardWidget";
import { useState } from "react";

const FlashcardPage = () => {
  const subjects = [
    { id: 1, name: "전기자기학" },
    { id: 2, name: "전력공학" },
    { id: 3, name: "전기기기" },
    { id: 4, name: "회로이론 및 제어" },
    { id: 5, name: "전기설비기술기준" },
  ];

  const [activeSubject, setActiveSubject] = useState(subjects[0]);

  // 모르는 카드(오답)를 저장하는 상태
  const [incorrectCards, setIncorrectCards] = useState([]);

  // 위젯에서 'X'를 눌렀을 때 실행되는 함수
  const handleMarkIncorrect = (card) => {
    setIncorrectCards((prevCards) => {
      // 이미 오답 노트에 있는 문제라면 중복 추가 방지
      if (prevCards.some((c) => c.id === card.id)) {
        return prevCards;
      }
      return [...prevCards, card];
    });
  };

  // 과목이 변경되면 오답 노트도 초기화할지 선택 가능 (현재는 유지)
  const handleSubjectChange = (subject) => {
    setActiveSubject(subject);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      {/* 헤더 */}
      <div className="w-full max-w-4xl text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          스피드 기출 암기장
        </h1>
        <p className="text-gray-600">
          모르는 문제는 자동으로 하단 오답 노트에 저장됩니다.
        </p>
      </div>

      {/* 과목 탭 */}
      <div className="w-full max-w-4xl mb-8 flex flex-wrap justify-center gap-2">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => handleSubjectChange(subject)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeSubject.id === subject.id
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            {subject.name}
          </button>
        ))}
      </div>

      {/* 학습 영역 (위/아래 레이아웃 분리) */}
      <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-8">
        {/* 왼쪽/상단: 플립 카드 위젯 */}
        <div className="flex-1 flex justify-center items-start">
          <FlashcardWidget
            subject={activeSubject}
            onMarkIncorrect={handleMarkIncorrect}
          />
        </div>

        {/* 오른쪽/하단: 나만의 오답 노트 */}
        <div className="flex-1 bg-white rounded-2xl shadow p-6 h-fit max-h-[600px] overflow-y-auto border-t-4 border-red-400">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-between">
            <span>📝 나만의 오답 노트</span>
            <span className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded-full">
              {incorrectCards.length}개
            </span>
          </h3>

          {incorrectCards.length === 0 ? (
            <p className="text-gray-400 text-center py-10">
              아직 틀린 문제가 없습니다. 완벽해요!
            </p>
          ) : (
            <ul className="space-y-4">
              {incorrectCards.map((card, index) => (
                <li
                  key={`${card.id}-${index}`}
                  className="p-4 border border-gray-100 rounded-xl bg-gray-50"
                >
                  <div className="text-sm text-red-500 font-semibold mb-1">
                    문제
                  </div>
                  <p className="text-gray-800 font-medium mb-2">
                    {card.keyword}
                  </p>
                  <div className="text-sm text-blue-500 font-semibold mb-1">
                    핵심 정답
                  </div>
                  <p className="text-gray-700">{card.answer}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashcardPage;
