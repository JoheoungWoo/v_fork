import { Lock, Play } from "lucide-react";

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
  // Supabase의 video_urls(배열) 또는 video_url 유무 확인
  const hasVideo =
    (video.video_urls &&
      video.video_urls.length > 0 &&
      video.video_urls[0] !== "") ||
    video.video_url;
  const isLocked = !hasVideo;

  // Supabase의 thumb_url 우선 사용
  const thumbnailSrc =
    video.thumb_url ||
    video.thumbnail ||
    "https://placehold.co/400x300/e2e8f0/94a3b8?text=No+Image";

  const targetId = video.lecture_id || video.id;
  const normalizedId = ID_MAPPING[targetId] || targetId;

  return (
    <article
      className={`flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100 transition-all duration-300 ${isLocked ? "opacity-60" : "shadow-sm hover:shadow-xl group cursor-pointer"}`}
      onClick={() => !isLocked && onRead(normalizedId)}
    >
      <div
        className={`relative h-56 ${isLocked ? "bg-gray-200 flex items-center justify-center" : "overflow-hidden bg-gray-100"}`}
      >
        {isLocked ? (
          <Lock className="text-gray-400" size={48} />
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
      <div className="p-8 flex flex-col flex-grow">
        <span className="font-bold text-xs uppercase tracking-widest mb-2 block text-[#0047a5]">
          {video.subject || "전기공학"}
        </span>
        <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight line-clamp-2 min-h-[3.5rem]">
          {video.title}
        </h2>
        <p className="text-gray-500 text-base mb-8 font-medium line-clamp-2">
          {video.description}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal(video);
            }}
            className="text-[#0047a5] font-bold text-lg hover:underline"
          >
            상세보기
          </button>
          {!isLocked && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRead(normalizedId);
              }}
              className="bg-[#e5edff] text-[#0047a5] text-lg px-8 py-3 rounded-xl font-bold hover:bg-[#0047a5] hover:text-white transition-colors"
            >
              시청하기
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
