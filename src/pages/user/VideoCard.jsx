import { getVideoCatalogSubtitle, getVideoHeadline } from "@/utils/videoHeadings";
import { Lock, Play } from "lucide-react";

export default function VideoCard({ video, onRead, onOpenModal }) {
  // 1. 영상 유무 체크
  const hasVideo =
    !!video.video_url && video.video_url !== "" && video.video_url !== "null";
  const isLocked = !hasVideo;

  // 2. 썸네일 로직 초간단화 (있으면 쓰고, 없으면 기본 이미지)
  const defaultImage =
    "https://placehold.co/400x300/e2e8f0/94a3b8?text=No+Image";
  const thumbnailSrc = video.thumbnail ? video.thumbnail : defaultImage;

  // 🌟 3. 호환성 매핑 완벽 제거! 백엔드에서 주는 lecture_id 바로 사용 (없으면 id 사용)
  const targetId = video.lecture_id || video.id;
  const headline = getVideoHeadline(video);
  const catalogSubtitle = getVideoCatalogSubtitle(video);

  return (
    <article
      className={`flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100 transition-all duration-300 ${
        isLocked
          ? "opacity-60 grayscale-[0.3]"
          : "shadow-sm hover:shadow-xl group cursor-pointer"
      }`}
      onClick={() => !isLocked && onRead(targetId)}
    >
      {/* 썸네일 영역 */}
      <div
        className={`relative h-56 ${
          isLocked
            ? "bg-gray-200 flex items-center justify-center"
            : "overflow-hidden bg-gray-100"
        }`}
      >
        {isLocked ? (
          <div className="flex flex-col items-center gap-2">
            <Lock className="text-gray-400" size={48} />
            <span className="text-sm font-bold text-gray-400">
              준비 중인 강의
            </span>
          </div>
        ) : (
          <>
            <img
              src={thumbnailSrc}
              alt={headline}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.src =
                  "https://placehold.co/400x300/e2e8f0/94a3b8?text=Image+Error";
              }}
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                <Play className="text-[#0047a5] fill-current ml-1" size={28} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* 텍스트 영역 */}
      <div className="p-8 flex flex-col flex-grow">
        <span className="font-bold text-xs uppercase tracking-widest mb-2 block text-[#0047a5]">
          {video.subject || "전기공학 핵심"}
        </span>
        <h2
          className={`text-2xl font-bold text-gray-900 leading-tight line-clamp-2 min-h-[3.5rem] ${
            catalogSubtitle ? "mb-1" : "mb-3"
          }`}
        >
          {headline}
        </h2>
        {catalogSubtitle && (
          <p className="text-sm text-slate-500 font-medium mb-3 line-clamp-1">
            {catalogSubtitle}
          </p>
        )}
        <p className="text-gray-500 text-base mb-8 font-medium line-clamp-2">
          {video.description ||
            "해당 강의의 상세 정보를 곧 업데이트할 예정입니다."}
        </p>

        {/* 버튼 영역 */}
        <div className="mt-auto flex items-center justify-between">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal(video);
            }}
            className="text-[#0047a5] font-bold text-lg hover:underline underline-offset-4 decoration-2"
          >
            상세보기
          </button>
          {!isLocked && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRead(targetId);
              }}
              className="bg-[#e5edff] text-[#0047a5] text-lg px-8 py-3 rounded-xl font-bold hover:bg-[#0047a5] hover:text-white transition-all shadow-sm active:scale-95"
            >
              시청하기
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
