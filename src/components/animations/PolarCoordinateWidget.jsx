import { useEffect, useRef, useState } from "react";

const PolarCoordinateWidget = () => {
  const [radius, setRadius] = useState(3);
  const [angleDeg, setAngleDeg] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const requestRef = useRef(null);

  // 자동 재생 애니메이션 루프 (requestAnimationFrame 사용으로 부드럽게)
  const animate = () => {
    setAngleDeg((prevAngle) => (prevAngle + 1) % 361);
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying]);

  // --------------------------------------------------------
  // SVG 렌더링용 변수 및 스케일 계산
  // --------------------------------------------------------
  const scale = 25; // 반지름 1 = 25px
  const cx = 150; // 왼쪽 원운동 영역 중심 X
  const cy = 150; // 왼쪽 원운동 영역 중심 Y

  const waveStartX = 350; // 오른쪽 파형 영역 시작 X

  const angleRad = (angleDeg * Math.PI) / 180;
  const currentR = radius * scale;

  // 원 위의 현재 점 좌표 (SVG는 Y축이 아래로 갈수록 +이므로 -sin을 적용)
  const px = cx + currentR * Math.cos(angleRad);
  const py = cy - currentR * Math.sin(angleRad);

  // 0도부터 현재 각도까지의 Sin, Cos 파형 경로(Path) 생성
  const sinPoints = [];
  const cosPoints = [];
  for (let t = 0; t <= angleDeg; t++) {
    const tRad = (t * Math.PI) / 180;
    const x = waveStartX + t;
    const sinY = cy - currentR * Math.sin(tRad);
    const cosY = cy - currentR * Math.cos(tRad); // 코사인 파형
    sinPoints.push(`${x},${sinY}`);
    cosPoints.push(`${x},${cosY}`);
  }

  const sinPath = sinPoints.length > 0 ? `M ${sinPoints.join(" L ")}` : "";
  const cosPath = cosPoints.length > 0 ? `M ${cosPoints.join(" L ")}` : "";

  return (
    <div className="flex flex-col w-full h-full bg-slate-900 text-white p-4 rounded-xl border border-slate-700 shadow-xl">
      {/* 1. 상단 컨트롤 패널 */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 bg-slate-800 p-4 rounded-lg">
        <div className="flex-1 min-w-[200px]">
          <label className="flex justify-between text-sm text-slate-300 mb-1 font-mono">
            <span>반지름 (r)</span>
            <span className="text-sky-400 font-bold">{radius}</span>
          </label>
          <input
            type="range"
            min="1"
            max="5"
            step="0.5"
            value={radius}
            onChange={(e) => setRadius(parseFloat(e.target.value))}
            className="w-full accent-sky-500 cursor-pointer"
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="flex justify-between text-sm text-slate-300 mb-1 font-mono">
            <span>각도 (θ)</span>
            <span className="text-rose-400 font-bold">{angleDeg}°</span>
          </label>
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={angleDeg}
            onChange={(e) => {
              setAngleDeg(parseInt(e.target.value));
              setIsPlaying(false); // 수동 조작시 자동재생 멈춤
            }}
            className="w-full accent-rose-500 cursor-pointer"
          />
        </div>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`px-6 py-2 rounded-md font-bold transition-colors ${
            isPlaying
              ? "bg-red-500 hover:bg-red-600"
              : "bg-emerald-500 hover:bg-emerald-600"
          }`}
        >
          {isPlaying ? "⏸ 일시정지" : "▶ 자동 재생"}
        </button>
      </div>

      {/* 2. 애니메이션 시각화 영역 (순수 SVG) */}
      <div className="flex-1 relative bg-slate-950 rounded-lg overflow-hidden flex flex-col items-center justify-center p-4">
        {/* 상단 수치 정보 */}
        <div className="absolute top-4 left-6 flex space-x-6 font-mono text-sm z-10">
          <div className="text-slate-400">
            직각좌표: (
            <span className="text-emerald-400">
              {(radius * Math.cos(angleRad)).toFixed(2)}
            </span>
            ,
            <span className="text-rose-400">
              {(radius * Math.sin(angleRad)).toFixed(2)}
            </span>
            )
          </div>
          <div className="text-slate-400">
            극좌표: (<span className="text-sky-400">{radius}</span>,
            <span className="text-yellow-400">{angleDeg}°</span>)
          </div>
        </div>

        {/* 메인 SVG 캔버스 */}
        <svg viewBox="0 0 750 300" className="w-full max-w-4xl h-auto">
          {/* 그리드 및 축 (왼쪽 원 영역) */}
          <line
            x1="0"
            y1={cy}
            x2="300"
            y2={cy}
            stroke="#334155"
            strokeWidth="1"
          />
          <line
            x1={cx}
            y1="0"
            x2={cx}
            y2="300"
            stroke="#334155"
            strokeWidth="1"
          />

          {/* 그리드 및 축 (오른쪽 파형 영역) */}
          <line
            x1={waveStartX}
            y1={cy}
            x2={waveStartX + 380}
            y2={cy}
            stroke="#334155"
            strokeWidth="1"
          />
          <line
            x1={waveStartX}
            y1="0"
            x2={waveStartX}
            y2="300"
            stroke="#334155"
            strokeWidth="1"
          />

          {/* 원 그리기 */}
          <circle
            cx={cx}
            cy={cy}
            r={currentR}
            stroke="#475569"
            strokeWidth="2"
            fill="none"
            strokeDasharray="4 4"
          />

          {/* ---------------- 원 안의 벡터 ---------------- */}
          {/* 중심에서 현재 점까지의 선 (반지름 r) */}
          <line
            x1={cx}
            y1={cy}
            x2={px}
            y2={py}
            stroke="#38bdf8"
            strokeWidth="3"
          />
          {/* x축 투영선 (cos) */}
          <line
            x1={cx}
            y1={cy}
            x2={px}
            y2={cy}
            stroke="#34d399"
            strokeWidth="2"
            opacity="0.8"
          />
          {/* y축 투영선 (sin) */}
          <line
            x1={px}
            y1={cy}
            x2={px}
            y2={py}
            stroke="#fb7185"
            strokeWidth="2"
            opacity="0.8"
          />
          {/* 현재 점 표시 */}
          <circle cx={px} cy={py} r="5" fill="#fff" />

          {/* ---------------- 파형 영역 ---------------- */}
          {/* 사인(Sin) 파형 - 빨간색 */}
          {sinPath && (
            <path d={sinPath} stroke="#fb7185" strokeWidth="3" fill="none" />
          )}
          {/* 코사인(Cos) 파형 - 초록색 */}
          {cosPath && (
            <path
              d={cosPath}
              stroke="#34d399"
              strokeWidth="3"
              fill="none"
              opacity="0.6"
            />
          )}

          {/* 현재 값의 끝점들 */}
          {angleDeg > 0 && (
            <>
              {/* 원 위의 Y위치와 파형의 Y위치를 연결하는 점선 (Sin 관계 보여주기) */}
              <line
                x1={px}
                y1={py}
                x2={waveStartX + angleDeg}
                y2={py}
                stroke="#fb7185"
                strokeWidth="1"
                strokeDasharray="5 5"
                opacity="0.6"
              />
              <circle cx={waveStartX + angleDeg} cy={py} r="4" fill="#fb7185" />

              {/* Cos 끝점 */}
              <circle
                cx={waveStartX + angleDeg}
                cy={cy - currentR * Math.cos(angleRad)}
                r="4"
                fill="#34d399"
              />
            </>
          )}

          {/* 텍스트 라벨 */}
          <text x={waveStartX + 365} y={cy - 5} fill="#94a3b8" fontSize="12">
            360°
          </text>
          <text x={waveStartX + 180} y={cy - 5} fill="#94a3b8" fontSize="12">
            180°
          </text>

          {/* 범례 */}
          <text
            x={waveStartX + 20}
            y="30"
            fill="#fb7185"
            fontSize="14"
            fontWeight="bold"
          >
            y = r·sin(θ)
          </text>
          <text
            x={waveStartX + 20}
            y="50"
            fill="#34d399"
            fontSize="14"
            fontWeight="bold"
          >
            x = r·cos(θ)
          </text>
        </svg>
      </div>
    </div>
  );
};

export default PolarCoordinateWidget;
