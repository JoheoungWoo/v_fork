import apiClient from "@/api/apiClient"; // 주신 apiClient 적용
import { useEffect, useState } from "react";
import Wiring3DViewer from "./Wiring3DViewer";

export default function MachineLearningPage() {
  const [content, setContent] = useState(null);

  // 랜덤 퀴즈를 가져올지, 특정 위젯을 가져올지 결정
  const loadRandomQuiz = async () => {
    try {
      // 주신 apiClient의 인터셉터가 자동으로 토큰을 실어줌
      const res = await apiClient.get(
        "/api/machine/random?category=transformer",
      );
      setContent(res.data);
    } catch (err) {
      alert("문제를 불러오지 못했습니다.");
    }
  };

  useEffect(() => {
    loadRandomQuiz();
  }, []);

  if (!content) return <div>문제 생성 중...</div>;

  return (
    <div>
      <h2>{content.title || "전기기기 실전 퀴즈"}</h2>
      {/* 3D 위젯 데이터가 포함되어 있다면 뷰어 표시 */}
      {content.scene_data && <Wiring3DViewer widgetData={content} />}

      <button onClick={() => loadRandomQuiz()}>다음 랜덤 문제</button>
    </div>
  );
}
