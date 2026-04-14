import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const useMove = () => {
  const navigate = useNavigate();

  // 1. useCallback으로 메모이제이션 (의존성 관리)
  const move = useCallback(
    (path, options = {}) => {
      // --- [공통 로직 영역] ---
      // 예: 페이지 이동 시 항상 스크롤 맨 위로
      window.scrollTo(0, 0);

      // 예: 로깅이나 권한 체크 등을 여기서 수행 가능
      // console.log(`Navigating to: ${path}`);
      // -----------------------

      // 2. Spread 연산자로 모든 옵션 전달 (매개변수 처리)
      // navigate(path, { replace: true, state: { from: 'home' } }) 등을 모두 수용
      navigate(path, { ...options });
    },
    [navigate],
  ); // navigate 객체가 바뀔 때만 함수 재생성

  return move;
};

export default useMove;
