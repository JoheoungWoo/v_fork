import { Box, ExternalLink, Magnet } from "lucide-react";

const CoulombsLawLauncher = () => {
  const handleLaunch = () => {
    // 💡 새 탭에서 3D 시뮬레이션 페이지 열기 (경로는 프로젝트 라우팅에 맞게 수정하세요)
    window.open("/simulations/coulombs-law", "_blank");
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 rounded-xl shadow-2xl p-10 font-sans min-h-[500px] relative overflow-hidden">
      {/* 배경 장식 효과 */}
      <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-[-50px] right-[-50px] w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="bg-slate-800 p-6 rounded-full border border-slate-700 shadow-lg mb-8">
          <Box size={80} className="text-blue-400" strokeWidth={1.5} />
        </div>

        <h3 className="text-3xl font-extrabold text-white mb-4 tracking-tight">
          쿨롱의 법칙 3D 웹 시뮬레이터
        </h3>

        <p className="text-slate-300 text-lg mb-10 max-w-lg leading-relaxed">
          이 실습은 고성능 3D 그래픽(WebGL) 환경을 사용합니다. 수강생 여러분이
          더욱 넓고 쾌적한 화면에서 전하 공간을 360도로 회전하며 탐색할 수
          있도록 <strong className="text-white">전용 3D 스튜디오</strong>로
          이동합니다.
        </p>

        <button
          onClick={handleLaunch}
          className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-10 py-5 rounded-full font-bold text-xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
        >
          <Magnet className="group-hover:rotate-12 transition-transform" />
          3D 스튜디오 입장하기
          <ExternalLink size={20} className="ml-2 opacity-80" />
        </button>
      </div>
    </div>
  );
};

export default CoulombsLawLauncher;
