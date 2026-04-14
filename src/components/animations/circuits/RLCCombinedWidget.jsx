import { useState } from "react";
import CircuitDiagram from "./CircuitDiagram";
import ConfigurationPanel from "./ConfigurationPanel";
import SimulationPanel from "./SimulationPanel";

export default function RLCCombinedWidget() {
  // 1. 모든 상태를 여기서 관리합니다.
  const [vPeak, setVPeak] = useState(3); // 초기값 3
  const [freq, setFreq] = useState(60); // 초기값 60

  const [activeR, setActiveR] = useState(true);
  const [valR, setValR] = useState(10);

  const [activeL, setActiveL] = useState(false);
  const [valL, setValL] = useState(10);

  const [activeC, setActiveC] = useState(false);
  const [valC, setValC] = useState(100);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {/* 2. 관리하는 상태와 함수들을 자식들에게 하나하나 다 넘겨줍니다. */}
        <div style={{ flex: "1 1 300px" }}>
          <ConfigurationPanel
            vPeak={vPeak}
            setVPeak={setVPeak}
            freq={freq}
            setFreq={setFreq}
            activeR={activeR}
            setActiveR={setActiveR}
            valR={valR}
            setValR={setValR}
            activeL={activeL}
            setActiveL={setActiveL}
            valL={valL}
            setValL={setValL}
            activeC={activeC}
            setActiveC={setActiveC}
            valC={valC}
            setValC={setValC}
          />
        </div>

        <div
          style={{
            flex: "2 1 500px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <CircuitDiagram
            activeR={activeR}
            valR={valR}
            activeL={activeL}
            valL={valL}
            activeC={activeC}
            valC={valC}
            vPeak={vPeak}
            freq={freq}
          />
          <SimulationPanel
            vPeak={vPeak}
            freq={freq}
            activeR={activeR}
            valR={valR}
            activeL={activeL}
            valL={valL}
            activeC={activeC}
            valC={valC}
          />
        </div>
      </div>
    </div>
  );
}
