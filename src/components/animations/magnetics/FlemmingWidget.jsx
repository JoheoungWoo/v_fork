/**
 * 레거시 파일명(Flemming). `public/flemming.glb` 없으면 기존 3D 버전은 실패하므로,
 * 기본 실습 UI는 GLB가 필요 없는 FlemingWidget으로 연결합니다.
 * 3D 모터를 다시 쓰려면 `public/flemming.glb`를 배치한 뒤 이 파일에서 별도 래퍼를 구성하세요.
 */
export { default } from "./FlemingWidget";
