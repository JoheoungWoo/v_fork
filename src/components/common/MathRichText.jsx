import katex from "katex";
import "katex/dist/katex.min.css";
import { convertLatexParenDelimiters } from "@/utils/mathRichTextUtils";

export const InlineMath = ({ math }) => {
  if (!math) return null;
  const html = katex.renderToString(String(math).replace(/\\\\/g, "\\"), {
    throwOnError: false,
    displayMode: false,
    strict: "ignore",
  });
  return (
    <span
      // 수식 내부에서도 강제 줄바꿈 허용
      className="inline-block align-middle [&_.katex]:whitespace-normal [word-break:break-word]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export const BlockMath = ({ math }) => {
  if (!math) return null;
  const html = katex.renderToString(String(math).replace(/\\\\/g, "\\"), {
    throwOnError: false,
    displayMode: true,
    strict: "ignore",
  });
  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      // 가로 스크롤 완전 차단(overflow-x-hidden) 및 자식 요소 줄바꿈 강제
      className="w-full min-w-0 max-w-full overflow-x-hidden py-2 [&_.katex-display]:max-w-full [&_.katex-display]:whitespace-normal [&_.katex-display]:overflow-x-hidden [&_.katex]:whitespace-normal [word-break:break-word] [overflow-wrap:anywhere]"
    />
  );
};

export const AutoMathRenderer = ({ text, isBlock = true }) => {
  if (!text) return null;

  let cleanText = convertLatexParenDelimiters(
    String(text).replace(/\\\$/g, "$"),
  );
  cleanText = cleanText.replace(/\\n/g, "\n");

  const parts = cleanText.split(
    /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\(.*?\\\)|\$[^$\n]*?\$)/g,
  );

  const Wrapper = isBlock ? "div" : "span";
  // 가로 스크롤 제거(overflow-x-hidden), 세로 확장을 위한 줄바꿈(break-words)
  const wrapClass = isBlock
    ? "whitespace-pre-wrap leading-relaxed break-words w-full min-w-0 block overflow-x-hidden [overflow-wrap:anywhere]"
    : "whitespace-normal leading-relaxed break-words min-w-0 inline-block [word-break:break-word] overflow-x-hidden [overflow-wrap:anywhere]";

  return (
    <Wrapper className={wrapClass}>
      {parts.map((part, i) => {
        if (!part) return null;

        if (
          (part.startsWith("$$") && part.endsWith("$$")) ||
          (part.startsWith("\\[") && part.endsWith("\\]"))
        ) {
          const mathContent = part.startsWith("$$")
            ? part.slice(2, -2)
            : part.slice(2, -2);
          return <BlockMath key={i} math={mathContent} />;
        }

        if (
          (part.startsWith("$") && part.endsWith("$")) ||
          (part.startsWith("\\(") && part.endsWith("\\)"))
        ) {
          const mathContent = part.startsWith("$")
            ? part.slice(1, -1)
            : part.slice(2, -2);
          return <InlineMath key={i} math={mathContent} />;
        }

        return (
          <span
            key={i}
            className="break-words whitespace-pre-wrap [overflow-wrap:anywhere]"
          >
            {part}
          </span>
        );
      })}
    </Wrapper>
  );
};

export default AutoMathRenderer;
