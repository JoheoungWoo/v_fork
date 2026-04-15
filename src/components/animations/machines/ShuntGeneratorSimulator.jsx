import DcGeneratorTypeDiagram from "./diagrams/DcGeneratorTypeDiagram";
import DcGeneratorTypeContent from "./diagrams/DcGeneratorTypeContent";
import DcGeneratorEquivalentCircuitSvg from "./shunt-generator/DcGeneratorEquivalentCircuitSvg";
import DcGeneratorTypeExecutionPanel from "./shunt-generator/DcGeneratorTypeExecutionPanel";
import { calculateDcGeneratorOperatingPoint } from "./shunt-generator/dcGeneratorCalculations";
import ShuntCalculationPanel from "./shunt-generator/ShuntCalculationPanel";
import ShuntEquivalentCircuit from "./shunt-generator/ShuntEquivalentCircuit";
import ShuntGenerator3DModel from "./shunt-generator/ShuntGenerator3DModel";
import ShuntGeneratorControls from "./shunt-generator/ShuntGeneratorControls";
import { useMemo, useState } from "react";

export default function ShuntGeneratorSimulator() {
  const [E, setE] = useState(110);
  const [Ra, setRa] = useState(0.5);
  const [Rf, setRf] = useState(55);
  const [RL, setRL] = useState(10);
  const [isLoad, setIsLoad] = useState(true);
  const [selectedType, setSelectedType] = useState("shunt");

  const loadConductance = isLoad ? 1 / RL : 0;
  const V = E / (1 + Ra * loadConductance + Ra / Rf);
  const If = V / Rf;
  const I = isLoad ? V / RL : 0;
  const Ia = I + If;
  const vDrop = Ia * Ra;

  const operatingPoint = useMemo(
    () =>
      calculateDcGeneratorOperatingPoint(selectedType, {
        E,
        Ra,
        Rf,
        RL,
        isLoad,
      }),
    [selectedType, E, Ra, Rf, RL, isLoad],
  );

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
      <DcGeneratorTypeContent activeType={selectedType} onSelectType={setSelectedType} />

      {selectedType === "shunt" ? (
        <>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <ShuntGenerator3DModel
              speed={E}
              Ia={Ia}
              If={If}
              Ise={operatingPoint.Ise}
              topology="shunt"
            />
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
            <ShuntGenerator3DModel
              speed={E}
              Ia={operatingPoint.Ia}
              If={operatingPoint.If}
              Ise={operatingPoint.Ise}
              topology={selectedType}
            />
            <div
              style={{
                flex: "1 1 400px",
                minHeight: "350px",
                backgroundColor: "#1c1f26",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                borderLeft: "1px solid #3d424b",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  zIndex: 1,
                  color: "#fff",
                  background: "#000a",
                  padding: "5px 10px",
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
              >
                [등가회로] 타입별 토폴로지 (연결 구조가 서로 다름)
              </div>
              <div style={{ flex: 1, padding: "44px 8px 8px", overflow: "auto" }}>
                <DcGeneratorEquivalentCircuitSvg type={selectedType} isLoad={isLoad} />
              </div>
            </div>
          </div>

          <DcGeneratorTypeExecutionPanel
            selectedType={selectedType}
            E={E}
            Ra={Ra}
            Rf={Rf}
            RL={RL}
            isLoad={isLoad}
            showDiagram={false}
          />
        </>
      )}
    </div>
  );
}
