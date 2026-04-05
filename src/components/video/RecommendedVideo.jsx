import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import useCustomMove from "@/hooks/useCustomMove";

// ✅ 실제 데이터 임포트
import {
  mathLectures,
  circuitLectures,
  emLectures,
  visionLectures,
} from "@/constants/videoData";

// ✅ 전체 데이터 통합
const ALL_LECTURES = [
  ...mathLectures,
  ...circuitLectures,
  ...emLectures,
  ...visionLectures,
];

/**
 * @param {number} count 추출할 개수
 * @param {string} currentId 현재 시청 중인 강의 ID (제외용)
 */
const getRealRecommendedVideos = (count = 4, currentId) => {
  // 1. 영상 URL이 실제로 존재하는(빈 문자열이 아닌) 강의만 필터링
  const playableVideos = ALL_LECTURES.filter(
    (video) =>
      video.videoUrls &&
      video.videoUrls.length > 0 &&
      video.videoUrls[0] !== "" &&
      video.id !== currentId, // 현재 보고 있는 영상은 추천에서 제외
  );

  // 2. 만약 playable한 영상이 요청한 count보다 적으면 있는 거라도 다 보여줌
  if (playableVideos.length <= count) {
    return playableVideos;
  }

  // 3. 무작위 셔플 후 count만큼 추출
  return playableVideos.sort(() => 0.5 - Math.random()).slice(0, count);
};

export default function RecommendedVideo({ count = 4 }) {
  const { id } = useParams(); // 현재 URL의 id 가져오기
  const { moveToRead } = useCustomMove("/user/videos");

  const recommendedVideos = useMemo(() => {
    return getRealRecommendedVideos(count, id);
  }, [count, id]);

  if (recommendedVideos.length === 0) {
    return (
      <div className="py-10 text-center text-gray-400 border border-dashed rounded-xl">
        추천할 수 있는 다른 강의가 아직 없습니다. 😢
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recommendedVideos.map((video) => (
        <div
          key={video.id}
          className="flex gap-4 bg-white p-3 rounded-xl border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
          onClick={() => moveToRead(video.id)}
        >
          {/* 썸네일 영역 */}
          <div className="w-32 h-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
            <img
              src={
                video.thumbnailTime
                  ? `${video.thumbnail}?time=${video.thumbnailTime}`
                  : video.thumbnail || "https://via.placeholder.com/160x90"
              }
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>

          {/* RecommendedVideo.jsx 정보 영역 부분 */}
          <div className="flex flex-col justify-center overflow-hidden">
            <span className="text-[10px] font-bold text-[#0047a5] uppercase tracking-wider mb-1">
              {video.subject}
            </span>
            <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-[#0047a5] transition-colors">
              {video.title}
            </h4>
            <span className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              {video.duration || "00:00"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
