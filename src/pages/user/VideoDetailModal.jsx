import { X } from "lucide-react";

const ID_MAPPING = {
  "0439b5168355bedd244f2c4cbd79c82f": "8_time_constant",
  "1da7f54684d76e361736580a26e6917c": "207_cho_hw_cheer",
  "201092af306ff8cb381808e4c3f45e0c": "13_vector_dot_product",
  "30d2bd6d1675fb17fe237d8c9d930413": "14_vector_cross_product",
  a778e615bf667e6db830b498baa5ec66: "16_partial_derivative",
  c44dc0cd81fbb02320299a7bff062e4d: "15_derivative",
  e935dc2d2e592a79688c5f40da5fbe23: "9_perfect_square",
};

export default function VideoDetailModal({ video, onClose, onRead }) {
  if (!video) return null;

  const handleStart = () => {
    const targetId = video.lecture_id || video.id;
    onRead(ID_MAPPING[targetId] || targetId);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">
              {video.subject}
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-1">
              {video.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={32} />
          </button>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <p className="text-lg text-gray-700 leading-relaxed">
            {video.description}
          </p>
        </div>

        <button
          onClick={handleStart}
          className="w-full py-4 bg-[#0047a5] text-white text-xl font-bold rounded-xl hover:bg-blue-800 transition-all shadow-lg"
        >
          이 강의 시청하기
        </button>
      </div>
    </div>
  );
}
