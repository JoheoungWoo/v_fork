import { useState } from "react";
import InductionMotorCircuit from "./InductionMotorCircuit";
import InductionMotorConfiguration from "./InductionMotorConfiguration";
import InductionMotorSimulation from "./InductionMotorSimulation";

export default function InductionMotorCombinedWidget() {
  // 기본 사양 상태
  const [voltage, setVoltage] = useState(220); // 상전압 (V)
  const [freq, setFreq] = useState(60); // 주파수 (Hz)
  const [poles, setPoles] = useState(4); // 극수 (P)
  const [slip, setSlip] = useState(0.05); // 슬립 (s)

  // 등가회로 파라미터 (고정값 또는 입력 가능)
  const [params, setParams] = useState({
    rs: 0.5, // 스테이터 저항
    xs: 1.2, // 스테이터 리액턴스
    rr: 0.4, // 로터 저항 (1차 환산)
    xr: 1.2, // 로터 리액턴스 (1차 환산)
    xm: 40, // 자화 리액턴스
  });

  return (
    <div
      style={{
        width: "100%",
        fontFamily: "sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {/* 설정 패널 */}
        <div style={{ flex: "1 1 300px" }}>
          <InductionMotorConfiguration
            voltage={voltage}
            setVoltage={setVoltage}
            freq={freq}
            setFreq={setFreq}
            poles={poles}
            setPoles={setPoles}
            slip={slip}
            setSlip={setSlip}
          />
        </div>

        {/* 회로도 및 시뮬레이션 */}
        <div
          style={{
            flex: "2 1 500px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <InductionMotorCircuit params={params} slip={slip} />
          <InductionMotorSimulation
            voltage={voltage}
            freq={freq}
            poles={poles}
            slip={slip}
            params={params}
          />
        </div>
      </div>
    </div>
  );
}
