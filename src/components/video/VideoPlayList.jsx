import apiClient from "@/api/core/apiClient";
import useCustomMove from "@/hooks/useCustomMove";
import { Loader2, Lock, PlayCircle } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";

export default function VideoPlayList({ currentLectureId }) {
  const { moveToRead } = useCustomMove("/user/videos");

  const [loading, setLoading] = useState(true);
  const [videoList, setVideoList] = useState([]);

  // 1. 타겟을 잡기 위한 ref
  const activeItemRef = useRef(null);

  useEffect(() => {
    const fetchList = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get("/api/video/list/all");
        const fetchedList = res.data?.data || [];
        setVideoList(fetchedList);
      } catch (error) {
        console.error("목록 가져오기 실패", error);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, []);

  const { currentSubjectLectures, currentTitle } = useMemo(() => {
    if (videoList.length === 0 || !currentLectureId)
      return { currentSubjectLectures: [], currentTitle: "" };
    const currentVideo = videoList.find(
      (v) => v.lecture_id === currentLectureId,
    );
    if (!currentVideo) return { currentSubjectLectures: [], currentTitle: "" };

    const filtered = videoList
      .filter((v) => v.subject === currentVideo.subject)
      .sort(
        (a, b) =>
          (parseInt(a.lecture_id) || 9999) - (parseInt(b.lecture_id) || 9999),
      );

    return {
      currentSubjectLectures: filtered,
      currentTitle: currentVideo.subject,
    };
  }, [videoList, currentLectureId]);

  // 🔥 스크롤 이동 로직: 로딩이 끝나는 시점에 딱 한 번만 중앙으로 부드럽게 이동!
  useEffect(() => {
    if (!loading && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: "auto",
        block: "center",
      });
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="flex justify-center p-8 bg-white rounded-xl border">
        <Loader2 className="animate-spin text-[#0047a5]" size={24} />
      </div>
    );
  }

  if (currentSubjectLectures.length <= 1) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
      {/* 헤더 영역 (기존 복구 완료) */}
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
          const targetId = video.lecture_id || video.id;
          const isActive = targetId === currentLectureId;
          const isLocked =
            !video.video_url && (!video.videoUrls || video.videoUrls[0] === "");

          return (
            <div
              key={video.id}
              ref={isActive ? activeItemRef : null} // 🔥 명찰 달아주기
              onClick={() => !isLocked && moveToRead(targetId)}
              className={`group flex items-start gap-3 p-4 transition-all border-b border-gray-50 last:border-0
                ${isActive ? "bg-blue-50/50" : isLocked ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 cursor-pointer"}
              `}
            >
              {/* 상태 아이콘 (기존 복구 완료: 자물쇠 등) */}
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

              {/* 강의 정보 (기존 복구 완료: duration, PLAYING 뱃지) */}
              <div className="flex-1 min-w-0">
                <h4
                  className={`text-sm font-semibold truncate ${isActive ? "text-[#0047a5]" : "text-gray-700"}`}
                >
                  {video.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-gray-400 font-medium">
                    {video.duration || "10:00"}
                  </span>
                  {isActive && (
                    <span className="text-[10px] bg-[#0047a5] text-white px-1.5 py-0.5 rounded font-bold animate-pulse">
                      PLAYING
                    </span>
                  )}
                </div>
              </div>

              {/* hover 시 나타나는 플레이 아이콘 (기존 복구 완료) */}
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
