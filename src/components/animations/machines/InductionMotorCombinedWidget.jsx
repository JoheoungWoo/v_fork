import { useState } from "react";
import InductionMotorCircuit from "./InductionMotorCircuit";
import InductionMotorConfiguration from "./InductionMotorConfiguration";
import InductionMotorCrossSection from "./InductionMotorCrossSection";
import InductionMotorSimulation from "./InductionMotorSimulation";

export default function InductionMotorCombinedWidget() {
  const [voltage, setVoltage] = useState(220);
  const [freq, setFreq] = useState(60);
  const [poles, setPoles] = useState(4);
  const [slip, setSlip] = useState(0.05);

  const [params] = useState({
    rs: 0.5,
    xs: 1.2,
    rr: 0.4,
    xr: 1.2,
    xm: 40,
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

        {/* 단면 시각화 + 등가회로 + 운전특성 */}
        <div
          style={{
            flex: "2 1 500px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* ① 실제 전동기 단면 (새 컴포넌트) */}
          <InductionMotorCrossSection slip={slip} poles={poles} freq={freq} />

          {/* ② 한 상당 등가회로 */}
          <InductionMotorCircuit params={params} slip={slip} />

          {/* ③ 운전 특성 분석 */}
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
