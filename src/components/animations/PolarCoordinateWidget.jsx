import { useState } from "react";
// import { Canvas } from '@react-three/fiber'; // 3D 파형을 위해 설치 권장 (npm install @react-three/fiber three)

const PolarCoordinateWidget = () => {
  const [mode, setMode] = useState("2D"); // '2D' (좌표 변환) | '3D' (원운동 & 파형)
  const [radius, setRadius] = useState(3);
  const [angleDeg, setAngleDeg] = useState(45); // 도(degree) 단위

  const angleRad = (angleDeg * Math.PI) / 180;
  const x = (radius * Math.cos(angleRad)).toFixed(2);
  const y = (radius * Math.sin(angleRad)).toFixed(2);

  return (
    <div className="flex flex-col w-full h-full bg-slate-900 text-white p-4 rounded-xl">
      {/* 상단 탭 (모드 선택) */}
      <div className="flex space-x-2 mb-4">
        <button
          className={`px-4 py-2 rounded-md font-bold ${mode === "2D" ? "bg-sky-500" : "bg-slate-700"}`}
          onClick={() => setMode("2D")}
        >
          2D 좌표 변환 (Cartesian ↔ Polar)
        </button>
        <button
          className={`px-4 py-2 rounded-md font-bold ${mode === "3D" ? "bg-rose-500" : "bg-slate-700"}`}
          onClick={() => setMode("3D")}
        >
          3D 원운동 및 파형 (Sin/Cos)
        </button>
      </div>

      {/* 컨트롤 패널 */}
      <div className="grid grid-cols-2 gap-4 mb-4 bg-slate-800 p-4 rounded-lg">
        <div>
          <label className="block text-sm text-slate-400 mb-1">
            반지름 (r): {radius}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={radius}
            onChange={(e) => setRadius(parseFloat(e.target.value))}
            className="w-full accent-sky-500"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">
            각도 (θ): {angleDeg}°
          </label>
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={angleDeg}
            onChange={(e) => setAngleDeg(parseInt(e.target.value))}
            className="w-full accent-rose-500"
          />
        </div>
      </div>

      {/* 시각화 영역 */}
      <div className="flex-1 relative bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center border border-slate-700">
        {mode === "2D" ? (
          // 2D 캔버스 또는 단순 SVG 영역
          <div className="text-center">
            <h3 className="text-xl font-mono text-sky-400 mb-4">
              극좌표 (r, θ):{" "}
              <span className="text-white">
                ({radius}, {angleDeg}°)
              </span>
            </h3>
            <h3 className="text-xl font-mono text-rose-400 mb-4">
              직각좌표 (x, y):{" "}
              <span className="text-white">
                ({x}, {y})
              </span>
            </h3>
            {/* 이곳에 SVG로 x, y축과 벡터를 그립니다 */}
            <div className="text-slate-500 mt-10 text-sm">
              SVG Vector Graphic Area (r={radius}, θ={angleDeg}°)
            </div>
          </div>
        ) : (
          // 3D 캔버스 영역 (@react-three/fiber 사용 추천)
          <div className="w-full h-full flex flex-col items-center justify-center">
            {/* <Canvas>
                  <ambientLight />
                  <pointLight position={[10, 10, 10]} />
                  // 1. Z축을 시간(t)으로 두고, X=cos(t), Y=sin(t) 곡선을 그리는 Line 
                  // 2. 현재 각도에 위치한 Vector 화살표
                </Canvas> 
             */}
            <div className="text-slate-500 text-sm">3D Three.js Scene Area</div>
            <div className="text-slate-400 text-xs mt-2">
              (Z축 방향으로 전진하며 회전하는 벡터가 그리는 나선형 Sin/Cos 파형
              렌더링)
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PolarCoordinateWidget;
