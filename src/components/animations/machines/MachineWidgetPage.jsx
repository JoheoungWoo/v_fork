// React 프론트엔드 예시
import { useEffect, useState } from "react";
import Transformer3DWidget from "./Transformer3DWidget";

export default function MachineWidgetPage() {
  const [widgetData, setWidgetData] = useState(null);

  useEffect(() => {
    // 백엔드 파이썬에 3D 좌표 연산 요청
    fetch("/api/machine/widget/machine_y_delta_3rd_harmonic")
      .then((res) => res.json())
      .then((data) => setWidgetData(data));
  }, []);

  if (!widgetData) return <div>파이썬 백엔드에서 3D 벡터 좌표 연산 중...</div>;

  // 연산이 완료되면 Three.js 바보 뷰어에 데이터를 던져줌
  return <Transformer3DWidget data={widgetData} />;
}
