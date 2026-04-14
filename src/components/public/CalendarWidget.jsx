import React, { useState, useMemo } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

// 날짜 파싱 함수
const extractDateRange = (str) => {
  if (!str) return null;
  const rangeMatch = str.match(
    /(\d{4}\.\d{2}\.\d{2})\s*~\s*(\d{4}\.\d{2}\.\d{2})/,
  );
  if (rangeMatch)
    return {
      start: rangeMatch[1].replaceAll(".", "-"),
      end: rangeMatch[2].replaceAll(".", "-"),
    };
  const singleMatch = str.match(/(\d{4}\.\d{2}\.\d{2})/);
  if (singleMatch)
    return {
      start: singleMatch[1].replaceAll(".", "-"),
      end: singleMatch[1].replaceAll(".", "-"),
    };
  return null;
};

export default function CalendarWidget({ schedules = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // 1. 일정 데이터 가공 및 정렬
  const parsedEvents = useMemo(() => {
    const events = [];
    schedules.forEach((sched) => {
      const types = [
        { key: "필기원서접수", type: "written_reg", suffix: "필기접수" },
        { key: "필기시험", type: "written_exam", suffix: "필기시험" },
        { key: "실기원서접수", type: "practical_reg", suffix: "실기접수" },
        { key: "실기시험", type: "practical_exam", suffix: "실기시험" },
        { key: "최종합격자발표일", type: "result", suffix: "발표" },
      ];
      types.forEach((t) => {
        const range = extractDateRange(sched[t.key]);
        if (range)
          events.push({
            id: `${sched.구분}-${t.type}`,
            name: `${sched.구분} ${t.suffix}`,
            ...range,
            type: t.type,
          });
      });
    });
    return events.sort(
      (a, b) => a.start.localeCompare(b.start) || b.end.localeCompare(a.end),
    );
  }, [schedules]);

  // 2. 겹침 방지 Row 배치 (세로 슬롯 결정)
  const eventsWithRows = useMemo(() => {
    const rowsEndDates = [];
    return parsedEvents.map((event) => {
      let assignedRow = -1;
      for (let i = 0; i < rowsEndDates.length; i++) {
        if (rowsEndDates[i] < event.start) {
          assignedRow = i;
          rowsEndDates[i] = event.end;
          break;
        }
      }
      if (assignedRow === -1) {
        assignedRow = rowsEndDates.length;
        rowsEndDates.push(event.end);
      }
      return { ...event, row: assignedRow };
    });
  }, [parsedEvents]);

  const MAX_VISIBLE_ROWS = 3;

  const getEventsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return eventsWithRows.filter((e) => dateStr >= e.start && dateStr <= e.end);
  };

  const getEventStyle = (type) => {
    switch (type) {
      case "written_reg":
        return "bg-[#004491] text-white";
      case "written_exam":
        return "bg-[#722b00] text-white";
      case "practical_reg":
        return "bg-[#007a33] text-white";
      case "practical_exam":
        return "bg-[#d9534f] text-white";
      case "result":
        return "bg-[#424752] text-white";
      default:
        return "bg-slate-500 text-white";
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 md:p-8 shadow-sm border border-slate-200 overflow-visible">
      {/* 연/월 헤더 */}
      <div className="flex justify-between items-center mb-8 px-2">
        <h2 className="text-[24px] md:text-[28px] font-black text-[#041b3c]">
          {year}년 {month + 1}월
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeftIcon size={20} />
          </button>
          <button
            onClick={handleNextMonth}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            <ArrowRightIcon size={20} />
          </button>
        </div>
      </div>

      {/* 캘린더 그리드 */}
      <div
        className="grid grid-cols-7 border-t border-l border-slate-300"
        style={{ overflow: "visible" }}
      >
        {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
          <div
            key={d}
            className={`h-12 md:h-14 flex items-center justify-center border-r border-b border-slate-300 bg-slate-50 font-bold text-sm md:text-lg ${i === 0 ? "text-red-600" : i === 6 ? "text-blue-600" : "text-slate-700"}`}
          >
            {d}
          </div>
        ))}

        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="min-h-[120px] md:min-h-[150px] border-r border-b border-slate-300 bg-slate-50/30"
          />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayEvents = getEventsForDay(day);
          const dayOfWeek = new Date(year, month, day).getDay();

          return (
            <div
              key={day}
              className="min-h-[120px] md:min-h-[150px] border-r border-b border-slate-300 flex flex-col bg-white relative"
              // ★★★ 핵심 해결책: 앞 날짜의 칸이 뒷 날짜의 칸보다 무조건 위(Top)로 오도록 z-index를 역순으로 부여합니다.
              style={{ overflow: "visible", zIndex: 100 - day }}
            >
              <div
                className={`text-lg md:text-[22px] font-black p-2 md:p-3 ${dayOfWeek === 0 ? "text-red-600" : dayOfWeek === 6 ? "text-blue-600" : "text-[#041b3c]"}`}
              >
                {day}
              </div>

              <div
                className="flex flex-col gap-[3px] mt-1 w-full relative"
                style={{ overflow: "visible" }}
              >
                {[...Array(MAX_VISIBLE_ROWS)].map((_, slot) => {
                  const event = dayEvents.find((e) => e.row === slot);
                  if (!event)
                    return <div key={slot} className="h-[24px] md:h-[28px]" />;

                  const isStart = event.start === dateStr;
                  const isEnd = event.end === dateStr;
                  const showText = isStart || dayOfWeek === 0;

                  return (
                    <div
                      key={`${event.id}-${day}`}
                      className={`h-[24px] md:h-[28px] flex items-center transition-all ${getEventStyle(event.type)} 
                        ${isStart && isEnd ? "mx-1 rounded-md" : isStart ? "ml-1 rounded-l-md -mr-[1px]" : isEnd ? "mr-1 rounded-r-md -ml-[1px]" : "-mx-[1px]"}`}
                      style={{ position: "relative" }}
                    >
                      {showText && (
                        <span
                          className="text-[10px] md:text-[12px] font-bold px-2 whitespace-nowrap block absolute left-0"
                          style={{
                            width: "max-content",
                            pointerEvents: "none",
                          }}
                        >
                          {event.name}
                        </span>
                      )}
                    </div>
                  );
                })}
                {dayEvents.length > MAX_VISIBLE_ROWS && (
                  <div className="text-[11px] font-black text-slate-400 pl-2">
                    +{dayEvents.length - MAX_VISIBLE_ROWS}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
