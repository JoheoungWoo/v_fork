import { X } from "lucide-react";

const DetailModal = ({ selectedVideo, onClose, onRead }) => {
  if (!selectedVideo) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 border-b border-gray-100 flex justify-between items-start shrink-0">
          <div>
            <div className="bg-[#e5edff] text-[#0047a5] px-3 py-1 rounded text-xs font-bold uppercase tracking-widest mb-3 inline-block">
              강의 상세 안내
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">
              {selectedVideo.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors p-2 -mr-2"
          >
            <X size={32} />
          </button>
        </div>
        <div className="p-8 overflow-y-auto">
          <div className="space-y-8">
            <p className="text-xl text-gray-600 leading-relaxed font-medium">
              {selectedVideo.description}
            </p>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h4 className="text-base font-bold text-[#0047a5] uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
                강의 정보
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-lg">카테고리</span>
                  <span className="text-gray-900 font-bold text-lg">
                    {selectedVideo.category || "미분류"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-lg">과목명</span>
                  <span className="text-gray-900 font-bold text-lg">
                    {selectedVideo.subject || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-8 bg-gray-50 flex flex-col gap-4 shrink-0 rounded-b-2xl border-t border-gray-100">
          <button
            onClick={() => {
              onClose();
              onRead(selectedVideo.id);
            }}
            className="w-full py-5 bg-[#0047a5] text-white text-xl font-extrabold rounded-xl shadow-lg hover:bg-blue-800 transition-colors"
          >
            지금 바로 학습 시작하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
