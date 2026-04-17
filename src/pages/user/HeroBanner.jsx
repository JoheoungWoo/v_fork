import { CATEGORY_DATA } from "./VideoCategoryTabs";

const DEFAULT_DATA = CATEGORY_DATA.전체;

export default function HeroBanner({
  // 기존 형식(요청하신 코드): { currentCategoryData, total }
  currentCategoryData,
  // 현재 호출부 형식(AiVideoList): { category, total }
  category,
  total = 0,
}) {
  const data =
    currentCategoryData ||
    CATEGORY_DATA[category] ||
    CATEGORY_DATA.기타 ||
    DEFAULT_DATA;

  return (
    <div className="bg-[#0047a5] rounded-2xl p-10 md:p-14 mb-10 text-white relative overflow-hidden shadow-lg transition-colors duration-500">
      <div className="absolute right-10 top-1/2 -translate-y-1/2 text-[180px] opacity-10 font-serif font-bold pointer-events-none select-none">
        {data.bgIcon}
      </div>
      <div className="relative z-10 max-w-2xl">
        <h1 className="text-4xl font-extrabold mb-4 font-headline tracking-tight">
          {data.title}
        </h1>
        <p className="text-blue-100 text-lg mb-8 leading-relaxed opacity-90">
          {data.desc}
        </p>
        <div className="flex items-center gap-3">
          <span className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
            총 {total}개의 강의
          </span>
          <span className="bg-[#d7e2ff] text-[#003f87] px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
            인기 코스
          </span>
        </div>
      </div>
    </div>
  );
}
