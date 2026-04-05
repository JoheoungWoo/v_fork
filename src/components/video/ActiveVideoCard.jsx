import { Play } from "lucide-react";

const ActiveVideoCard = ({ video, onRead, onOpenModal }) => {
  let finalThumbnail =
    video.thumbnail ||
    "https://placehold.co/400x300/e2e8f0/94a3b8?text=No+Image";
  if (video.thumbnail && video.thumbnailTime) {
    finalThumbnail = `${video.thumbnail}?time=${video.thumbnailTime}`;
  }

  return (
    <article
      className="flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-100"
      onClick={() => onRead(video.id)}
    >
      <div className="relative h-56 overflow-hidden bg-gray-100">
        <img
          src={finalThumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 bg-[#0047a5] text-white px-3 py-1 rounded-lg font-bold text-sm tracking-wider uppercase">
          {video.category || "STEP"}
        </div>
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform">
            <Play className="text-[#0047a5] fill-current ml-1" size={28} />
          </div>
        </div>
      </div>
      <div className="p-8 flex flex-col flex-grow">
        <span className="text-[#0047a5] font-bold text-xs uppercase tracking-widest mb-2 block">
          {video.subject || "영상 강의"}
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
            className="text-[#0047a5] font-bold text-lg hover:underline underline-offset-4 decoration-2"
          >
            상세보기
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRead(video.id);
            }}
            className="bg-[#e5edff] text-[#0047a5] text-lg px-8 py-3 rounded-xl font-bold shadow-sm hover:bg-[#0047a5] hover:text-white transition-colors"
          >
            시청하기
          </button>
        </div>
      </div>
    </article>
  );
};

export default ActiveVideoCard;
