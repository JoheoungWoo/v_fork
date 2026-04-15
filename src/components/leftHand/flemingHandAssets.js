/**
 * 플레밍 3D 위젯 손 시각화
 *
 * `FLEMING_LEFT_HAND_IMAGE_URL`에 PNG/WebP(투명 배경 권장) 경로를 두면
 * `public/` 기준으로 로드해 GLB 대신 평면에 표시합니다.
 * 빈 문자열이면 left_finger.glb + 손가락 슬라이더만 사용합니다.
 */
/** 비우면 `left_finger.glb`(LeftHandModel)만 사용 — PNG를 쓰면 GLB는 그리지 않음 */
export const FLEMING_LEFT_HAND_IMAGE_URL = "";

/** 부모 group의 scale 적용 전, 로컬 단위에서 이미지 세로 높이 */
export const FLEMING_HAND_IMAGE_BASE_HEIGHT = 0.11;

/** 평면 추가 회전 [rx, ry, rz] (라디안). 앞뒤가 뒤집히면 예: [0, Math.PI, 0] */
export const FLEMING_HAND_IMAGE_EULER = [0, 0, 0];

/**
 * true면 손 이미지가 항상 카메라를 향함(스프라이트). 단일 평면을 3D에서 돌릴 때
 * 옆에서 “종이 한 장”처럼 보이는 현상을 줄입니다.
 * false면 부모 그룹 회전에 고정된 평면(입체감은 GLB가 더 적합).
 */
export const FLEMING_HAND_IMAGE_USE_BILLBOARD = true;
