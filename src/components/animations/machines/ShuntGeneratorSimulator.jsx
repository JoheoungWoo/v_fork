import DcGeneratorTypeDiagram from "./diagrams/DcGeneratorTypeDiagram";
import DcGeneratorTypeContent from "./diagrams/DcGeneratorTypeContent";
import DcGeneratorTypeExecutionPanel from "./shunt-generator/DcGeneratorTypeExecutionPanel";
import ShuntCalculationPanel from "./shunt-generator/ShuntCalculationPanel";
import ShuntEquivalentCircuit from "./shunt-generator/ShuntEquivalentCircuit";
import ShuntGenerator3DModel from "./shunt-generator/ShuntGenerator3DModel";
import ShuntGeneratorControls from "./shunt-generator/ShuntGeneratorControls";
import { useState } from "react";

export default function ShuntGeneratorSimulator() {
  const [E, setE] = useState(110); // 유기기전력
  const [Ra, setRa] = useState(0.5); // 전기자 저항
  const [Rf, setRf] = useState(55); // 계자 저항
  const [RL, setRL] = useState(10); // 부하 저항
  const [isLoad, setIsLoad] = useState(true); // 부하 유무 스위치
  const [selectedType, setSelectedType] = useState("shunt");

  const loadConductance = isLoad ? 1 / RL : 0;
  const V = E / (1 + Ra * loadConductance + Ra / Rf);
  const If = V / Rf;
  const I = isLoad ? V / RL : 0;
  const Ia = I + If;
  const vDrop = Ia * Ra;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1000px",
        margin: "0 auto",
        backgroundColor: "#1e2128",
        color: "#fff",
        fontFamily: "sans-serif",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
      }}
    >
      <ShuntGeneratorControls
        E={E}
        setE={setE}
        Ra={Ra}
        setRa={setRa}
        Rf={Rf}
        setRf={setRf}
        RL={RL}
        setRL={setRL}
        isLoad={isLoad}
        setIsLoad={setIsLoad}
      />

      <DcGeneratorTypeDiagram />
      <DcGeneratorTypeContent
        activeType={selectedType}
        onSelectType={setSelectedType}
      />

      {selectedType === "shunt" ? (
        <>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <ShuntGenerator3DModel speed={E} Ia={Ia} If={If} />
            <ShuntEquivalentCircuit isLoad={isLoad} />
          </div>

          <ShuntCalculationPanel
            isLoad={isLoad}
            E={E}
            Ra={Ra}
            Rf={Rf}
            RL={RL}
            V={V}
            I={I}
            If={If}
            Ia={Ia}
            vDrop={vDrop}
          />
        </>
      ) : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <ShuntGenerator3DModel speed={E} Ia={Ia} If={If} />
            <div
              style={{
                flex: "1 1 400px",
                minHeight: "350px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#1c1f26",
                borderLeft: "1px solid #3d424b",
                color: "#bcd0e8",
                fontSize: "16px",
                padding: "18px",
                textAlign: "center",
                lineHeight: 1.7,
              }}
            >
              선택 타입 실행 모드입니다. 아래 패널에서 해당 타입의 연결 방식과 계산
              결과를 확인하세요.
            </div>
          </div>

          <DcGeneratorTypeExecutionPanel
            selectedType={selectedType}
            E={E}
            Ra={Ra}
            Rf={Rf}
            RL={RL}
            isLoad={isLoad}
          />
        </>
      )}
    </div>
  );
}
