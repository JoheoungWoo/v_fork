import { Lock } from "lucide-react";

const LockedVideoCard = ({ locked }) => (
  <article className="flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100 opacity-60">
    <div className="relative h-56 bg-gray-200 flex items-center justify-center">
      <Lock className="text-gray-400" size={48} />
      <div className="absolute top-4 left-4 bg-gray-500 text-white px-3 py-1 text-xs font-bold rounded-lg tracking-wider uppercase">
        {locked.category || "STEP"}
      </div>
    </div>
    <div className="p-8 flex flex-col flex-grow">
      <span className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-2 block">
        {locked.subject || "영상 강의"}
      </span>
      <h3 className="text-2xl font-bold text-gray-900 mb-3 leading-tight line-clamp-2 min-h-[3.5rem]">
        {locked.title}
      </h3>
      <p className="text-gray-500 text-base mb-8 font-medium line-clamp-2">
        {locked.description || "준비 중인 강의입니다."}
      </p>
      <div className="mt-auto">
        <button
          disabled
          className="w-full py-3 bg-gray-100 text-gray-400 text-lg font-bold rounded-xl cursor-not-allowed"
        >
          수강 불가 (영상 준비중)
        </button>
      </div>
    </div>
  </article>
);

export default LockedVideoCard;
