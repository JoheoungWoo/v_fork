import React, { useState, useMemo } from "react";
import Plot from "react-plotly.js";

// ==========================================
// 💡 다중적분(단면적 및 전체 부피) 통합 시각화 위젯
// ==========================================
export default function Integral3DWidget() {
  // 현재 활성화된 탭 ('plane' 또는 'volume')
  const [activeTab, setActiveTab] = useState("volume");

  // --- 1) 단면 탭용 상태 ---
  const [sliceAxis, setSliceAxis] = useState("y");
  const [slicePos, setSlicePos] = useState(0);

  // --- 2) 부피 탭용 상태 (신규: X, Y 범위 조절) ---
  const [xLimit, setXLimit] = useState(3.0);
  const [yLimit, setYLimit] = useState(3.0);
  const [numDivisions, setNumDivisions] = useState(15); // 리만 합 영역 분할 수

  // 공통 함수 f(x, y) = 15 - x²/2 - y²/2
  const A = 15,
    B = 0.5,
    C = 0.5;
  const func = (x, y) => A - B * (x * x) - C * (y * y);

  // 곡면(Surface)을 그릴 넉넉한 고정 배경 범위 [-4, 4]
  const kSurface = 4.0;

  // 1. 공통: 3D 반투명 곡면(Surface) 데이터 생성
  const surfaceData = useMemo(() => {
    const xVals = [];
    const yVals = [];
    const zVals = [];
    for (let i = -kSurface; i <= kSurface; i += 0.2) {
      xVals.push(i);
      yVals.push(i);
      const zRow = [];
      for (let j = -kSurface; j <= kSurface; j += 0.2) {
        // 배경 곡면이 바닥(z=0)을 뚫고 내려가지 않게 최대 0으로 처리
        zRow.push(Math.max(func(j, i), 0));
      }
      zVals.push(zRow);
    }
    return { x: xVals, y: yVals, z: zVals };
  }, []);

  // ====================================================
  // 📝 탭별 렌더링 데이터 정의
  // ====================================================

  // --- 💡 [탭 1] 단면 및 면적 시각화 데이터 ---
  const planeTraces = useMemo(() => {
    const c = parseFloat(slicePos);
    const px = [];
    const py = [];
    const pz = [];

    if (sliceAxis === "y") {
      // y = c 평면 (X축으로 적분)
      for (let x = kSurface; x >= -kSurface; x -= 0.5) {
        px.push(x);
        py.push(c);
        pz.push(0);
      }
      for (let x = -kSurface; x <= kSurface; x += 0.1) {
        px.push(x);
        py.push(c);
        pz.push(Math.max(func(x, c), 0));
      }
      px.push(kSurface);
      py.push(c);
      pz.push(0);
    } else {
      // x = c 평면 (Y축으로 적분)
      for (let y = kSurface; y >= -kSurface; y -= 0.5) {
        px.push(c);
        py.push(y);
        pz.push(0);
      }
      for (let y = -kSurface; y <= kSurface; y += 0.1) {
        px.push(c);
        py.push(y);
        pz.push(Math.max(func(c, y), 0));
      }
      px.push(c);
      py.push(kSurface);
      pz.push(0);
    }

    return [
      {
        type: "scatter3d",
        mode: "lines",
        x: px,
        y: py,
        z: pz,
        line: { color: "#ef4444", width: 6 },
        name: "단면 곡선",
      },
      {
        type: "scatter3d",
        mode: "lines",
        x: px,
        y: py,
        z: pz,
        surfaceaxis: sliceAxis === "y" ? 1 : 0,
        surfacecolor: "rgba(59, 130, 246, 0.6)",
        line: { color: "transparent" },
        name: "적분 면적",
      },
    ];
  }, [sliceAxis, slicePos]);

  // 단면적 계산 (z값이 음수가 되지 않는 범위에서)
  const calculatedArea = (81 - 3 * Math.pow(slicePos, 2)).toFixed(2);

  // --- 💡 [탭 2] 전체 부피 시각화 데이터 (리만 합 시뮬레이션) ---
  const volumeTraces = useMemo(() => {
    const traces = [];
    const n = parseInt(numDivisions);
    const X = parseFloat(xLimit);
    const Y = parseFloat(yLimit);

    const dX = (2 * X) / n; // X축 분할 폭
    const dY = (2 * Y) / n; // Y축 분할 폭

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        // 각 육면체의 중앙 좌표
        const x_c = -X + dX * (i + 0.5);
        const y_c = -Y + dY * (j + 0.5);
        const z_top = func(x_c, y_c);

        if (z_top <= 0) continue;

        // 투명도와 두께 조절로 '기둥' 형태를 렌더링
        traces.push({
          type: "scatter3d",
          mode: "lines",
          x: [x_c, x_c],
          y: [y_c, y_c],
          z: [0, z_top],
          line: {
            color: "rgba(14, 165, 233, 0.6)", // 스카이블루 반투명
            width: Math.max(3, 30 - n), // 분할 수가 많을수록 얇게
          },
          showlegend: false,
          hoverinfo: "none",
        });
      }
    }
    return traces;
  }, [numDivisions, xLimit, yLimit]);

  // 부피 계산식
  const X = parseFloat(xLimit);
  const Y = parseFloat(yLimit);
  const n = parseInt(numDivisions);

  // 1) 실제 이중적분 값
  // ∫_{-X}^{X} ∫_{-Y}^{Y} (15 - x²/2 - y²/2) dy dx
  // = 60XY - (2/3)XY(X² + Y²)
  const exactVolume = (60 * X * Y - (2 / 3) * X * Y * (X * X + Y * Y)).toFixed(
    2,
  );

  // 2) 리만 합(근사값) 계산
  let approximateVolume = 0;
  const dX = (2 * X) / n;
  const dY = (2 * Y) / n;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const x_c = -X + dX * (i + 0.5);
      const y_c = -Y + dY * (j + 0.5);
      const z_top = func(x_c, y_c);
      if (z_top > 0) {
        approximateVolume += z_top * dX * dY;
      }
    }
  }

  // Plotly 데이터 통합
  const data = [
    {
      type: "surface",
      x: surfaceData.x,
      y: surfaceData.y,
      z: surfaceData.z,
      colorscale: "Viridis",
      opacity: 0.15, // 기둥이 보이도록 투명하게
      showscale: false,
      hoverinfo: "none",
    },
    ...(activeTab === "plane" ? planeTraces : volumeTraces),
  ];

  return (
    <div className="flex flex-col h-full animate-fade-in bg-slate-50 p-6 rounded-2xl">
      {/* 상단 탭 컨트롤 */}
      <div className="flex justify-center mb-8 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("plane")}
          className={`px-10 py-4 font-black text-lg flex items-center gap-3 transition-all ${
            activeTab === "plane"
              ? "text-blue-700 border-b-4 border-blue-700"
              : "text-slate-500 hover:text-blue-600 border-b-4 border-transparent"
          }`}
        >
          📊 단면의 면적 (1중 적분)
        </button>
        <button
          onClick={() => setActiveTab("volume")}
          className={`px-10 py-4 font-black text-lg flex items-center gap-3 transition-all ${
            activeTab === "volume"
              ? "text-blue-700 border-b-4 border-blue-700"
              : "text-slate-500 hover:text-blue-600 border-b-4 border-transparent"
          }`}
        >
          🧊 전체 부피 (2중 적분)
        </button>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-slate-800 flex items-center justify-center gap-2">
          {activeTab === "plane"
            ? "📊 평면 절단과 면적"
            : "🧊 적분 구간에 따른 3D 부피"}
        </h2>
        <p className="text-slate-500 font-medium mt-2">
          f(x, y) = 15 - x²/2 - y²/2 곡면 내부의 공간을 시각화합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* 좌측 UI 컨트롤 패널 */}
        <div className="lg:col-span-4 flex flex-col gap-6 bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-y-auto">
          {/* --- [탭 1] 단면용 컨트롤 --- */}
          {activeTab === "plane" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-700 mb-3">
                  1. 절단 방향 선택
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSliceAxis("y")}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${sliceAxis === "y" ? "bg-blue-600 text-white shadow-md" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                  >
                    y = c 평면
                    <br />
                    <span className="text-xs font-medium">∫f(x,c)dx</span>
                  </button>
                  <button
                    onClick={() => setSliceAxis("x")}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${sliceAxis === "x" ? "bg-rose-500 text-white shadow-md" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                  >
                    x = c 평면
                    <br />
                    <span className="text-xs font-medium">∫f(c,y)dy</span>
                  </button>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-slate-700 mb-3">
                  2. 절단 위치 (c = {slicePos})
                </h3>
                <input
                  type="range"
                  min="-3.8"
                  max="3.8"
                  step="0.1"
                  value={slicePos}
                  onChange={(e) => setSlicePos(e.target.value)}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs font-bold text-slate-400 mt-2">
                  <span>-3.8</span>
                  <span>0</span>
                  <span>3.8</span>
                </div>
              </div>
              <div className="mt-auto bg-slate-50 p-5 rounded-2xl border border-slate-100 text-center">
                <p className="text-slate-500 font-bold mb-2 tracking-tight">
                  계산된 단면적 (A)
                </p>
                <p className="text-4xl font-black text-blue-700 drop-shadow-sm">
                  {calculatedArea}
                </p>
              </div>
            </div>
          )}

          {/* --- [탭 2] 부피용 컨트롤 --- */}
          {activeTab === "volume" && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-slate-700 mb-2">
                  1. X축 적분 범위 ([-{xLimit}, {xLimit}])
                </h3>
                <input
                  type="range"
                  min="0.5"
                  max="3.8"
                  step="0.1"
                  value={xLimit}
                  onChange={(e) => setXLimit(e.target.value)}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <h3 className="font-bold text-slate-700 mb-2">
                  2. Y축 적분 범위 ([-{yLimit}, {yLimit}])
                </h3>
                <input
                  type="range"
                  min="0.5"
                  max="3.8"
                  step="0.1"
                  value={yLimit}
                  onChange={(e) => setYLimit(e.target.value)}
                  className="w-full accent-rose-500"
                />
              </div>

              <div>
                <h3 className="font-bold text-slate-700 mb-2">
                  3. 분할 정밀도 (N = {numDivisions})
                </h3>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={numDivisions}
                  onChange={(e) => setNumDivisions(e.target.value)}
                  className="w-full accent-emerald-500"
                />
                <p className="text-xs text-slate-500 mt-2 leading-relaxed bg-slate-100 p-2 rounded-lg">
                  💡 N값이 커질수록(기둥이 얇아질수록) 리만 합이 실제 이중적분
                  값에 근접합니다.
                </p>
              </div>

              <div className="pt-4 mt-auto space-y-3 border-t border-slate-100">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center flex justify-between items-center">
                  <div className="text-left">
                    <p className="text-slate-700 font-bold text-sm tracking-tight">
                      리만 합 근사값
                    </p>
                    <p className="text-xs font-medium text-slate-400 mt-1">
                      Σ f(x,y) ΔA
                    </p>
                  </div>
                  <p className="text-2xl font-black text-slate-700 drop-shadow-sm">
                    {approximateVolume.toFixed(2)}
                  </p>
                </div>
                <div className="bg-blue-700 p-4 rounded-2xl text-white shadow-lg flex justify-between items-center">
                  <div className="text-left">
                    <p className="text-blue-100 text-sm font-bold tracking-tight">
                      실제 이중적분
                    </p>
                    <p className="text-xs font-medium text-blue-300 mt-1">
                      ∬ f(x, y) dA
                    </p>
                  </div>
                  <p className="text-3xl font-black">{exactVolume}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 우측 3D 그래프 렌더링 영역 */}
        <div className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex items-center justify-center min-h-[450px]">
          <Plot
            data={data}
            layout={{
              autosize: true,
              margin: { l: 0, r: 0, b: 0, t: 0 },
              scene: {
                xaxis: { title: "X축", range: [-kSurface, kSurface] },
                yaxis: { title: "Y축", range: [-kSurface, kSurface] },
                zaxis: { title: "Z = f(x,y)", range: [0, A + 2] },
                camera: { eye: { x: 1.6, y: 1.6, z: 1.0 } },
              },
            }}
            useResizeHandler={true}
            style={{ width: "100%", height: "100%" }}
            config={{ displayModeBar: false }}
          />
        </div>
      </div>
    </div>
  );
}
