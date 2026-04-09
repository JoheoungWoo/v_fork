import RecommendedVideo from "@/components/video/RecommendedVideo";
import useMove from "@/hooks/useMove";
import { ForwardIcon } from "lucide-react";
import { useEffect, useState } from "react";

// 마크다운 텍스트에서 시험 일정 테이블만 파싱하는 함수
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

    if (isTableMode && trimmedLine.startsWith("| ---")) {
      continue;
    }

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

// --- 새롭게 추가된 플래시카드 위젯 컴포넌트 ---
function FlashCardWidget() {
  // 실제 환경에서는 DB/API에서 데이터를 가져옵니다.
  const flashcards = [
    {
      id: 1,
      subject: "전력공학",
      keyword: "송전선로에서 코로나 현상을 방지하기 위한 가장 효과적인 대책은?",
      answer: "복도체(다도체)를 사용한다.",
    },
    {
      id: 2,
      subject: "전력공학",
      keyword:
        "수전단 전압이 송전단 전압보다 높아지는 페란티 현상의 방지 대책은?",
      answer: "분로 리액터(블로 리액터)를 설치한다.",
    },
    {
      id: 3,
      subject: "전기기기",
      keyword:
        "변압기 철심에 규소강판을 사용하고 '성층'하여 만드는 주된 이유는?",
      answer: "철손(히스테리시스손 및 와류손)을 감소시키기 위해",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = (e) => {
    e.stopPropagation(); // 카드 뒤집기 이벤트 방지
    setIsFlipped(false);
    // 카드가 다시 뒤집히는 애니메이션 시간을 벌어준 뒤 내용 변경
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 150);
  };

  return (
    <div className="mb-10">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            ⚡ 1초 컷 스피드 암기
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">
            자주 출제되는 핵심 기출 키워드를 빠르게 확인하세요.
          </p>
        </div>
        <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
          {currentIndex + 1} / {flashcards.length}
        </span>
      </div>

      <div className="relative w-full h-48 perspective-1000">
        <div
          className="w-full h-full cursor-pointer transition-transform duration-500 transform-style-preserve-3d"
          onClick={handleFlip}
          style={{ transform: isFlipped ? "rotateX(180deg)" : "rotateX(0deg)" }}
        >
          {/* 카드 앞면 (문제) */}
          <div
            className="absolute inset-0 w-full h-full bg-white rounded-2xl shadow-md border border-gray-100 flex flex-col items-center justify-center p-6 text-center backface-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">
              {flashcards[currentIndex].subject} - 문제
            </span>
            <h3 className="text-lg md:text-xl font-bold text-gray-800 break-keep">
              {flashcards[currentIndex].keyword}
            </h3>
            <p className="absolute bottom-4 text-xs text-gray-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">
                touch_app
              </span>
              카드를 터치하여 정답 확인
            </p>
          </div>

          {/* 카드 뒷면 (정답) */}
          <div
            className="absolute inset-0 w-full h-full bg-primary text-white rounded-2xl shadow-lg flex flex-col items-center justify-center p-6 text-center backface-hidden"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateX(180deg)",
            }}
          >
            <span className="text-xs font-bold text-primary-200 mb-3 uppercase tracking-wider">
              정답 키워드
            </span>
            <h3 className="text-xl md:text-2xl font-extrabold break-keep">
              {flashcards[currentIndex].answer}
            </h3>

            <button
              onClick={handleNext}
              className="absolute bottom-4 bg-white/20 hover:bg-white/30 text-white text-sm font-bold py-2 px-6 rounded-full transition-colors backdrop-blur-sm flex items-center gap-2"
            >
              다음 문제
              <ForwardIcon size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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

        if (!response.ok) {
          throw new Error("데이터를 불러오는데 실패했습니다.");
        }

        const markdownText = await response.text();
        const parsedData = extractExamSchedule(markdownText);
        setSchedules(parsedData);
      } catch (error) {
        console.error("시험 일정 파싱 에러:", error);
        setScheduleError("시험 일정을 불러오지 못했습니다.");
      } finally {
        setIsLoadingSchedules(false);
      }
    };

    fetchSchedules();
  }, []);

  return (
    <main className="flex-grow pt-24 pb-12 px-6 max-w-7xl mx-auto w-full font-body">
      {/* Hero Section: Welcome & Progress */}
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
              <button className="bg-gradient-to-b from-primary to-primary-container text-on-primary px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95">
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
          {/* 동적 렌더링된 시험 일정 영역 */}
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

      {/* 하단 컨텐츠 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          {/* ⚡ 추가된 플래시카드 위젯 ⚡ */}
          <FlashCardWidget />

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight">추천 강좌</h2>
            <a
              className="text-primary font-bold text-sm flex items-center gap-1 hover:underline cursor-pointer"
              onClick={() => move("/user/videos")}
            >
              전체 보기
              <ForwardIcon size={16} />
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
