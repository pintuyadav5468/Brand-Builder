import React, { useEffect, useState } from "react";
import { Download, Columns2, RefreshCw, X } from "lucide-react";
import type { MediumShot } from "../types/brand.ts";
import { downloadImageUrl, sanitizeSlug } from "../utils/imageHelpers.ts";

interface LightboxModalProps {
  shot: MediumShot | null;
  anchorImageUrl: string | null;
  productName: string;
  isAnchorView?: boolean;
  onClose: () => void;
  onRegenerate?: (mediumId: string) => void;
  onRefine?: (mediumId: string, instruction: string) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  shot,
  anchorImageUrl,
  productName,
  isAnchorView = false,
  onClose,
  onRegenerate,
  onRefine,
}) => {
  const [compareAnchor, setCompareAnchor] = useState(false);
  const [instruction, setInstruction] = useState("");

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!shot && !isAnchorView) return null;

  const displayUrl = isAnchorView ? anchorImageUrl : shot?.imageUrl;
  const displayTitle = isAnchorView
    ? `${productName} — Master Product Anchor`
    : `${productName} — ${shot?.label}`;

  if (!displayUrl) return null;

  const handleRefine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shot || !onRefine || !instruction.trim()) return;
    onRefine(shot.mediumId, instruction.trim());
    setInstruction("");
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={displayTitle}
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-900 truncate">
              {displayTitle}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
              {isAnchorView
                ? "1:1 Studio Master Reference · Zero people"
                : `${shot?.aspectRatio} · ${shot?.formatSummary} · Zero people`}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isAnchorView && anchorImageUrl && (
              <button
                type="button"
                onClick={() => setCompareAnchor((prev) => !prev)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  compareAnchor
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-zinc-200 text-slate-700 hover:bg-zinc-50"
                }`}
              >
                <Columns2 className="w-3.5 h-3.5" />
                Compare Anchor
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                downloadImageUrl(
                  displayUrl,
                  `${sanitizeSlug(displayTitle)}.jpg`
                )
              }
              className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close lightbox"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-zinc-100 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-zinc-100 p-4 sm:p-6 flex items-center justify-center">
          {compareAnchor && anchorImageUrl && !isAnchorView ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full items-center">
              <div className="bg-white p-3 rounded-lg border border-zinc-200 flex flex-col items-center">
                <span className="text-xs font-medium text-slate-600 mb-2 self-start">
                  Master Product Anchor (1:1)
                </span>
                <img
                  src={anchorImageUrl}
                  alt={`${productName} master anchor`}
                  referrerPolicy="no-referrer"
                  className="max-h-[60vh] w-auto object-contain rounded"
                />
              </div>
              <div className="bg-white p-3 rounded-lg border border-zinc-200 flex flex-col items-center">
                <span className="text-xs font-medium text-slate-600 mb-2 self-start">
                  {shot?.label} ({shot?.aspectRatio})
                </span>
                <img
                  src={displayUrl}
                  alt={displayTitle}
                  referrerPolicy="no-referrer"
                  className="max-h-[60vh] w-auto object-contain rounded"
                />
              </div>
            </div>
          ) : (
            <img
              src={displayUrl}
              alt={displayTitle}
              referrerPolicy="no-referrer"
              className="max-h-[68vh] w-auto object-contain rounded-lg shadow-sm"
            />
          )}
        </div>

        {!isAnchorView && shot && onRefine && onRegenerate && (
          <div className="px-5 py-3.5 border-t border-zinc-200 bg-white flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <form onSubmit={handleRefine} className="flex-1 flex gap-2">
              <input
                type="text"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="Refine scene while locking product (e.g., Shift to dusk lighting, add architectural concrete wall)..."
                className="flex-1 px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
              />
              <button
                type="submit"
                disabled={!instruction.trim()}
                className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg cursor-pointer whitespace-nowrap"
              >
                Refine with Nano-Banana
              </button>
            </form>
            <button
              type="button"
              onClick={() => {
                onRegenerate(shot.mediumId);
                onClose();
              }}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 border border-zinc-200 hover:bg-zinc-50 rounded-lg inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate Shot
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
