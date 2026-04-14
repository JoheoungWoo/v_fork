import katex from "katex";
import "katex/dist/katex.min.css";
import { useEffect, useRef } from "react";

// 커스텀 Latex 컴포넌트 (react-latex-next 대체재)
export const Latex = ({ children }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      // 텍스트 내의 $$ ... $$ 를 찾아서 수식으로 변환 (단순화된 예시)
      const text = children.replace(/\$\$(.*?)\$\$/g, (_, math) => {
        return katex.renderToString(math, { throwOnError: false });
      });
      containerRef.current.innerHTML = text;
    }
  }, [children]);

  return <span ref={containerRef} />;
};
