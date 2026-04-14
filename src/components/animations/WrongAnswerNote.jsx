import React from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

const InlineMath = ({ math }) => {
  if (!math) return null;
  const html = katex.renderToString(String(math).replace(/\\\\/g, "\\"), {
    throwOnError: false,
    displayMode: false,
    strict: "ignore",
  });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const BlockMath = ({ math }) => {
  if (!math) return null;
  const html = katex.renderToString(String(math).replace(/\\\\/g, "\\"), {
    throwOnError: false,
    displayMode: true,
    strict: "ignore",
  });
  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      className="overflow-x-auto flex justify-center w-full my-2"
    />
  );
};

const AutoMathRenderer = ({ text, isBlock = true }) => {
  if (!text) return null;

  const textWithNewlines = String(text).replace(/\\n/g, "\n");
  const cleanText = textWithNewlines.replace(/\\\$/g, "$");

  if (!/\$\$|\\\[|\\\(|\$/.test(cleanText)) {
    if (!cleanText.includes("\\")) return <span>{cleanText}</span>;
    return isBlock ? (
      <BlockMath math={cleanText} />
    ) : (
      <InlineMath math={cleanText} />
    );
  }

  const parts = cleanText.split(
    /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[\s\S]*?\$|\\\([\s\S]*?\\\))/g,
  );

  return (
    <span className="whitespace-pre-wrap leading-relaxed">
      {parts.map((part, i) => {
        if (!part) return null;
        if (part.startsWith("$$") && part.endsWith("$$"))
          return <BlockMath key={i} math={part.slice(2, -2)} />;
        if (part.startsWith("\\[") && part.endsWith("\\]"))
          return <BlockMath key={i} math={part.slice(2, -2)} />;
        if (part.startsWith("\\(") && part.endsWith("\\)"))
          return <InlineMath key={i} math={part.slice(2, -2)} />;
        if (part.startsWith("$") && part.endsWith("$"))
          return <InlineMath key={i} math={part.slice(1, -1)} />;
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

const WrongAnswerNote = ({ incorrectCards = [] }) => {
  return (
    <div className="bg-red-50/50 rounded-xl p-5 border border-red-100 flex flex-col h-full max-h-[400px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-red-500 text-lg">
            edit_note
          </span>
          나만의 오답 노트
        </h3>
        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">
          {incorrectCards.length}개
        </span>
      </div>

      <div className="overflow-y-auto flex-grow pr-2 space-y-3 custom-scrollbar">
        {incorrectCards.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-400 min-h-[200px]">
            아직 틀린 문제가 없습니다.
          </div>
        ) : (
          incorrectCards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white p-3 rounded-lg border border-red-50 shadow-sm"
            >
              <div className="text-xs text-red-400 font-bold mb-1 break-keep">
                Q. <AutoMathRenderer text={card.keyword} isBlock={false} />
              </div>
              <div className="text-sm text-gray-800 font-semibold break-keep">
                <AutoMathRenderer text={card.answer} isBlock={false} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WrongAnswerNote;
