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
        const raw = res.data;
        const fetchedList = Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw)
            ? raw
            : [];
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

    const idStr = String(currentLectureId ?? "");
    const currentVideo = videoList.find(
      (v) =>
        String(v?.lecture_id ?? "") === idStr || String(v?.id ?? "") === idStr,
    );

    if (!currentVideo) return { currentSubjectLectures: [], currentTitle: "" };

    // ✅ 1. 같은 subject 필터
    const subKey = currentVideo?.subject ?? "";
    const filtered = videoList.filter(
      (v) => (v?.subject ?? "") === subKey,
    );

    const getLectureOrder = (title) => {
      // 1) \b(단어 경계) 제거
      // 2) ^(시작점) 제거: "[기초수학] 1강" 처럼 앞에 글자가 있어도 번호를 찾도록 유연화
      const match = String(title || "").match(/(\d+)\s*강/);
      return match ? parseInt(match[1], 10) : null;
    };

    const getCreatedAtMs = (v) => new Date(v?.created_at || 0).getTime();

    // ✅ 2. title 기준 정렬 (강 번호) + tie-break(업로드일 최신순)
    // 주의: Array.prototype.sort는 in-place이므로 복사본을 정렬합니다.
    const sorted = [...filtered].sort((a, b) => {
      const oa = getLectureOrder(a?.title);
      const ob = getLectureOrder(b?.title);

      // 1) 둘 다 'N강' 번호가 있는 경우 -> 강 번호 오름차순, 같으면 최신 업로드 순
      if (oa !== null && ob !== null) {
        if (oa !== ob) return oa - ob;
        return getCreatedAtMs(b) - getCreatedAtMs(a);
      }

      // 2) 한쪽만 'N강' 번호가 있는 경우 -> 번호가 있는 것을 무조건 앞으로 배치
      if (oa !== null && ob === null) return -1;
      if (oa === null && ob !== null) return 1;

      // 3) 둘 다 번호가 없는 경우 -> 최신 업로드 순
      return getCreatedAtMs(b) - getCreatedAtMs(a);
    });

    return {
      currentSubjectLectures: sorted,
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
  }, [loading, currentLectureId]);

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
          const isActive =
            String(targetId ?? "") === String(currentLectureId ?? "");
          const hasVideo =
            !!video.video_url &&
            video.video_url !== "" &&
            video.video_url !== "null";
          const isLocked = !hasVideo;

          return (
            <div
              key={String(video.lecture_id ?? video.id ?? index)}
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
