/**
 * Neo4j lecture-catalog 병합 필드 `graph_concept`가 있으면 지식 맵과 동일한 표기를 씁니다.
 * 없으면 Supabase 등 DB의 title을 그대로 씁니다.
 */
export function getVideoHeadline(video) {
  const gc = video?.graph_concept && String(video.graph_concept).trim();
  if (gc) return gc;
  const t = String(video?.title || "").trim();
  return t || "제목 없음";
}

/** DB 강의 제목이 헤드라인과 다를 때만(편집용 N강 제목 등) 부제로 노출 */
export function getVideoCatalogSubtitle(video) {
  const headline = getVideoHeadline(video);
  const t = String(video?.title || "").trim();
  if (!t || t === headline) return null;
  return t;
}
