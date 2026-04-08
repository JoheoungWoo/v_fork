import { Lock, Play } from "lucide-react";

/**
 * 이전 해시/영문 ID를 직관적인 새 ID로 변환하는 매핑 테이블
 * (하위 호환성 유지용)
 */
const ID_MAPPING = {
  "0439b5168355bedd244f2c4cbd79c82f": "8_time_constant",
  "1da7f54684d76e361736580a26e6917c": "207_cho_hw_cheer",
  "201092af306ff8cb381808e4c3f45e0c": "13_vector_dot_product",
  "30d2bd6d1675fb17fe237d8c9d930413": "14_vector_cross_product",
  a778e615bf667e6db830b498baa5ec66: "16_partial_derivative",
  c44dc0cd81fbb02320299a7bff062e4d: "15_derivative",
  e935dc2d2e592a79688c5f40da5fbe23: "9_perfect_square",
};

/**
 * @param {Object} video - 백엔드에서 가져온 개별 강의 객체
 * @param {Function} onRead - 시청하기 클릭 시 실행될 이동 함수
 * @param {Function} onOpenModal - 상세보기 클릭 시 실행될 모달 오픈 함수
 */
export default function VideoCard({ video, onRead, onOpenModal }) {
  // 1. 영상 유무 체크 (백엔드에서 문자열 video_url로 전달됨)
  const hasVideo =
    !!video.video_url && video.video_url !== "" && video.video_url !== "null";
  const isLocked = !hasVideo;

  // 2. 썸네일 경로 결정
  const thumbnailSrc =
    video.thumbnail ||
    video.thumb_url ||
    "https://placehold.co/400x300/e2e8f0/94a3b8?text=No+Image";

  // 3. ID 정화 (lecture_id가 있으면 우선 사용, 없으면 매핑 테이블 참조)
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

      {/* 정보 텍스트 영역 */}
      <div className="p-8 flex flex-col flex-grow">
        <span
          className={`font-bold text-xs uppercase tracking-widest mb-2 block ${isLocked ? "text-gray-500" : "text-[#0047a5]"}`}
        >
          {video.subject || "전기공학 핵심이론"}
        </span>
        <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight line-clamp-2 min-h-[3.5rem]">
          {video.title}
        </h2>
        <p className="text-gray-500 text-base mb-8 font-medium line-clamp-2">
          {video.description ||
            "해당 강의의 상세 정보를 곧 업데이트할 예정입니다."}
        </p>

        {/* 하단 인터랙션 영역 */}
        <div className="mt-auto flex items-center justify-between">
          <button
            onClick={(e) => {
              e.stopPropagation(); // 카드 전체 클릭 이벤트 방지
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
