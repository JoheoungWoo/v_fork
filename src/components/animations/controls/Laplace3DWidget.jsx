import { useMemo, useState } from "react";
import Plot from "react-plotly.js";

const Laplace3DWidget = () => {
  // 초기 극점 위치 상태 (s = -1 ± j2)
  const [poleReal, setPoleReal] = useState(-1);
  const [poleImag, setPoleImag] = useState(2);

  // 극점 위치에 따른 3D 표면 데이터 계산
  const { x, y, z } = useMemo(() => {
    const size = 60; // 그리드 해상도 (숫자가 클수록 부드럽지만 느려짐)
    const rangeMin = -5;
    const rangeMax = 5;

    // -5 부터 5까지의 배열 생성
    const xArr = Array.from(
      { length: size },
      (_, i) => rangeMin + ((rangeMax - rangeMin) * i) / (size - 1),
    );
    const yArr = Array.from(
      { length: size },
      (_, i) => rangeMin + ((rangeMax - rangeMin) * i) / (size - 1),
    );
    const zArr = [];

    const epsilon = 0.05; // 0으로 나누기 방지
    const zMax = 2.5; // 산봉우리 자르기(Clipping) 높이

    for (let j = 0; j < size; j++) {
      const row = [];
      for (let i = 0; i < size; i++) {
        const sReal = xArr[i];
        const sImag = yArr[j];

        // 극점 1과의 거리: |s - p1|
        const d1 = Math.sqrt(
          Math.pow(sReal - poleReal, 2) + Math.pow(sImag - poleImag, 2),
        );
        // 극점 2와의 거리 (켤레복소수): |s - p2|
        const d2 = Math.sqrt(
          Math.pow(sReal - poleReal, 2) + Math.pow(sImag + poleImag, 2),
        );

        // 크기 계산: |H(s)| = 1 / (|s - p1| * |s - p2|)
        let mag = 1 / (d1 * d2 + epsilon);

        // 시각화를 위해 무한대로 솟구치는 부분을 zMax로 평평하게 깎음
        if (mag > zMax) mag = zMax;
        row.push(mag);
      }
      zArr.push(row);
    }
    return { x: xArr, y: yArr, z: zArr };
  }, [poleReal, poleImag]);

  const isStable = poleReal < 0;

  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-lg w-full max-w-4xl mx-auto border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        라플라스 s-평면 탐색기
      </h2>
      <p className="text-gray-600 mb-6 text-center">
        극점(Pole)의 실수부와 허수부를 조절하여 전달함수의 3D 지형도가 어떻게
        변하는지 관찰해 보세요.
      </p>

      {/* 3D 뷰어 영역 */}
      <div className="w-full h-[500px] border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
        <Plot
          data={[
            {
              type: "surface",
              z: z,
              x: x,
              y: y,
              colorscale: "Jet",
              showscale: false,
              contours: {
                z: {
                  show: true,
                  usecolormap: true,
                  highlightcolor: "limegreen",
                  project: { z: true },
                },
              },
            },
          ]}
          layout={{
            autosize: true,
            margin: { l: 0, r: 0, b: 0, t: 0 },
            scene: {
              xaxis: { title: "실수부 (σ)", range: [-5, 5] },
              yaxis: { title: "허수부 (jω)", range: [-5, 5] },
              zaxis: { title: "|H(s)| 크기", range: [0, 2.5] },
              camera: {
                eye: { x: 1.5, y: -1.5, z: 1.2 }, // 초기 카메라 각도
              },
            },
          }}
          useResizeHandler={true}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* 조작 패널 */}
      <div className="w-full mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50 p-6 rounded-lg">
        {/* 시스템 상태 표시기 */}
        <div className="col-span-1 md:col-span-2 flex justify-center items-center gap-4 mb-2">
          <span className="text-lg font-semibold text-gray-700">
            시스템 상태:
          </span>
          <span
            className={`px-4 py-1.5 rounded-full text-white font-bold ${isStable ? "bg-green-500" : "bg-red-500"}`}
          >
            {isStable ? "안정 (Stable)" : "불안정 (Unstable)"}
          </span>
        </div>

        {/* 슬라이더 1: 실수부 */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">
            극점 실수부 (σ) : {poleReal}
          </label>
          <input
            type="range"
            min="-4"
            max="4"
            step="0.5"
            value={poleReal}
            onChange={(e) => setPoleReal(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
          />
          <p className="text-xs text-gray-500 mt-1">
            0보다 작으면 안정(좌반면), 0보다 크면 불안정(우반면)
          </p>
        </div>

        {/* 슬라이더 2: 허수부 */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">
            극점 허수부 (jω) : ±{poleImag}
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={poleImag}
            onChange={(e) => setPoleImag(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
          />
          <p className="text-xs text-gray-500 mt-1">
            값이 클수록 시스템의 진동 주파수가 빨라집니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Laplace3DWidget;
