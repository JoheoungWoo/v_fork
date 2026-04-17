/**
 * 강의 목록 탭(VideoCategoryTabs)과 Supabase `lectures_tbl.subject` 매핑.
 * 탭 라벨·별칭 추가는 이 파일만 수정하면 됩니다.
 */

/** DB subject(공백 제거 전 원문과 동일한 키) → 탭 id */
export const SUBJECT_TO_CATEGORY_TAB = {
  기초수학: "기초 수학",
  회로이론: "회로이론",
  전자기학: "전자기학",
  전기기기: "전기기기",
  전력공학: "전력공학",
  제어공학: "제어공학",
  "AI Company": "Vision",
};

/**
 * subject를 공백 제거·소문자 등으로 정규화한 키 → 탭 id (별칭·오타 대응)
 * 예: "전력 공학" → 정규화 "전력공학" → 전력공학 탭
 */
export const NORMALIZED_SUBJECT_TO_TAB = {
  기초수학: "기초 수학",
  기초수학입문: "기초 수학",
  회로이론: "회로이론",
  전자기학: "전자기학",
  전기자기학: "전자기학",
  전기기기: "전기기기",
  전력공학: "전력공학",
  전력: "전력공학",
  제어공학: "제어공학",
  제어: "제어공학",
  aicompany: "Vision",
  vision: "Vision",
};

/**
 * 단일 강의 행 → VideoCategoryTabs 의 탭 id (전체/기초 수학/…/Vision)
 * subject가 비어 있거나 매핑되지 않으면 lecture_id·title 키워드로 추정합니다.
 */
export function getCategory(video) {
  if (!video) return "기타";

  const subjectRaw = String(video.subject || "").trim();
  const subjectNormalized = subjectRaw.replace(/\s+/g, "");
  const subjectNormalizedLower = subjectNormalized.toLowerCase();

  if (SUBJECT_TO_CATEGORY_TAB[subjectNormalized]) {
    return SUBJECT_TO_CATEGORY_TAB[subjectNormalized];
  }
  if (NORMALIZED_SUBJECT_TO_TAB[subjectNormalized]) {
    return NORMALIZED_SUBJECT_TO_TAB[subjectNormalized];
  }
  if (NORMALIZED_SUBJECT_TO_TAB[subjectNormalizedLower]) {
    return NORMALIZED_SUBJECT_TO_TAB[subjectNormalizedLower];
  }

  const subject = video.subject || "";
  const idStr = String(video.lecture_id || video.id || "").toLowerCase();

  if (
    subject.includes("전자기") ||
    idStr.includes("em_") ||
    idStr.includes("coulomb") ||
    idStr.includes("ampere") ||
    idStr.includes("poten") ||
    idStr.includes("flemming") ||
    idStr.includes("vector_calculus")
  ) {
    return "전자기학";
  }

  if (
    subject.includes("기기") ||
    idStr.includes("motor") ||
    idStr.includes("homopolar") ||
    idStr.includes("machine") ||
    idStr.includes("induction") ||
    idStr.includes("generator") ||
    idStr.includes("transformer")
  ) {
    return "전기기기";
  }

  if (
    subject.includes("회로") ||
    idStr.includes("circuit") ||
    idStr.includes("ohm") ||
    idStr.includes("voltage") ||
    idStr.includes("reactance")
  ) {
    return "회로이론";
  }

  if (
    subject.includes("전력") ||
    idStr.includes("power") ||
    idStr.includes("grid") ||
    idStr.includes("transmission") ||
    idStr.includes("distribution") ||
    idStr.includes("substation")
  ) {
    return "전력공학";
  }

  if (
    subject.includes("제어") ||
    idStr.includes("control") ||
    idStr.includes("laplace") ||
    idStr.includes("time_constant") ||
    idStr.includes("angular_velocity")
  ) {
    return "제어공학";
  }

  if (
    subject.includes("수학") ||
    idStr.includes("math") ||
    idStr.includes("derivative") ||
    idStr.includes("square") ||
    idStr.includes("trig") ||
    idStr.includes("vector") ||
    idStr.includes("parabola") ||
    idStr.includes("intersection") ||
    idStr.includes("calculus")
  ) {
    return "기초 수학";
  }

  if (
    subject.includes("Vision") ||
    subject.includes("AI") ||
    idStr.includes("vision")
  ) {
    return "Vision";
  }

  return "기타";
}
