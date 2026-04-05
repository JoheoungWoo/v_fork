import useCustomMove from "@/hooks/useCustomMove";
import { Lock, PlayCircle } from "lucide-react";
import { useMemo } from "react";
import { useParams } from "react-router-dom";

// ✅ 데이터 임포트
import {
  circuitLectures,
  emLectures,
  mathLectures,
  visionLectures,
} from "@/constants/videoData";

const ALL_LECTURES = [
  ...mathLectures,
  ...circuitLectures,
  ...emLectures,
  ...visionLectures,
];

export default function VideoPlayList() {
  const { id } = useParams();
  const { moveToRead } = useCustomMove("/user/videos");

  // 1. 현재 보고 있는 영상의 정보를 찾아서 같은 과목(subject)의 영상들만 추출
  const { currentSubjectLectures, currentTitle } = useMemo(() => {
    const currentVideo = ALL_LECTURES.find((v) => v.id === id);
    if (!currentVideo) return { currentSubjectLectures: [], currentTitle: "" };

    const filtered = ALL_LECTURES.filter(
      (v) => v.subject === currentVideo.subject,
    );
    return {
      currentSubjectLectures: filtered,
      currentTitle: currentVideo.subject,
    };
  }, [id]);

  if (currentSubjectLectures.length <= 1) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
      {/* 헤더 영역 */}
      <div className="p-4 bg-gray-50 border-b border-gray-100">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#0047a5] rounded-full"></span>
          {currentTitle} 재생 목록
        </h3>
        <p className="text-[11px] text-gray-500 mt-1">
          총 {currentSubjectLectures.length}개의 강의로 구성되어 있습니다.
        </p>
      </div>

      {/* 리스트 영역 */}
      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {currentSubjectLectures.map((video, index) => {
          const isActive = video.id === id;
          const isLocked = !video.videoUrls || video.videoUrls[0] === "";

          return (
            <div
              key={video.id}
              onClick={() => !isLocked && moveToRead(video.id)}
              className={`group flex items-start gap-3 p-4 transition-all border-b border-gray-50 last:border-0
                ${isActive ? "bg-blue-50/50" : isLocked ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 cursor-pointer"}
              `}
            >
              {/* 인덱스 또는 상태 아이콘 */}
              <div className="mt-0.5 shrink-0">
                {isActive ? (
                  <PlayCircle
                    size={18}
                    className="text-[#0047a5] fill-current bg-white rounded-full"
                  />
                ) : isLocked ? (
                  <Lock size={16} className="text-gray-400" />
                ) : (
                  <span className="text-xs font-bold text-gray-400 group-hover:text-[#0047a5]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                )}
              </div>

              {/* 강의 정보 */}
              <div className="flex-1 min-w-0">
                <h4
                  className={`text-sm font-semibold truncate ${isActive ? "text-[#0047a5]" : "text-gray-700"}`}
                >
                  {video.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-gray-400 font-medium">
                    {video.duration || "00:00"}
                  </span>
                  {isActive && (
                    <span className="text-[10px] bg-[#0047a5] text-white px-1.5 py-0.5 rounded font-bold animate-pulse">
                      PLAYING
                    </span>
                  )}
                </div>
              </div>

              {/* 학습 완료 체크 (나중에 연동 가능) */}
              {!isLocked && !isActive && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <PlayCircle size={16} className="text-gray-300" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
