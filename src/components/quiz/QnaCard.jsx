import React, { useState } from "react";
import VideoPlayer from "@/components/video/VideoPlayer";
import {
  User,
  MoreVertical,
  MessageCircle,
  CornerUpLeft,
  Edit,
  Bold,
  Italic,
  List,
  Image as ImageIcon,
  Paperclip,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ==========================================
// 💡 개별 질문/답변 아이템 컴포넌트
// ==========================================
const QnaItem = ({
  studentName,
  badge,
  timeAgo,
  title,
  question,
  answer,
  videoUrl,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <article className="py-10 border-b border-slate-100 comment-item">
      <div className="flex gap-4 md:gap-6">
        {/* 학생 프로필 아바타 */}
        <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-50">
          <User
            className="text-slate-400 w-7 h-7 md:w-8 md:h-8"
            strokeWidth={2.5}
          />
        </div>

        <div className="flex-1 flex flex-col gap-3">
          {/* 헤더: 이름, 작성시간, 액션버튼 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <span className="font-extrabold text-slate-900 text-lg md:text-xl">
                {studentName}
              </span>
              <span className="text-slate-400 text-sm md:text-base">
                {timeAgo}
              </span>
            </div>
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <MoreVertical className="w-6 h-6" />
            </button>
          </div>

          {/* 질문 내용 */}
          <div className="mt-1">
            <div className="flex items-center gap-3 mb-2 md:mb-3">
              {badge && (
                <span className="bg-[#004287]/10 text-[#004287] text-xs font-extrabold px-3 py-1 rounded uppercase tracking-wide">
                  {badge}
                </span>
              )}
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 hover:underline cursor-pointer leading-tight">
                {title}
              </h2>
            </div>
            <p className="text-lg md:text-xl text-slate-800 leading-relaxed font-medium">
              {question}
            </p>
          </div>

          {/* 답변 열기/닫기 토글 버튼 */}
          <div className="mt-4 flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-base md:text-lg font-bold text-[#004287] flex items-center gap-2 hover:underline transition-all"
            >
              <MessageCircle
                className="w-5 h-5 md:w-6 md:h-6"
                strokeWidth={2.5}
              />
              {isOpen ? "답변 접기" : "강사 답변 보기"}
            </button>
          </div>

          {/* 🌟 중첩된 강사 답변 영역 (isOpen 상태에 따라 표시) */}
          {isOpen && (
            <div className="mt-6 md:mt-8 space-y-6 animate-fade-in">
              <div className="ml-2 md:ml-4 lg:ml-12 relative">
                {/* 데스크탑 환경 연결선 UI */}
                <div className="absolute -left-8 top-0 bottom-6 w-[2px] bg-slate-200 hidden lg:block"></div>
                <div className="absolute -left-8 top-8 w-6 h-[2px] bg-slate-200 hidden lg:block"></div>

                {/* 답변 박스 */}
                <div className="bg-[#f7f9fc] p-6 md:p-8 rounded-2xl border border-blue-100 shadow-sm">
                  <div className="flex gap-3 md:gap-4">
                    <div className="shrink-0">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#004287] flex items-center justify-center text-white text-sm md:text-base font-extrabold shadow-md">
                        AI
                      </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-3 mb-3 md:mb-4">
                        <span className="font-extrabold text-slate-900 text-lg md:text-xl">
                          Lumina Tutor
                        </span>
                        <span className="bg-[#004287] text-white text-[10px] md:text-[11px] font-extrabold px-2 py-0.5 rounded tracking-tighter uppercase">
                          Instructor
                        </span>
                      </div>

                      <div className="text-base md:text-xl leading-relaxed text-slate-800 mb-5 md:mb-6 font-medium break-keep">
                        {answer}
                      </div>

                      {/* 동영상 플레이어 연동 */}
                      {videoUrl && (
                        <div className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-md border border-slate-200 aspect-video bg-black">
                          <VideoPlayer
                            videoUrl={videoUrl}
                            title="강사 답변 영상"
                          />
                        </div>
                      )}

                      <div className="mt-5 md:mt-6 flex items-center pt-4 border-t border-slate-200">
                        <button className="text-base md:text-lg font-bold text-slate-500 hover:text-[#004287] transition-colors flex items-center gap-2">
                          <CornerUpLeft
                            className="w-5 h-5 md:w-6 md:h-6"
                            strokeWidth={2.5}
                          />
                          추가 질문하기
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

// ==========================================
// 💡 메인 QnA 화면 컴포넌트
// ==========================================
const QnaCard = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    alert("질문이 성공적으로 등록되었습니다.");
    setTitle("");
    setContent("");
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-10 font-body">
      {/* 1. Page Title */}
      <div className="border-b-2 border-slate-900 pb-4 mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          학습 질문 게시판
        </h1>
        <p className="text-lg md:text-xl text-slate-600 mt-2">
          강의 내용에 대해 궁금한 점을 전문가에게 물어보세요.
        </p>
      </div>

      {/* 2. Enhanced Editor Input Area */}
      <section className="mb-12 bg-white border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-[#004287]/20 transition-all">
        <div className="bg-slate-50/50 px-5 md:px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg md:text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Edit
              className="text-[#004287] w-5 h-5 md:w-6 md:h-6"
              strokeWidth={2.5}
            />
            새 질문 작성하기
          </h2>
        </div>
        <div className="p-5 md:p-6 space-y-5">
          <div>
            <label className="block text-base font-bold text-slate-700 mb-2">
              질문 제목
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 md:py-4 text-lg md:text-xl font-bold placeholder:text-slate-300 focus:outline-none focus:border-[#004287] transition-colors"
              placeholder="궁금하신 내용의 핵심을 제목으로 적어주세요"
            />
          </div>
          <div>
            <label className="block text-base font-bold text-slate-700 mb-2">
              상세 내용
            </label>
            <div className="border-2 border-slate-200 rounded-lg overflow-hidden focus-within:border-[#004287] transition-colors">
              {/* 툴바 UI */}
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex gap-4 md:gap-6 overflow-x-auto items-center">
                <button className="text-slate-500 hover:text-[#004287] transition-colors">
                  <Bold className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <button className="text-slate-500 hover:text-[#004287] transition-colors">
                  <Italic className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <button className="text-slate-500 hover:text-[#004287] transition-colors">
                  <List className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <div className="w-px h-6 bg-slate-300 self-center"></div>
                <button className="text-slate-500 hover:text-[#004287] transition-colors">
                  <ImageIcon className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <button className="text-slate-500 hover:text-[#004287] transition-colors">
                  <Paperclip className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full border-none px-4 py-4 md:py-5 text-base md:text-[18px] min-h-[200px] md:min-h-[240px] placeholder:text-slate-300 focus:outline-none resize-none leading-relaxed"
                placeholder="학습 중 어려움을 겪고 계신 부분을 자세히 설명해주세요."
              />
            </div>
          </div>
        </div>
        <div className="bg-slate-50/50 px-5 md:px-6 py-4 md:py-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            ※ 비방이나 욕설이 포함된 게시물은 삭제될 수 있습니다.
          </p>
          <button
            onClick={handleSubmit}
            className="w-full md:w-auto bg-[#004287] hover:bg-[#00356b] text-white px-10 py-3 md:py-4 rounded-lg font-bold text-lg md:text-xl shadow-md transition-all active:scale-95 whitespace-nowrap"
          >
            질문 등록하기
          </button>
        </div>
      </section>

      {/* 3. Header Statistics & Sorting */}
      <div className="flex flex-col gap-4 mb-2">
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-0">
          <div className="flex gap-6 md:gap-10">
            <button className="text-lg md:text-xl font-extrabold text-slate-900 border-b-4 border-slate-900 pb-3">
              최신순
            </button>
            <button className="text-lg md:text-xl font-bold text-slate-400 hover:text-slate-600 pb-3 transition-colors">
              과거순
            </button>
          </div>
        </div>
      </div>

      {/* 4. Question List */}
      <div className="space-y-0">
        <QnaItem
          studentName="김철수 수강생"
          badge="AI Insight"
          timeAgo="2시간 전"
          title="데이터 전처리 과정에서 이상치 제거 기준이 궁금합니다."
          question="강의에서 설명해주신 IQR 방식 외에 실제 현업에서는 어떤 기준을 가장 선호하시나요? 특히 금융 데이터처럼 민감한 정보를 다룰 때의 기준이 궁금합니다."
          answer="반갑습니다 김철수 수강생님! 이상치(Outlier) 제거는 데이터 분석의 무결성을 확보하는 필수 단계입니다. 현업에서는 보통 IQR 방식 외에도 Z-Score나 Isolation Forest 알고리즘을 자주 활용합니다. 아래 보충 영상을 통해 구체적인 프로세스를 확인해 보시기 바랍니다."
          videoUrl="https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/acf4500a94d8492cde7139e71760ff71/watch"
        />

        <QnaItem
          studentName="이영희 수강생"
          timeAgo="5시간 전"
          title="파이썬 라이브러리 설치 오류 (Pip install failed)"
          question="터미널에서 pandas를 설치하려고 하는데 'permission denied' 오류가 계속 발생합니다. 맥OS를 사용 중인데 해결 방법이 있을까요?"
          answer="Mac OS의 경우 권한 문제일 확률이 높습니다. 명령어 앞에 'sudo'를 붙여서 'sudo pip install pandas' 로 실행해보시거나 파이썬 가상환경(venv) 생성을 강력하게 권장해 드립니다."
          videoUrl=""
        />

        <QnaItem
          studentName="박민수 수강생"
          timeAgo="8시간 전"
          title="10분 30초 부분의 공식 변환 과정이 헷갈립니다."
          question="교재에 나온 부분과 강의 내용의 순서가 다른 것 같은 정황인데, 어떤 기준으로 공식을 전개해야 하는지 다시 한 번 설명해주실 수 있나요?"
          answer="교재 45페이지의 기본 성질을 응용하여 축약한 버전으로 설명해 드렸습니다. 상세한 풀이 과정은 첨부해 드린 추가 영상을 확인해 주시면 이해가 빠르실 겁니다!"
          videoUrl="https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/acf4500a94d8492cde7139e71760ff71/watch"
        />
      </div>

      {/* 5. Pagination (Portal Style) */}
      <div className="flex justify-center items-center gap-2 mt-12">
        <button className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border-2 border-slate-200 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <button className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-slate-900 text-white font-extrabold rounded-lg shadow-md text-base md:text-lg">
          1
        </button>
        <button className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 rounded-lg text-base md:text-lg transition-colors">
          2
        </button>
        <button className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border-2 border-slate-200 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>
    </div>
  );
};

export default QnaCard;
