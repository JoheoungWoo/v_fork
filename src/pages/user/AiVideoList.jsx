import { Lock, Play } from "lucide-react";

// 🌟 이전 ID 하위 호환성을 위한 매핑
const ID_MAPPING = {
  "0439b5168355bedd244f2c4cbd79c82f": "8_time_constant",
  "1da7f54684d76e361736580a26e6917c": "207_cho_hw_cheer",
  "201092af306ff8cb381808e4c3f45e0c": "13_vector_dot_product",
  "30d2bd6d1675fb17fe237d8c9d930413": "14_vector_cross_product",
  a778e615bf667e6db830b498baa5ec66: "16_partial_derivative",
  c44dc0cd81fbb02320299a7bff062e4d: "15_derivative",
  e935dc2d2e592a79688c5f40da5fbe23: "9_perfect_square",
};

export default function VideoCard({ video, onRead, onOpenModal }) {
  console.log("video card : ", video);
  // 1. 영상 유무 체크 (시청하기 버튼 활성화용)
  const hasVideo =
    !!video.video_url && video.video_url !== "" && video.video_url !== "null";
  const isLocked = !hasVideo;

  // 2. 썸네일 우선순위: 백엔드에서 준 thumbnail -> thumb_url -> 기본 이미지
  const thumbnailSrc =
    video.thumbnail ||
    video.thumb_url ||
    "https://placehold.co/400x300/e2e8f0/94a3b8?text=No+Image";
  // 정화된 ID 체계 적용 (lecture_id 우선)
  const targetId = video.lecture_id || video.id;
  const normalizedId = ID_MAPPING[targetId] || targetId;

  return (
    <article
      className={`flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100 transition-all duration-300 ${
        isLocked
          ? "opacity-60 grayscale-[0.3]"
          : "shadow-sm hover:shadow-xl group cursor-pointer"
      }`}
      onClick={() => !isLocked && onRead(normalizedId)}
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
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
        <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight line-clamp-2 min-h-[3.5rem]">
          {video.title}
        </h2>
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
                onRead(normalizedId);
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
