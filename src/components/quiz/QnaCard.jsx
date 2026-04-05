import React, { useState } from "react";
import VideoPlayer from "@/components/video/VideoPlayer"; // 기존 작성하신 VideoPlayer 경로에 맞게 수정해주세요.

// 개별 질문/답변 아이템 컴포넌트 (열기/닫기 상태 관리)
const QnaItem = ({ studentId, timeAgo, question, answer, videoUrl }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
      <p className="text-sm font-bold text-gray-600 mb-2">
        {studentId}{" "}
        <span className="font-normal text-gray-400">· {timeAgo}</span>
      </p>
      <p className="text-gray-800">{question}</p>

      <div className="mt-4">
        {/* 답변 열기/닫기 버튼 */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 text-sm font-bold text-[#0047a5] hover:underline"
        >
          강사 답변 {isOpen ? "닫기" : "보기"}
          <span className="material-symbols-outlined text-base">
            {isOpen ? "expand_less" : "expand_more"}
          </span>
        </button>

        {/* 답변 및 동영상 영역 (isOpen이 true일 때 렌더링되어 영상이 로딩됨) */}
        {isOpen && (
          <div className="mt-3 pl-4 border-l-2 border-[#0047a5] animate-fade-in">
            <p className="text-sm font-bold text-[#0047a5] mb-2">강사 답변</p>
            <p className="text-gray-700 text-sm mb-4">{answer}</p>

            {videoUrl && (
              <div className="w-full max-w-sm aspect-video bg-black rounded-lg overflow-hidden border border-gray-200">
                {/* 사용자가 제공한 VideoPlayer 컴포넌트 활용.
                  부모 컨테이너(max-w-sm) 크기에 맞춰 소형 플레이어로 렌더링됩니다.
                */}
                <VideoPlayer videoUrl={videoUrl} title="강사 답변 영상" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const QnaCard = () => {
  const [question, setQuestion] = useState("");

  const handleSubmit = () => {
    if (!question.trim()) return;
    alert("질문이 등록되었습니다.");
    setQuestion("");
  };

  return (
    <div className="mt-8 p-8 bg-white border border-gray-100 rounded-xl shadow-sm animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <span className="material-symbols-outlined text-[#0047a5]">forum</span>
        <h3 className="text-2xl font-bold tracking-tight text-gray-900">
          강의 질문 및 A/S
        </h3>
      </div>

      <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100/50 mb-8">
        <p className="text-gray-700 font-medium mb-4">
          강의 내용 중 이해가 안 되는 부분이나, 추가 설명이 필요한 부분을
          남겨주세요.
        </p>
        <div className="flex flex-col gap-3">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="질문을 자유롭게 작성해주세요."
            className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0047a5] resize-none h-32"
          />
          <button
            onClick={handleSubmit}
            className="self-end bg-[#0047a5] text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all active:scale-[0.98]"
          >
            질문 등록하기
          </button>
        </div>
      </div>

      {/* 질문 리스트 */}
      <div className="border-t border-gray-100 pt-6 space-y-4">
        <h4 className="font-bold text-gray-800">이전 질문들</h4>

        {/* QnaItem 컴포넌트로 개별 상태 관리 */}
        <QnaItem
          studentId="student_123"
          timeAgo="1시간 전"
          question="10분 30초 부분의 공식 변환 과정이 잘 이해되지 않습니다."
          answer="해당 부분은 교재 45페이지의 기본 성질을 응용한 것입니다. 추가 설명 영상을 첨부해 드립니다!"
          videoUrl="https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/acf4500a94d8492cde7139e71760ff71/watch"
        />
      </div>
    </div>
  );
};

export default QnaCard;
