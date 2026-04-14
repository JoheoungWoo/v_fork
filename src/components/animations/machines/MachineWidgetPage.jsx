import { useEffect, useState } from "react";
import apiClient from "@/api/core/apiClient";
import VoltageLandscapeViewer from "@/components/animations/circuits/VoltageLandscapeViewer";
import DcCoilMotorWidget from "./DcCoilMotorWidget";
import InductionMotorWidget from "./InductionMotorWidget";
import SkinEffectWidget from "./SkinEffectWidget";
import Transformer3DWidget from "./Transformer3DWidget";
import Wiring3DViewer from "./Wiring3DViewer";

/** Fetches Python-computed JSON: GET /api/machine/widget/{handlerId} */
export default function MachineWidgetPage({
  widgetHandlerId = "transformer_yy_delta",
}) {
  const [widgetData, setWidgetData] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setWidgetData(null);
    setLoadError(null);
    apiClient
      .get(`/api/machine/widget/${encodeURIComponent(widgetHandlerId)}`)
      .then((res) => {
        if (!cancelled) setWidgetData(res.data);
      })
      .catch((e) => {
        if (!cancelled)
          setLoadError(
            e?.response?.data?.detail ||
              e?.message ||
              "백엔드 요청에 실패했습니다.",
          );
      });
    return () => {
      cancelled = true;
    };
  }, [widgetHandlerId]);

  if (loadError) {
    return (
      <div className="p-4 text-sm text-red-700">
        3D 위젯 데이터를 불러오지 못했습니다. 배포 환경에서{" "}
        <code className="rounded bg-gray-100 px-1">VITE_API_BASE_URL</code>이
        API 서버를 가리키는지 확인해 주세요. ({String(loadError)})
      </div>
    );
  }

  if (!widgetData) return <div>파이썬 백엔드에서 3D 벡터 좌표 연산 중...</div>;

  if (widgetData.type === "wiring_diagram_3d" && widgetData.scene_data) {
    return <Wiring3DViewer widgetData={widgetData} />;
  }

  if (widgetData.type === "induction_motor_3d") {
    return <InductionMotorWidget apiData={widgetData} />;
  }

  if (widgetData.type === "skin_effect_3d") {
    return <SkinEffectWidget apiData={widgetData} />;
  }

  if (widgetData.type === "dc_coil_motor_3d") {
    return <DcCoilMotorWidget apiData={widgetData} />;
  }

  const sd = widgetData.scene_data;
  if (
    sd?.terrain?.z_values &&
    Array.isArray(sd.particles) &&
    sd.terrain.width &&
    sd.terrain.depth
  ) {
    return <VoltageLandscapeViewer widgetData={widgetData} />;
  }

  return <Transformer3DWidget data={widgetData} />;
}
