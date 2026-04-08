const HeroBanner = ({ currentCategoryData, total }) => (
  <div className="bg-[#0047a5] rounded-2xl p-10 md:p-14 mb-10 text-white relative overflow-hidden shadow-lg transition-colors duration-500">
    <div className="absolute right-10 top-1/2 -translate-y-1/2 text-[180px] opacity-10 font-serif font-bold pointer-events-none select-none">
      {currentCategoryData.bgIcon}
    </div>
    <div className="relative z-10 max-w-2xl">
      <h1 className="text-4xl font-extrabold mb-4 font-headline tracking-tight">
        {currentCategoryData.title}
      </h1>
      <p className="text-blue-100 text-lg mb-8 leading-relaxed opacity-90">
        {currentCategoryData.desc}
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

export default HeroBanner;
