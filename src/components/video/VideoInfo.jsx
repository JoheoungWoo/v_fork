import React from "react";

const VideoInfo = ({ title, subject, description }) => {
  return (
    <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 bg-[#0047a5] text-white text-xs font-bold rounded-md">
            {subject || "영상 강의"}
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">
          {title}
        </h1>
        <p className="text-lg leading-relaxed text-gray-600 font-medium">
          {description}
        </p>
      </div>

      <hr className="my-6 border-gray-100" />

      <div className="flex items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <span className="material-symbols-outlined text-[#0047a5]">
            analytics
          </span>
          핵심 학습 포인트
        </h2>
      </div>
      <div className="space-y-4 text-gray-600 font-light bg-gray-50 p-6 rounded-xl border border-gray-100">
        <p>
          "이 강의에서는 <strong>{title}</strong>의 원리를 완벽하게 다집니다.
          하단의 실전 퀴즈를 통해 배운 내용을 바로 복습해 보세요!"
        </p>
      </div>
    </section>
  );
};

export default VideoInfo;
