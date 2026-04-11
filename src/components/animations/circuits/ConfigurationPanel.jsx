import { useEffect, useRef, useState } from "react";
// Recharts 라이브러리 (파형 그래프용)
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// 전압, 주파수, 소자 유형 및 값 입력을 위한 폼 컴포넌트
const ConfigurationPanel = ({
  vPeak,
  setVPeak,
  freq,
  setFreq,
  componentType,
  setComponentType,
  componentValue,
  setComponentValue,
}) => {
  return (
    <div
      style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "5px" }}
    >
      <h3>1. 입력 설정</h3>
      <div style={{ marginBottom: "10px" }}>
        <label>전압 크기 (Vp, 0도 위상): </label>
        <input
          type="number"
          value={vPeak}
          onChange={(e) => setVPeak(parseFloat(e.target.value))}
        />{" "}
        V
      </div>
      <div style={{ marginBottom: "10px" }}>
        <label>주파수 (f): </label>
        <input
          type="number"
          value={freq}
          onChange={(e) => setFreq(parseFloat(e.target.value))}
        />{" "}
        Hz
      </div>
      <div style={{ marginBottom: "10px" }}>
        <label>소자 유형 선택: </label>
        <select
          value={componentType}
          onChange={(e) => setComponentType(e.target.value)}
        >
          <option value="R">저항 (R)</option>
          <option value="L">코일 (L)</option>
          <option value="C">콘덴서 (C)</option>
        </select>
      </div>
      <div>
        <label>
          소자 값 ({componentType === "R" && "Ω"}
          {componentType === "L" && "mH"}
          {componentType === "C" && "μF"}
          ):{" "}
        </label>
        <input
          type="number"
          value={componentValue}
          onChange={(e) => setComponentValue(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
};

// 계산된 결과 및 시뮬레이션을 표시하는 컴포넌트
const SimulationPanel = ({ vPeak, freq, zMag, zPhase, iMag, iPhase }) => {
  const [waveformData, setWaveformData] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    // 1. 파형 데이터 생성
    const generateWaveforms = () => {
      const omega = 2 * Math.PI * freq;
      const data = [];
      const steps = 100; // 한 주기를 표현할 지점 수
      const period = 1 / freq;

      for (let i = 0; i < steps; i++) {
        const t = (i / steps) * period;
        const v = vPeak * Math.sin(omega * t);
        // 전류 파형: 전류 위상각(라디안) 반영
        const iRad = (iPhase * Math.PI) / 180;
        const iVal = iMag * Math.sin(omega * t + iRad);

        data.push({
          time: t,
          v: v,
          i: iVal,
        });
      }
      setWaveformData(data);
    };

    if (freq > 0) {
      generateWaveforms();
    } else {
      setWaveformData([]);
    }

    // 2. 벡터도 그리기 (Canvas 사용)
    const drawVectorDiagram = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const width = canvas.width;
      const height = canvas.height;
      const center = { x: width / 2, y: height / 2 };
      // 벡터 길이 조절용 스케일 (최대값 기준)
      const scale = Math.min(center.x, center.y) * 0.8;

      ctx.clearRect(0, 0, width, height); // 기존 내용 지우기

      // 축 그리기
      ctx.beginPath();
      ctx.moveTo(0, center.y);
      ctx.lineTo(width, center.y);
      ctx.moveTo(center.x, 0);
      ctx.lineTo(center.x, height);
      ctx.strokeStyle = "#eee";
      ctx.stroke();

      // 화살표 그리기 헬퍼 함수
      const drawArrow = (ctx, start, end, color, label) => {
        const headlen = 10; // 화살표 머리 길이
        const angle = Math.atan2(end.y - start.y, end.x - start.x);

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(
          end.x - headlen * Math.cos(angle - Math.PI / 6),
          end.y - headlen * Math.sin(angle - Math.PI / 6),
        );
        ctx.lineTo(
          end.x - headlen * Math.cos(angle + Math.PI / 6),
          end.y - headlen * Math.sin(angle + Math.PI / 6),
        );
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        // 라벨 표시
        ctx.fillStyle = color;
        ctx.font = "bold 12px sans-serif";
        ctx.fillText(label, end.x + 5, end.y - 5);
      };

      // 전압 벡터 (0도 기준)
      const vEndX =
        center.x + (vPeak / Math.max(vPeak, iMag * zMag || 1)) * scale; // 스케일링
      drawArrow(ctx, center, { x: vEndX, y: center.y }, "blue", "V");

      // 전류 벡터 (전압 대비 위상각 반영)
      const iRad = (iPhase * Math.PI) / 180;
      // 전류 크기 스케일링 (전압 벡터 길이와 비교)
      const currentScale = zMag
        ? scale / Math.max(zMag, 1)
        : scale / Math.max(iMag, 1);
      // y축은 캔버스에서 아래쪽이 +이므로 전류 위상각에 따라 y 좌표 조절 (부호 반전 필요)
      const iEndX =
        center.x +
        (iMag / Math.max(iMag, vPeak / zMag || 1)) * scale * Math.cos(iRad);
      const iEndY =
        center.y -
        (iMag / Math.max(iMag, vPeak / zMag || 1)) * scale * Math.sin(iRad);
      drawArrow(ctx, center, { x: iEndX, y: iEndY }, "orange", "I");
    };

    drawVectorDiagram();
  }, [vPeak, freq, zMag, zPhase, iMag, iPhase]);

  return (
    <div
      style={{
        flex: 1,
        padding: "20px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3>2. 결과 및 시뮬레이션</h3>
      <div style={{ marginBottom: "10px" }}>
        <strong>계산된 임피던스 (Z):</strong> {zMag.toFixed(2)} Ω,{" "}
        {zPhase.toFixed(2)}°
      </div>
      <div style={{ marginBottom: "20px" }}>
        <strong>계산된 전류 (I):</strong> {iMag.toFixed(2)} A,{" "}
        {iPhase.toFixed(2)}°
      </div>

      <div style={{ flex: 1, display: "flex" }}>
        {/* 파형 그래프 */}
        <div style={{ flex: 1, height: "300px" }}>
          <h4>전압 & 전류 파형</h4>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={waveformData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                label={{
                  value: "Time (s)",
                  position: "insideBottomRight",
                  offset: 0,
                }}
                tickFormatter={(tick) => tick.toFixed(4)}
              />
              <YAxis
                label={{
                  value: "Amplitude (V, A)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip
                formatter={(value, name) => [
                  value.toFixed(2),
                  name === "v" ? "Voltage (V)" : "Current (A)",
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="v"
                stroke="blue"
                name="Voltage (V)"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="i"
                stroke="orange"
                name="Current (A)"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 벡터도 */}
        <div
          style={{ width: "300px", marginLeft: "20px", textAlign: "center" }}
        >
          <h4>벡터도 (Phasor Diagram)</h4>
          <canvas
            ref={canvasRef}
            width={250}
            height={250}
            style={{ border: "1px solid #ccc" }}
          />
        </div>
      </div>
    </div>
  );
};

// 메인 시뮬레이터 컴포넌트
const RLCSimulator = () => {
  // 상태 관리: 전압, 주파수, 소자 정보
  const [vPeak, setVPeak] = useState(10); // 피크 전압 (Vp)
  const [freq, setFreq] = useState(60); // 주파수 (Hz)
  const [componentType, setComponentType] = useState("R"); // 소자 유형 ('R', 'L', 'C')
  const [componentValue, setComponentValue] = useState(10); // 소자 값 (Ω, mH, μF)

  // 계산된 결과 상태
  const [zMag, setZMag] = useState(0);
  const [zPhase, setZPhase] = useState(0);
  const [iMag, setIMag] = useState(0);
  const [iPhase, setIPhase] = useState(0);

  // 입력값이 변경될 때마다 임피던스 및 전류 계산
  useEffect(() => {
    if (vPeak > 0 && freq > 0 && componentValue >= 0) {
      const omega = 2 * Math.PI * freq;
      let calculatedZMag = 0;
      let calculatedZPhase = 0;

      // 소자에 따른 임피던스 계산
      if (componentType === "R") {
        calculatedZMag = componentValue;
        calculatedZPhase = 0; // 저항 위상 0
      } else if (componentType === "L") {
        // L: 단위 변환 (mH -> H), 리액턴스 XL = ωL, 위상 +90도
        calculatedZMag = omega * componentValue * 1e-3;
        calculatedZPhase = 90;
      } else if (componentType === "C") {
        // C: 단위 변환 (μF -> F), 리액턴스 XC = 1 / (ωC), 위상 -90도
        if (componentValue > 0) {
          calculatedZMag = 1 / (omega * componentValue * 1e-6);
          calculatedZPhase = -90;
        } else {
          // 커패시턴스가 0이면 임피던스 무한대 (단선), 전류 0
          calculatedZMag = Infinity;
          calculatedZPhase = -90;
        }
      }

      setZMag(calculatedZMag);
      setZPhase(calculatedZPhase);

      // 전류 계산 (I = V / Z)
      if (calculatedZMag > 0 && calculatedZMag !== Infinity) {
        // 전압 위상이 0도이므로, 전류 위상은 -임피던스 위상
        setIMag(vPeak / calculatedZMag);
        setIPhase(-calculatedZPhase);
      } else {
        setIMag(0);
        setIPhase(-calculatedZPhase);
      }
    } else {
      // 입력값이 유효하지 않으면 결과 초기화
      setZMag(0);
      setZPhase(0);
      setIMag(0);
      setIPhase(0);
    }
  }, [vPeak, freq, componentType, componentValue]);

  return (
    <div style={{ display: "flex", fontfamily: "sans-serif" }}>
      <ConfigurationPanel
        vPeak={vPeak}
        setVPeak={setVPeak}
        freq={freq}
        setFreq={setFreq}
        componentType={componentType}
        setComponentType={setComponentType}
        componentValue={componentValue}
        setComponentValue={setComponentValue}
      />
      <SimulationPanel
        vPeak={vPeak}
        freq={freq}
        zMag={zMag}
        zPhase={zPhase}
        iMag={iMag}
        iPhase={iPhase}
      />
    </div>
  );
};

export default RLCSimulator;
