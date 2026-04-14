import apiClient from "@/api/core/apiClient";
import VoltageLandscapeViewer from "@/components/animations/circuits/VoltageLandscapeViewer";
import DcCoilMotorWidget from "@/components/animations/machines/DcCoilMotorWidget";
import InductionMotorWidget from "@/components/animations/machines/InductionMotorWidget";
import SkinEffectWidget from "@/components/animations/machines/SkinEffectWidget";
import Wiring3DViewer from "@/components/animations/machines/Wiring3DViewer";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

function LoadingView() {
  return (
    <div className="flex min-h-[520px] items-center justify-center">
      <Loader2 className="animate-spin text-[#0047a5]" size={42} />
    </div>
  );
}

function ErrorView({ message }) {
  return (
    <div className="flex min-h-[360px] items-center justify-center rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
      {message}
    </div>
  );
}

export default function MachineWidgetPage({ widgetHandlerId }) {
  const [widgetData, setWidgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!widgetHandlerId) {
        setError("widgetHandlerId가 필요합니다.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const res = await apiClient.get(`/api/machine/widget/${widgetHandlerId}`);
        if (!cancelled) setWidgetData(res?.data ?? null);
      } catch (e) {
        if (!cancelled) {
          setError("백엔드 위젯 데이터를 가져오지 못했습니다.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [widgetHandlerId]);

  const content = useMemo(() => {
    if (!widgetData) return null;

    if (widgetData.type === "induction_motor_3d") {
      return <InductionMotorWidget apiData={widgetData} />;
    }

    if (widgetData.type === "skin_effect_3d") {
      return <SkinEffectWidget apiData={widgetData} />;
    }

    if (widgetData.type === "dc_coil_motor_3d") {
      return <DcCoilMotorWidget apiData={widgetData} />;
    }

    if (widgetData.type === "voltage_manifold_3d") {
      return <VoltageLandscapeViewer widgetData={widgetData} />;
    }

    if (widgetData.type === "wiring_diagram_3d") {
      return <Wiring3DViewer widgetData={widgetData} />;
    }

    return (
      <ErrorView message={`지원하지 않는 machine widget type: ${widgetData.type ?? "unknown"}`} />
    );
  }, [widgetData]);

  if (loading) return <LoadingView />;
  if (error) return <ErrorView message={error} />;
  if (!content) return <ErrorView message="표시할 위젯 데이터가 없습니다." />;

  return <div className="h-full w-full">{content}</div>;
}
