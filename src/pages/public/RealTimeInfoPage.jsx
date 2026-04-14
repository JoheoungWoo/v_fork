import React, { useState, useEffect } from "react";
// 경로를 프로젝트 환경에 맞게 수정해 주세요.
import ExamScheduleWidget from "@/components/public/ExamScheduleWidget";
import CalendarWidget from "@/components/public/CalendarWidget";
import { COMPANY_NAME } from "@/constants/appConstants";

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

export default function RealTimeInfoPage() {
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
        console.log(parsedData);
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
    <div className="bg-surface text-on-surface min-h-screen selection:bg-primary-fixed selection:text-on-primary-fixed font-body">
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="bg-primary-container rounded-xl p-8 text-on-primary flex flex-col md:flex-row justify-between items-center gap-6 shadow-lg">
            <div className="space-y-2">
              <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                Notice
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight font-headline">
                실시간 정보
              </h1>
              <p className="text-on-primary-container text-lg opacity-90">
                Q-Net의 실시간 정보를 확인하고 학습 계획을 세워보세요.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Calendar & Resources */}
          <div className="lg:col-span-8 space-y-8">
            <CalendarWidget schedules={schedules} />
          </div>

          {/* Right: Sidebar Widgets */}
          <aside className="lg:col-span-4 space-y-8">
            <ExamScheduleWidget
              schedules={schedules}
              isLoading={isLoadingSchedules}
              error={scheduleError}
            />

            {/* Exam Status Quick View */}
            <div className="bg-surface-container rounded-xl p-6">
              <h3 className="font-bold text-on-surface mb-4 font-headline">
                기타 자격증 상태
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-outline-variant/10">
                  <span className="text-sm font-semibold">전기산업기사</span>
                  <span className="bg-primary-fixed text-on-primary-fixed text-[10px] font-extrabold px-2 py-1 rounded">
                    접수중
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-outline-variant/10">
                  <span className="text-sm font-semibold">전기공사기사</span>
                  <span className="bg-surface-variant text-on-surface-variant text-[10px] font-extrabold px-2 py-1 rounded">
                    마감
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
