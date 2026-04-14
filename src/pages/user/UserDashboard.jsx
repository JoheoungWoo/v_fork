import FlashcardWidget from "@/components/animations/FlashcardWidget";
import RecommendedVideo from "@/components/video/RecommendedVideo";
import useMove from "@/hooks/useMove";
import { ForwardIcon } from "lucide-react";
import { useEffect, useState } from "react";
// 🌟 방금 만든 오답노트 컴포넌트 임포트 (경로는 실제 위치에 맞게 수정)
import WrongAnswerNote from "@/components/animations/WrongAnswerNote";

// ---------------------------------------------------------
// 1. 큐넷 시험 일정 파싱 함수
// ---------------------------------------------------------
function extractExamSchedule(mdText) {
  const lines = mdText.split("\n");
  const scheduleData = [];
  let isTableMode = false;

  for (let line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.includes("| 구분 | 필기원서접수")) {
      isTableMode = true;
      continue;
    }
    if (isTableMode && trimmedLine.startsWith("| ---")) continue;
    if (isTableMode && trimmedLine.startsWith("|")) {
      const columns = trimmedLine
        .split("|")
        .map((col) => col.trim())
        .filter((col) => col !== "");
      if (columns.length >= 7) {
        scheduleData.push({
          구분: columns[0],
          필기원서접수: columns[1],
          필기시험: columns[2],
          필기합격발표: columns[3],
          실기원서접수: columns[4],
          실기시험: columns[5],
          최종합격자발표일: columns[6],
        });
      }
    } else if (isTableMode && trimmedLine === "") {
      break;
    }
  }
  return scheduleData;
}

// ---------------------------------------------------------
// 2. 대시보드 삽입용 스피드 퀴즈 + 오답노트 섹션
// ---------------------------------------------------------
function SpeedQuizDashboardSection() {
  const subjects = [
    { id: 1, name: "전기자기학" },
    { id: 2, name: "전력공학" },
    { id: 3, name: "전기기기" },
    { id: 4, name: "회로이론" },
    { id: 5, name: "전기설비기술기준" },
  ];

  const [activeSubject, setActiveSubject] = useState(subjects[1]); // 전력공학 기본 선택
  const [incorrectCards, setIncorrectCards] = useState([]);

  const handleMarkIncorrect = (card) => {
    setIncorrectCards((prev) => {
      if (prev.some((c) => c.id === card.id)) return prev;
      return [...prev, card];
    });
  };

  return (
    <div className="mb-10 bg-surface-container-lowest rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">
          ⚡ 스피드 기출 암기장
        </h2>
        <p className="text-sm text-on-surface-variant mt-1">
          모르는 문제는 자동으로 오른쪽 오답 노트에 저장됩니다.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => setActiveSubject(subject)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
              activeSubject.id === subject.id
                ? "bg-primary text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {subject.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col items-center justify-center">
          <FlashcardWidget
            subject={activeSubject}
            onMarkIncorrect={handleMarkIncorrect}
          />
        </div>

        {/* 🌟 외부 컴포넌트로 깔끔하게 처리 */}
        <WrongAnswerNote incorrectCards={incorrectCards} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// 3. 메인 UserDashboard 컴포넌트
// ---------------------------------------------------------
export default function UserDashboard() {
  const move = useMove();
  const [schedules, setSchedules] = useState([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(true);
  const [scheduleError, setScheduleError] = useState(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setIsLoadingSchedules(true);
        const address =
          "https://r.jina.ai/https://www.q-net.or.kr/crf005.do?id=crf00503&jmCd=1150";
        const response = await fetch(address);
        if (!response.ok) throw new Error("데이터를 불러오는데 실패했습니다.");
        const markdownText = await response.text();
        setSchedules(extractExamSchedule(markdownText));
      } catch (error) {
        setScheduleError("시험 일정을 불러오지 못했습니다.");
      } finally {
        setIsLoadingSchedules(false);
      }
    };
    fetchSchedules();
  }, []);

  return (
    <main className="flex-grow pt-24 pb-12 px-6 max-w-7xl mx-auto w-full font-body">
      {/* Hero Section */}
      <section className="mb-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-8 bg-surface-container-low rounded-xl p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-2">
              반갑습니다, James 님
            </h1>
            <p className="text-lg text-on-surface-variant mb-8">
              오늘의 학습을 이어갈 준비가 되셨나요?
            </p>
            <div className="flex flex-wrap gap-4 items-center mb-8">
              <button className="bg-gradient-to-b from-primary to-primary-container text-on-primary px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95">
                학습 계속하기
              </button>
              <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-sm">
                <span
                  className="material-symbols-outlined text-orange-500"
                  data-icon="local_fire_department"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  local_fire_department
                </span>
                <div>
                  <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                    Study Streak
                  </p>
                  <p className="text-xl font-bold">12일 연속</p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="bg-white/60 backdrop-blur-sm p-5 rounded-xl">
              <div className="flex justify-between items-end mb-3">
                <span className="text-on-surface font-bold text-lg">
                  전체 진척도
                </span>
                <span className="text-primary font-extrabold text-2xl">
                  68%
                </span>
              </div>
              <div className="w-full bg-surface-container-highest h-3 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full"
                  style={{ width: "68%" }}
                ></div>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-5 rounded-xl">
              <div className="flex justify-between items-end mb-3">
                <span className="text-on-surface font-bold text-lg">
                  주간 목표
                </span>
                <span className="text-tertiary font-extrabold text-2xl">
                  4/5일
                </span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 h-3 rounded-full bg-tertiary"></div>
                <div className="flex-1 h-3 rounded-full bg-tertiary"></div>
                <div className="flex-1 h-3 rounded-full bg-tertiary"></div>
                <div className="flex-1 h-3 rounded-full bg-tertiary"></div>
                <div className="flex-1 h-3 rounded-full bg-surface-container-highest"></div>
              </div>
            </div>
          </div>
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-error-container text-on-error-container p-6 rounded-xl flex-grow border-l-4 border-error overflow-y-auto max-h-[300px]">
            <div className="flex items-start justify-between mb-4">
              <span
                className="material-symbols-outlined text-3xl"
                data-icon="event_upcoming"
              >
                event_upcoming
              </span>
              <span className="bg-error text-white text-xs px-2 py-1 rounded font-bold">
                Q-Net 일정
              </span>
            </div>
            <h3 className="text-xl font-bold mb-4">
              2026년 전기기사 시험 일정
            </h3>
            {isLoadingSchedules ? (
              <div className="flex items-center gap-2 text-sm opacity-80 py-4">
                <span className="w-4 h-4 border-2 border-on-error-container border-t-transparent rounded-full animate-spin"></span>
                일정을 불러오는 중입니다...
              </div>
            ) : scheduleError ? (
              <p className="text-sm opacity-80">{scheduleError}</p>
            ) : schedules.length > 0 ? (
              <div className="space-y-4">
                {schedules.map((schedule, index) => (
                  <div
                    key={index}
                    className="bg-white/40 p-3 rounded-lg border border-on-error-container/10"
                  >
                    <p className="font-bold text-sm mb-1">{schedule.구분}</p>
                    <div className="text-xs space-y-1 opacity-90">
                      <p>필기: {schedule.필기시험}</p>
                      <p>실기: {schedule.실기시험}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm opacity-80">예정된 시험 일정이 없습니다.</p>
            )}
            <button
              className="w-full mt-6 py-3 rounded-lg border border-on-error-container/20 font-bold hover:bg-on-error-container/5 transition-colors"
              onClick={() =>
                window.open(
                  "https://www.q-net.or.kr/crf005.do?id=crf00503&jmCd=1150",
                  "_blank",
                )
              }
            >
              큐넷에서 자세히 보기
            </button>
          </div>

          <div className="bg-surface-container-highest p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <span
                className="material-symbols-outlined text-primary"
                data-icon="assignment"
              >
                assignment
              </span>
              <h3 className="font-bold">과제 제출 알림</h3>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              송배전 공학 주차 과제가 내일 마감됩니다.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <SpeedQuizDashboardSection />

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight">추천 강좌</h2>
            <a
              className="text-primary font-bold text-sm flex items-center gap-1 hover:underline cursor-pointer"
              onClick={() => move("/user/videos")}
            >
              전체 보기 <ForwardIcon size={16} />
            </a>
          </div>
          <RecommendedVideo />
        </div>

        <div className="lg:col-span-4">
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            전문가 도구
          </h2>
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-left border-l-4 border-primary group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <span
                    className="material-symbols-outlined"
                    data-icon="calculate"
                  >
                    calculate
                  </span>
                </div>
                <div>
                  <p className="font-bold text-lg">전압 강하 계산기</p>
                  <p className="text-xs text-on-surface-variant">
                    Voltage Drop Calculator
                  </p>
                </div>
              </div>
              <span
                className="material-symbols-outlined text-on-surface-variant"
                data-icon="chevron_right"
              >
                chevron_right
              </span>
            </button>
            <button className="w-full flex items-center justify-between p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-left border-l-4 border-secondary group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                  <span
                    className="material-symbols-outlined"
                    data-icon="menu_book"
                  >
                    menu_book
                  </span>
                </div>
                <div>
                  <p className="font-bold text-lg">NEC 핸드북 (2024)</p>
                  <p className="text-xs text-on-surface-variant">
                    Electrical Safety Standards
                  </p>
                </div>
              </div>
              <span
                className="material-symbols-outlined text-on-surface-variant"
                data-icon="chevron_right"
              >
                chevron_right
              </span>
            </button>

            <div className="bg-surface-container-high rounded-xl p-6 mt-8">
              <h3 className="font-bold mb-4">최근 학습한 내용</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <p className="text-sm">변압기 병렬 운전의 조건 (14분 전)</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <p className="text-sm">3상 유도 전동기 원리 (2시간 전)</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                  <p className="text-sm">배전 계통의 구성 요소 (어제)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
