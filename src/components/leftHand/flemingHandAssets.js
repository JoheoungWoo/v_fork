/**
 * 플레밍 3D 위젯 손 시각화
 *
 * `FLEMING_LEFT_HAND_IMAGE_URL`에 PNG/WebP(투명 배경 권장) 경로를 두면
 * `public/` 기준으로 로드해 GLB 대신 평면에 표시합니다.
 * 빈 문자열이면 LeftHand.glb + 손가락 슬라이더만 사용합니다.
 */
export const FLEMING_LEFT_HAND_IMAGE_URL = "/images/fleming-left-hand.png";

/** 부모 group의 scale 적용 전, 로컬 단위에서 이미지 세로 높이 */
export const FLEMING_HAND_IMAGE_BASE_HEIGHT = 0.11;

/** 평면 추가 회전 [rx, ry, rz] (라디안). 앞뒤가 뒤집히면 예: [0, Math.PI, 0] */
export const FLEMING_HAND_IMAGE_EULER = [0, 0, 0];
