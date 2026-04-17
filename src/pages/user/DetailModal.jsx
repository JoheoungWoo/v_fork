import { AutoMathRenderer } from "@/components/common/MathRichText";
import { normalizeLatexText } from "@/utils/mathRichTextUtils";
import {
  getVideoCatalogSubtitle,
  getVideoHeadline,
} from "@/utils/videoHeadings";
import { X } from "lucide-react";

const DetailModal = ({ video, onClose, onRead }) => {
  if (!video) return null;
  const v = video;
  if (!v) return null;
  const headline = getVideoHeadline(v);
  const catalogSubtitle = getVideoCatalogSubtitle(v);
  const readId = v.lecture_id || v.id;

  const descriptionText = v.description?.trim()
    ? normalizeLatexText(v.description)
    : "";
  const detailsText = v.details?.trim() ? normalizeLatexText(v.details) : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full min-w-0 max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[75vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 border-b border-gray-100 flex justify-between items-start shrink-0">
          <div>
            <div className="bg-[#e5edff] text-[#0047a5] px-3 py-1 rounded text-xs font-bold uppercase tracking-widest mb-3 inline-block">
              강의 상세 안내
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">
              {headline}
            </h2>
            {catalogSubtitle && (
              <p className="mt-2 text-lg text-slate-500 font-medium">
                {catalogSubtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors p-2 -mr-2"
          >
            <X size={32} />
          </button>
        </div>

        {/* 설명과 상세 내용이 길어지면 전체적으로 스크롤되는 몸통 영역 */}
        <div className="p-8 pr-6 min-w-0 overflow-x-hidden overflow-y-auto">
          <div className="space-y-10 min-w-0">
            <section>
              <h3 className="text-sm font-bold text-[#0047a5] uppercase tracking-wider mb-3">
                설명
              </h3>
              {v.category ? (
                <p className="text-sm text-slate-500 mb-3">
                  <span className="font-semibold text-gray-700">카테고리</span>
                  <span className="mx-1.5 text-gray-300">·</span>
                  <span className="text-gray-800">{v.category}</span>
                </p>
              ) : null}
              {descriptionText ? (
                <div className="text-xl text-gray-600 leading-relaxed font-medium w-full whitespace-pre-wrap break-words [word-break:keep-all]">
                  <AutoMathRenderer text={descriptionText} isBlock />
                </div>
              ) : (
                <p className="text-xl text-gray-500">설명이 없습니다.</p>
              )}
            </section>

            {(v.subject || detailsText) && (
              <section className="min-w-0">
                <h3 className="text-sm font-bold text-[#0047a5] uppercase tracking-wider mb-3">
                  상세
                </h3>
                {v.subject ? (
                  <p className="text-sm text-slate-500 mb-3">
                    <span className="font-semibold text-gray-700">과목명</span>
                    <span className="mx-1.5 text-gray-300">·</span>
                    <span className="text-gray-800">{v.subject}</span>
                  </p>
                ) : null}

                {detailsText ? (
                  <div className="w-full">
                    <div className="text-lg text-gray-600 leading-relaxed font-medium w-full whitespace-pre-wrap break-words [word-break:keep-all]">
                      <AutoMathRenderer text={detailsText} isBlock />
                    </div>
                  </div>
                ) : null}
              </section>
            )}
          </div>
        </div>

        <div className="p-8 bg-gray-50 flex flex-col gap-4 shrink-0 rounded-b-2xl border-t border-gray-100">
          <button
            onClick={() => {
              onClose();
              if (readId != null && readId !== "") onRead(readId);
            }}
            className="w-full py-5 bg-[#0047a5] text-white text-xl font-extrabold rounded-xl shadow-lg hover:bg-blue-800 transition-colors"
          >
            지금 바로 학습 시작하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
