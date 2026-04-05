import React from "react";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css"; 
import { BookOpen, Calculator, FileText, Star, PlayCircle, PenTool } from "lucide-react";

const ChapterFeedCard = ({ item }) => {
  const concepts = item.concepts || [];

  return (
    <section className="w-full bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden transition-all hover:shadow-xl relative">
      {/* Gold 뱃지 (옵션) */}
      {item.is_gold && (
        <div className="absolute top-0 right-0 bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-md z-10 flex items-center gap-1">
          <Star size={12} fill="currentColor" /> GOLD TOPIC
        </div>
      )}

      {/* 1. 챕터 헤더 */}
      <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <span className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm tracking-wide">
            {item.code}
          </span>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            {item.title}
          </h2>
        </div>

        {/* 기능 버튼 (Gold Topic일 때 등) */}
        <div className="flex gap-2">
          {item.lecture_url && (
            <a 
              href={item.lecture_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors text-sm font-bold"
            >
              <PlayCircle size={16} /> 강의 보기
            </a>
          )}
          {item.quiz_url && (
            <a 
              href={item.quiz_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors text-sm font-bold"
            >
              <PenTool size={16} /> 문제 풀기
            </a>
          )}
        </div>
      </div>

      {/* 2. 본문 컨텐츠 */}
      <div className="p-8 bg-white flex flex-col gap-10">
        {concepts.length > 0 ? (
          concepts.map((concept, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col lg:flex-row gap-0 lg:gap-8 rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300"
            >
              {/* 왼쪽: 설명 */}
              <div className="flex-1 p-8 bg-white flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <BookOpen size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {concept.name}
                  </h3>
                </div>
                <p className="text-slate-600 text-lg leading-relaxed pl-1">
                  {concept.summary || "요약 설명이 없습니다."}
                </p>
                {concept.definition && (
                  <div className="mt-2 p-5 bg-slate-50 rounded-xl border-l-4 border-slate-300">
                    <div className="flex items-center gap-2 mb-2 text-slate-500 font-bold text-xs uppercase tracking-wider">
                      <FileText size={14} /> Definition
                    </div>
                    <p className="text-slate-700 font-medium leading-relaxed">
                      {concept.definition}
                    </p>
                  </div>
                )}
              </div>

              {/* 오른쪽: 공식 */}
              {concept.formulas && concept.formulas.length > 0 && (
                <div className="lg:w-[420px] bg-amber-50/60 border-t lg:border-t-0 lg:border-l border-amber-100 p-8 flex flex-col justify-center">
                  <div className="mb-4 flex items-center gap-2 text-amber-700 font-bold text-sm uppercase tracking-wide">
                    <Calculator size={16} /> Essential Formulas
                  </div>
                  <div className="space-y-6">
                    {concept.formulas.map((formula, fIdx) => (
                      <div 
                        key={fIdx} 
                        className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm overflow-x-auto flex justify-center items-center min-h-[80px]"
                      >
                        <div className="text-xl text-slate-800">
                          <BlockMath math={formula} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-16 text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            등록된 핵심 개념이 없습니다.
          </div>
        )}
      </div>
    </section>
  );
};

export default ChapterFeedCard;