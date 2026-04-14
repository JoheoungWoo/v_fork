import { useEffect, useState } from "react";
import DcCoilMotorWidget from "./components/animations/machines/DcCoilMotorWidget";

const FALLBACK_DATA = {
  type: "dc_coil_motor_3d",
  title: "DC 사각형 코일 모터",
  subtitle: "백엔드 연동 실패 시 로컬 데이터로 동작합니다.",
  model_url: "/models/dc_coil_motor.glb",
  coil_object_name: "Motor_Coil_Root",
  rotation_axis: "y",
};

export default function App() {
  const [apiData, setApiData] = useState(FALLBACK_DATA);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/machine/widget/machine_dc_coil_motor")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.type === "dc_coil_motor_3d") setApiData(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", padding: 16, background: "#0b0f16" }}>
      <DcCoilMotorWidget apiData={apiData} />
    </div>
  );
}
