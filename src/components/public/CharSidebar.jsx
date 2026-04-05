import React from "react";

const ChatSidebar = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-[600px] border border-gray-100 sticky top-28">
      <div className="p-4 bg-[#0047a5] text-white flex justify-between items-center">
        <h3 className="font-bold tracking-tight">실시간 Q&A</h3>
        <span className="text-xs opacity-80">
          학습 중인 동료들과 소통하세요
        </span>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-[#0047a5] font-bold text-xs">
            AI
          </div>
          <div className="bg-white p-3 rounded-lg text-sm shadow-sm border border-gray-100">
            <p className="font-bold text-xs text-[#0047a5] mb-1">튜터 알림</p>
            <p>
              강의 내용이나 하단 퀴즈 중 궁금한 점이 생기면 언제든 질문
              남겨주세요!
            </p>
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="relative">
          <input
            className="w-full pl-4 pr-12 py-3 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#0047a5] outline-none"
            placeholder="질문을 입력하세요..."
            type="text"
          />
          <button className="absolute right-2 top-1.5 p-1.5 text-[#0047a5]">
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
