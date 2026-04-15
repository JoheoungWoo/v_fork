import { Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getExamPrepScript } from "./examPrepScripts";

function waitForVoices(synth, timeoutMs = 2500) {
  return new Promise((resolve) => {
    const list = synth.getVoices();
    if (list.length > 0) {
      resolve(list);
      return;
    }
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      synth.removeEventListener("voiceschanged", onChange);
      resolve(synth.getVoices());
    };
    const onChange = () => finish();
    synth.addEventListener("voiceschanged", onChange);
    window.setTimeout(finish, timeoutMs);
  });
}

function pickKoreanVoice(voices) {
  if (!voices?.length) return null;
  const lower = (v) => (v.lang || "").toLowerCase();
  return (
    voices.find((v) => lower(v).startsWith("ko")) ||
    voices.find((v) => /korean|한국|heami|hayoon|injeong/i.test(v.name || "")) ||
    null
  );
}

/**
 * 전기기사용: 현재 항목의 타입과의 차이만 읽어 주는 짧은 나레이션 + 브라우저 TTS.
 */
export default function ExamPrepVoiceStrip({ area, itemId }) {
  const script = getExamPrepScript(area, itemId);
  const [speaking, setSpeaking] = useState(false);
  const [errorHint, setErrorHint] = useState(null);
  const [infoHint, setInfoHint] = useState(null);
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

  const play = useCallback(async () => {
    if (!script || typeof window === "undefined" || !window.speechSynthesis) {
      setErrorHint("이 브라우저는 음성 합성을 지원하지 않습니다.");
      setInfoHint(null);
      return;
    }

    const synth = window.speechSynthesis;
    stop();
    setErrorHint(null);
    setInfoHint(null);

    // cancel() 직후 speak()가 무시되는 경우가 있어 한 틱 뒤에 실행
    await new Promise((r) => window.setTimeout(r, 50));

    if (synth.paused) {
      synth.resume();
    }

    const voices = await waitForVoices(synth);
    const koVoice = pickKoreanVoice(voices);

    const u = new SpeechSynthesisUtterance(fullText);
    u.lang = "ko-KR";
    if (koVoice) {
      u.voice = koVoice;
    }
    u.rate = 0.92;
    u.pitch = 1;
    u.onend = () => {
      setSpeaking(false);
      utterRef.current = null;
    };
    u.onerror = (ev) => {
      setSpeaking(false);
      utterRef.current = null;
      const code = ev?.error || "unknown";
      if (code === "not-allowed") {
        setErrorHint("브라우저가 음성 재생을 막았습니다. 페이지를 새로고침한 뒤 다시 눌러 보세요.");
      } else {
        setErrorHint(`음성 재생 오류: ${code}. 한국어 음성 패키지 설치를 확인하세요.`);
      }
    };

    utterRef.current = u;
    synth.speak(u);
    setSpeaking(true);

    if (voices.length === 0) {
      setErrorHint(
        "사용 가능한 음성이 없습니다. Windows 설정 → 시간 및 언어 → 음성에서 한국어 음성을 추가하거나 Chrome/Edge 최신 버전을 사용하세요.",
      );
    } else if (!koVoice) {
      setInfoHint(
        "한국어(ko) 음성이 없어 기본 음성으로 읽을 수 있습니다. 무음이면 Windows 설정에서 한국어 음성 패키지를 설치하세요.",
      );
    }
  }, [fullText, script, stop]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  // Chrome 등: voiceschanged 전에 목록이 비어 있음 — 미리 한 번 불러 두면 첫 클릭이 안정적
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const s = window.speechSynthesis;
    const kick = () => {
      s.getVoices();
    };
    s.addEventListener("voiceschanged", kick);
    kick();
    return () => s.removeEventListener("voiceschanged", kick);
  }, []);

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
      {errorHint ? (
        <p
          style={{
            margin: "10px 0 0",
            fontSize: "11px",
            color: "#fca5a5",
            lineHeight: 1.5,
          }}
        >
          {errorHint}
        </p>
      ) : null}
      {infoHint ? (
        <p
          style={{
            margin: "8px 0 0",
            fontSize: "11px",
            color: "#fcd34d",
            lineHeight: 1.5,
          }}
        >
          {infoHint}
        </p>
      ) : null}
      <p style={{ margin: "10px 0 0", fontSize: "11px", color: "rgba(253, 230, 138, 0.65)" }}>
        첫 실행 시 브라우저가 음성 목록을 불러오는 데 잠깐 걸릴 수 있습니다. 여전히 무음이면
        Windows 설정 → 시간 및 언어 → 음성에서 한국어 음성 추가 후 브라우저를 다시 실행해
        보세요.
      </p>
    </div>
  );
}
