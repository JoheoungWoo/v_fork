import apiClient from "@/api/core/apiClient";
import useCustomMove from "@/hooks/useCustomMove";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
// 🌟 useParams는 더 이상 필요 없으므로 제거했습니다.

export default function RecommendedVideo({ count = 4, currentLectureId }) {
  const { moveToRead } = useCustomMove("/user/videos");

  const [allLectures, setAllLectures] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. 백엔드에서 모든 강의 리스트를 가져옵니다.
  useEffect(() => {
    const fetchAllLectures = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get("/api/video/list/all");
        const raw = res.data;
        const list = Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw)
            ? raw
            : [];
        setAllLectures(list);
      } catch (error) {
        console.error("추천 영상을 위한 리스트 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllLectures();
  }, []);

  // 2. 가져온 데이터 중 현재 영상을 제외하고 랜덤하게 추출합니다.
  const recommendedVideos = useMemo(() => {
    // 만약 allLectures가 배열이 아니면 에러 방지를 위해 빈 배열 반환
    if (!Array.isArray(allLectures) || allLectures.length === 0) return [];

    // 영상 URL이 있고 현재 보고 있는 영상이 아닌 것 필터링
    const cur =
      currentLectureId != null && currentLectureId !== ""
        ? String(currentLectureId)
        : null;

    const playableVideos = allLectures.filter((video) => {
      const hasUrl =
        !!(video.video_url &&
          video.video_url !== "" &&
          video.video_url !== "null") ||
        !!(video.videoUrls && video.videoUrls[0]);
      if (!hasUrl) return false;
      if (cur == null) return true;
      const sameAsCurrent =
        String(video.lecture_id ?? "") === cur ||
        String(video.id ?? "") === cur;
      return !sameAsCurrent;
    });

    // 무작위 셔플 후 count만큼 추출
    return [...playableVideos].sort(() => 0.5 - Math.random()).slice(0, count);
  }, [allLectures, currentLectureId, count]); // 🌟 의존성 배열도 변경

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin text-gray-300" size={32} />
      </div>
    );
  }

  if (recommendedVideos.length === 0) {
    return (
      <div className="py-10 text-center text-gray-400 border border-dashed rounded-xl">
        추천할 수 있는 다른 강의가 아직 없습니다. 😢
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-slate-800 mb-2 px-1">
        📺 함께 보면 좋은 강의
      </h3>
      {recommendedVideos.map((video, index) => {
        // 🌟 ID 우선순위: lecture_id가 있으면 그것을 사용 (없으면 기본 id)
        const targetId = video.lecture_id || video.id;

        return (
          <div
            key={String(video.lecture_id ?? video.id ?? `rec-${index}`)}
            className="flex gap-4 bg-white p-3 rounded-xl border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
            onClick={() => moveToRead(targetId)}
          >
            {/* 썸네일 영역 */}
            <div className="w-32 h-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
              <img
                src={video.thumbnail || "https://via.placeholder.com/160x90"}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>

            {/* 정보 영역 */}
            <div className="flex flex-col justify-center overflow-hidden">
              <span className="text-[10px] font-bold text-[#0047a5] uppercase tracking-wider mb-1">
                {video.subject}
              </span>
              <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-[#0047a5] transition-colors">
                {video.title}
              </h4>
              <span className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                {video.duration || "10:00"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
