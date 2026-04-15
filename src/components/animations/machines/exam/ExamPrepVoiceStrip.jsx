import { Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getExamPrepScript } from "./examPrepScripts";

/**
 * 전기기사용: 현재 항목의 타입과의 차이만 읽어 주는 짧은 나레이션 + 브라우저 TTS.
 */
export default function ExamPrepVoiceStrip({ area, itemId }) {
  const script = getExamPrepScript(area, itemId);
  const [speaking, setSpeaking] = useState(false);
  const utterRef = useRef(null);

  const fullText = script
    ? [script.label, ...script.lines].join(" ")
    : "";

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  const play = useCallback(() => {
    if (!script || typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }
    stop();
    const u = new SpeechSynthesisUtterance(fullText);
    u.lang = "ko-KR";
    u.rate = 0.92;
    u.pitch = 1;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    utterRef.current = u;
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  }, [fullText, script, stop]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  if (!script) return null;

  return (
    <div
      style={{
        margin: "0 20px 16px",
        padding: "14px 16px",
        borderRadius: "12px",
        border: "1px solid rgba(246, 224, 94, 0.35)",
        background:
          "linear-gradient(135deg, rgba(45, 42, 24, 0.95), rgba(28, 26, 18, 0.98))",
        color: "#fff8e7",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          marginBottom: "8px",
        }}
      >
        <div style={{ fontSize: "12px", color: "#fcd34d", fontWeight: 700 }}>
          전기기사 · 시험용 핵심만 (차이점)
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={speaking ? stop : play}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "12px",
              backgroundColor: speaking ? "#b45309" : "#ca8a04",
              color: "#1c1917",
            }}
          >
            {speaking ? (
              <>
                <VolumeX size={16} /> 정지
              </>
            ) : (
              <>
                <Volume2 size={16} /> 핵심 듣기
              </>
            )}
          </button>
        </div>
      </div>
      <div style={{ fontSize: "15px", fontWeight: 800, marginBottom: "8px" }}>
        {script.label}
      </div>
      <ul
        style={{
          margin: 0,
          paddingLeft: "18px",
          fontSize: "13px",
          lineHeight: 1.65,
          color: "rgba(255, 247, 230, 0.92)",
        }}
      >
        {script.lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <p style={{ margin: "10px 0 0", fontSize: "11px", color: "rgba(253, 230, 138, 0.65)" }}>
        브라우저 음성 합성(TTS)을 사용합니다. 소리가 없으면 OS·브라우저에서 한국어 음성을
        설치하거나 다른 브라우저를 사용하세요.
      </p>
    </div>
  );
}
