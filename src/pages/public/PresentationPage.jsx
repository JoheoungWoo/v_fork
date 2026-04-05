import katex from "katex";
import "katex/dist/katex.min.css";
import { useCallback, useEffect, useRef, useState } from "react";

const InlineMath = ({ math }) => {
  const html = katex.renderToString(math, {
    throwOnError: false,
    displayMode: false,
  });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const BlockMath = ({ math }) => {
  const html = katex.renderToString(math, {
    throwOnError: false,
    displayMode: true,
  });
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};
const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

// 📌 챕터 카드 컴포넌트
function ChapterCard({ item }) {
  console.log("item:", item);
  // ✅ [수정] 백엔드에서 이미 배열로 오므로 파싱 불필요
  const concepts = item.concepts || [];

  return (
    <section className="w-full mb-16 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
      {/* 헤더 */}
      <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <span className="px-4 py-2 bg-blue-600 text-white rounded-lg text-lg font-black shadow-md tracking-wide">
            {item.code}
          </span>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            {item.title}
          </h2>
        </div>
      </div>

      {/* 본문 */}
      <div className="p-10 bg-white">
        {concepts.length > 0 ? (
          <div className="flex flex-col gap-8">
            {concepts.map((concept, idx) => (
              <div
                key={idx}
                className="flex flex-col xl:flex-row gap-8 p-8 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group"
              >
                {/* 좌측: 개념 설명 */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                    <h3 className="text-2xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                      {concept.name}
                    </h3>
                  </div>
                  <p className="text-xl text-slate-600 leading-relaxed font-medium pl-5">
                    {concept.summary || "설명이 없습니다."}
                  </p>
                  {concept.definition && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl border-l-4 border-slate-400 ml-5">
                      <span className="text-sm font-bold text-slate-500 uppercase block mb-1">
                        Definition
                      </span>
                      <p className="text-lg text-slate-700">
                        {concept.definition}
                      </p>
                    </div>
                  )}
                </div>

                {/* 우측: 공식 */}
                {concept.formulas && concept.formulas.length > 0 && (
                  <div className="xl:w-[450px] flex-shrink-0 flex flex-col justify-center">
                    <div className="bg-amber-50 rounded-2xl border border-amber-100 p-6 shadow-sm group-hover:border-amber-300 transition-colors">
                      <h4 className="text-sm font-bold text-amber-600 mb-4 uppercase tracking-wider flex items-center gap-2">
                        <span>📐 Essential Formula</span>
                      </h4>
                      <div className="space-y-6">
                        {concept.formulas.map((f, fIdx) => (
                          <div
                            key={fIdx}
                            className="overflow-x-auto py-2 flex justify-center"
                          >
                            <span className="text-2xl text-slate-800">
                              <BlockMath math={f} />
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400 text-xl font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            등록된 핵심 개념이 없습니다.
          </div>
        )}
      </div>
    </section>
  );
}

// 📌 메인 페이지 (무한 스크롤)
export default function PresentationPage() {
  const [items, setItems] = useState([]);
  const [lastOrder, setLastOrder] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // ✅ 더 불러올 데이터가 있는지 확인
  const sentinelRef = useRef(null);

  const fetchNext = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      // API 호출
      const res = await fetch(
        `${API_BASE}/api/presentation/chapters?after=${lastOrder}&limit=3`,
      );
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        setItems((prev) => {
          // 중복 제거 (혹시 모를 중복 방지)
          const newItems = data.filter(
            (d) => !prev.some((p) => p.code === d.code),
          );
          return [...prev, ...newItems];
        });

        // 다음 order 값 업데이트 (마지막 아이템 기준)
        const lastItem = data[data.length - 1];
        setLastOrder(lastItem.order || lastOrder + 1);
      } else {
        setHasMore(false); // 더 이상 데이터 없음
      }
    } catch (e) {
      console.error("데이터 로딩 실패:", e);
    } finally {
      setLoading(false);
    }
  }, [lastOrder, loading, hasMore]);

  // Intersection Observer 설정
  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) fetchNext();
      },
      { threshold: 0.1 },
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [fetchNext, hasMore]);

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 md:px-8">
      <div className="w-full mx-auto max-w-7xl">
        {" "}
        {/* 너무 넓어지지 않게 max-w 설정 권장 */}
        <header className="mb-16 text-center">
          <h1 className="text-5xl font-black text-slate-800 mb-4 tracking-tight">
            전기기사 핵심 요약 노트
          </h1>
          <p className="text-xl text-slate-500 font-medium">
            주요 개념과 공식을 한눈에 학습하세요.
          </p>
        </header>
        {items.map((item) => (
          <ChapterCard key={item.code} item={item} />
        ))}
        <div
          ref={sentinelRef}
          className="h-40 flex justify-center items-center text-2xl text-gray-500 font-bold"
        >
          {loading && (
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              Loading...
            </div>
          )}
          {!hasMore && !loading && (
            <span className="opacity-50 text-base">
              모든 내용을 불러왔습니다.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
