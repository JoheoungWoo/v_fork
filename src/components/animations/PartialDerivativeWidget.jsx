import katex from "katex";
import "katex/dist/katex.min.css";
import { useMemo, useState } from "react";
import Plot from "react-plotly.js";

const InlineMath = ({ math }) => {
  const html = katex.renderToString(math, {
    throwOnError: false,
    displayMode: false,
  });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const BlockMath = ({ math }) => {
  const html = katex.renderToString(math, {
    throwOnError: false,
    displayMode: true,
  });
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};
// 일정한 간격의 배열을 생성하는 헬퍼 함수
const linspace = (start, stop, num) =>
  Array.from(
    { length: num },
    (_, i) => start + (i * (stop - start)) / (num - 1),
  );

const PartialDerivativeWidget = () => {
  const [x0, setX0] = useState(1);
  const [y0, setY0] = useState(1);
  const [cutAxis, setCutAxis] = useState("x"); // 'x'는 y=상수 평면으로 자름, 'y'는 x=상수 평면으로 자름

  // 1. 3D 곡면 데이터 계산: f(x, y) = x^2 - y^2 (안장점 곡면)
  const { xArr, yArr, zSurface } = useMemo(() => {
    const x = linspace(-3, 3, 40);
    const y = linspace(-3, 3, 40);
    const z = y.map((yVal) => x.map((xVal) => xVal * xVal - yVal * yVal));
    return { xArr: x, yArr: y, zSurface: z };
  }, []);

  // 2. 현재 점, 단면 곡선, 접선, 절단 평면 데이터 계산
  const {
    z0,
    curveX,
    curveY,
    curveZ,
    lineX,
    lineY,
    lineZ,
    planeX,
    planeY,
    planeZ,
    slope,
  } = useMemo(() => {
    const z_val = x0 * x0 - y0 * y0;
    const tArr = linspace(-1.5, 1.5, 10); // 접선의 길이

    let cx, cy, cz, lx, ly, lz, px, py, pz, m;

    if (cutAxis === "x") {
      // x축 방향 변화 (y는 고정) -> f_x 편미분
      cx = xArr;
      cy = xArr.map(() => y0);
      cz = xArr.map((xVal) => xVal * xVal - y0 * y0);

      m = 2 * x0; // 편미분 계수 f_x = 2x
      lx = tArr.map((t) => x0 + t);
      ly = tArr.map(() => y0);
      lz = tArr.map((t) => z_val + m * t);

      // y = y0 인 평면
      px = [
        [-3, 3],
        [-3, 3],
      ];
      py = [
        [y0, y0],
        [y0, y0],
      ];
      pz = [
        [-9, -9],
        [9, 9],
      ];
    } else {
      // y축 방향 변화 (x는 고정) -> f_y 편미분
      cx = yArr.map(() => x0);
      cy = yArr;
      cz = yArr.map((yVal) => x0 * x0 - yVal * yVal);

      m = -2 * y0; // 편미분 계수 f_y = -2y
      lx = tArr.map(() => x0);
      ly = tArr.map((t) => y0 + t);
      lz = tArr.map((t) => z_val + m * t);

      // x = x0 인 평면
      px = [
        [x0, x0],
        [x0, x0],
      ];
      py = [
        [-3, 3],
        [-3, 3],
      ];
      pz = [
        [-9, -9],
        [9, 9],
      ];
    }

    return {
      z0: z_val,
      curveX: cx,
      curveY: cy,
      curveZ: cz,
      lineX: lx,
      lineY: ly,
      lineZ: lz,
      planeX: px,
      planeY: py,
      planeZ: pz,
      slope: m,
    };
  }, [x0, y0, cutAxis, xArr, yArr]);

  return (
    <div className="flex flex-col items-center p-2 md:p-6 w-full animate-fade-in">
      {/* 타이틀 및 수식 영역 */}
      <div className="mb-6 w-full text-center">
        <h3 className="text-xl font-extrabold text-[#0047a5] mb-2">
          3D 다변수 함수 편미분 시각화
        </h3>
        <p className="text-gray-500 mb-4">
          그래프를 마우스로 드래그하여 이리저리 돌려보고 확대/축소해 보세요!
        </p>
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm text-lg md:text-xl text-slate-800">
          <BlockMath math={`f(x, y) = x^2 - y^2`} />
        </div>
      </div>

      {/* 3D 그래프 렌더링 영역 */}
      <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8 flex justify-center">
        <Plot
          data={[
            // 1. 베이스 곡면
            {
              type: "surface",
              x: xArr,
              y: yArr,
              z: zSurface,
              colorscale: "Viridis",
              opacity: 0.8,
              showscale: false,
              hoverinfo: "none",
            },
            // 2. 절단 평면 (반투명)
            {
              type: "surface",
              x: planeX,
              y: planeY,
              z: planeZ,
              colorscale: [
                [0, "rgba(200, 200, 200, 0.4)"],
                [1, "rgba(200, 200, 200, 0.4)"],
              ],
              showscale: false,
              hoverinfo: "none",
            },
            // 3. 단면 곡선 (빨간색)
            {
              type: "scatter3d",
              mode: "lines",
              x: curveX,
              y: curveY,
              z: curveZ,
              line: { color: "red", width: 6 },
              name: "단면 곡선",
            },
            // 4. 접선 (노란색/주황색)
            {
              type: "scatter3d",
              mode: "lines",
              x: lineX,
              y: lineY,
              z: lineZ,
              line: { color: "#f59e0b", width: 8 },
              name: "접선 (기울기)",
            },
            // 5. 현재 포인트 (검은색 점)
            {
              type: "scatter3d",
              mode: "markers",
              x: [x0],
              y: [y0],
              z: [z0],
              marker: { color: "black", size: 6 },
              name: "현재 점",
            },
          ]}
          layout={{
            width: window.innerWidth < 768 ? window.innerWidth - 60 : 700,
            height: 500,
            margin: { l: 0, r: 0, t: 0, b: 0 },
            scene: {
              xaxis: { title: "X 축" },
              yaxis: { title: "Y 축" },
              zaxis: { title: "Z (함숫값)", range: [-9, 9] },
              camera: { eye: { x: 1.5, y: 1.5, z: 1.2 } },
            },
            showlegend: false,
          }}
          config={{ displayModeBar: false }}
        />
      </div>

      {/* 컨트롤 패널 */}
      <div className="w-full flex flex-col md:flex-row gap-6 mb-8">
        {/* 절단 축 선택 */}
        <div className="flex-1 bg-gray-50 p-6 rounded-2xl border border-gray-200">
          <h4 className="font-bold text-gray-700 mb-4">
            어떤 축을 따라 변화량을 볼까요?
          </h4>
          <div className="flex gap-4">
            <button
              onClick={() => setCutAxis("x")}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                cutAxis === "x"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white border text-gray-500 hover:bg-gray-100"
              }`}
            >
              X축 방향 (y 고정)
            </button>
            <button
              onClick={() => setCutAxis("y")}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                cutAxis === "y"
                  ? "bg-red-500 text-white shadow-md"
                  : "bg-white border text-gray-500 hover:bg-gray-100"
              }`}
            >
              Y축 방향 (x 고정)
            </button>
          </div>
        </div>

        {/* 변수 조절 슬라이더 */}
        <div className="flex-[1.5] bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col justify-center gap-4">
          <div className="flex items-center gap-4">
            <label className="w-20 font-bold text-blue-700">
              x = {x0.toFixed(1)}
            </label>
            <input
              type="range"
              min="-3"
              max="3"
              step="0.1"
              value={x0}
              onChange={(e) => setX0(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="w-20 font-bold text-red-600">
              y = {y0.toFixed(1)}
            </label>
            <input
              type="range"
              min="-3"
              max="3"
              step="0.1"
              value={y0}
              onChange={(e) => setY0(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-red-200 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
          </div>
        </div>
      </div>

      {/* 결과 수식 패널 */}
      <div
        className={`w-full p-6 rounded-2xl border text-center shadow-sm transition-colors ${
          cutAxis === "x"
            ? "bg-blue-50 border-blue-200"
            : "bg-red-50 border-red-200"
        }`}
      >
        <h4 className="font-extrabold text-gray-700 mb-2">
          {cutAxis === "x"
            ? "x에 대한 편미분 계수 (기울기)"
            : "y에 대한 편미분 계수 (기울기)"}
        </h4>
        <div className="text-xl mb-4 text-gray-600">
          <BlockMath
            math={
              cutAxis === "x"
                ? `f_x = \\frac{\\partial f}{\\partial x} = 2x`
                : `f_y = \\frac{\\partial f}{\\partial y} = -2y`
            }
          />
        </div>
        <div
          className={`text-4xl font-black ${cutAxis === "x" ? "text-blue-600" : "text-red-500"}`}
        >
          = {slope.toFixed(1)}
        </div>
      </div>
    </div>
  );
};

export default PartialDerivativeWidget;
