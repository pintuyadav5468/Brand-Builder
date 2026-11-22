import React, { useEffect, useState } from "react";
import {
  Download,
  Maximize2,
  RefreshCw,
  SlidersHorizontal,
  ImageOff,
} from "lucide-react";
import type { AspectRatio, MediumShot } from "../types/brand.ts";
import { downloadImageUrl, sanitizeSlug } from "../utils/imageHelpers.ts";

interface MediumCardProps {
  shot: MediumShot;
  productName: string;
  hasAnchor: boolean;
  onInspect: (shot: MediumShot) => void;
  onRegenerate: (mediumId: string) => void;
  onRefine: (mediumId: string, instruction: string) => void;
}

function getAspectClass(ratio: AspectRatio): string {
  switch (ratio) {
    case "16:9":
      return "aspect-video";
    case "3:4":
      return "aspect-[3/4]";
    case "4:3":
      return "aspect-[4/3]";
    case "9:16":
      return "aspect-[9/16]";
    case "1:1":
    default:
      return "aspect-square";
  }
}

export const MediumCard: React.FC<MediumCardProps> = ({
  shot,
  productName,
  hasAnchor,
  onInspect,
  onRegenerate,
  onRefine,
}) => {
  const [showRefine, setShowRefine] = useState(false);
  const [refineText, setRefineText] = useState("");
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [shot.imageUrl]);

  const aspectClass = getAspectClass(shot.aspectRatio);

  const handleRefineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refineText.trim()) return;
    onRefine(shot.mediumId, refineText.trim());
    setRefineText("");
    setShowRefine(false);
  };

  return (
    <article className="bg-white border border-zinc-200 rounded-xl overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 truncate">
            {shot.label}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 tabular-nums">
            <span className="font-mono">{shot.aspectRatio}</span>
            <span aria-hidden="true">·</span>
            <span>{shot.formatSummary}</span>
            {shot.modelUsed && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  {shot.modelUsed === "gemini-nano-banana-2.1"
                    ? "Nano-Banana 2.1"
                    : "Nano-Banana"}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {shot.imageUrl && shot.status === "ready" && (
            <>
              <button
                type="button"
                onClick={() => onInspect(shot)}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-zinc-100 rounded-md transition-colors cursor-pointer"
                title="Inspect & Compare with Anchor"
                aria-label={`Inspect ${shot.label}`}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadImageUrl(
                    shot.imageUrl!,
                    `${sanitizeSlug(productName)}-${sanitizeSlug(shot.label)}.jpg`
                  )
                }
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-zinc-100 rounded-md transition-colors cursor-pointer"
                title="Download Image"
                aria-label={`Download ${shot.label}`}
              >
                <Download className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className={`relative w-full bg-zinc-100 overflow-hidden ${aspectClass}`}>
        {shot.status === "generating" ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-zinc-100 animate-pulse">
            <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-medium text-slate-700">
              Rendering {shot.label}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Locking product consistency · Zero people
            </p>
          </div>
        ) : shot.status === "error" ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-zinc-50">
            <p className="text-xs font-semibold text-red-700 mb-1">
              Generation failed
            </p>
            <p className="text-xs text-slate-600 max-w-xs leading-relaxed mb-4">
              {shot.error || "Unable to render this medium right now."}
            </p>
            <button
              type="button"
              onClick={() => onRegenerate(shot.mediumId)}
              disabled={!hasAnchor}
              className="px-3.5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry {shot.label}
            </button>
          </div>
        ) : shot.imageUrl && !imgFailed ? (
          <button
            type="button"
            onClick={() => onInspect(shot)}
            className="w-full h-full block group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            aria-label={`Open ${shot.label} in fullscreen lightbox`}
          >
            <img
              src={shot.imageUrl}
              alt={`${productName} rendered in ${shot.label}`}
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </button>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-zinc-100 to-zinc-200/70">
            <ImageOff className="w-6 h-6 text-slate-400 mb-2" />
            <p className="text-xs font-medium text-slate-700">{shot.label}</p>
            <p className="text-[11px] text-slate-500 mt-1 mb-3">
              Ready to render from Master Anchor
            </p>
            <button
              type="button"
              onClick={() => onRegenerate(shot.mediumId)}
              disabled={!hasAnchor}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg cursor-pointer"
            >
              Generate Shot
            </button>
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-zinc-100 bg-white space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onRegenerate(shot.mediumId)}
            disabled={!hasAnchor || shot.status === "generating"}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-zinc-100 hover:bg-zinc-200/80 disabled:opacity-50 rounded-md inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerate
          </button>

          <button
            type="button"
            onClick={() => setShowRefine((prev) => !prev)}
            disabled={!hasAnchor || shot.status === "generating"}
            className={`px-3 py-1.5 text-xs font-medium rounded-md inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 ${
              showRefine
                ? "bg-blue-50 text-blue-700"
                : "text-slate-700 hover:text-slate-900 hover:bg-zinc-100"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Refine Scene
          </button>
        </div>

        {showRefine && (
          <form onSubmit={handleRefineSubmit} className="flex gap-2 pt-1">
            <input
              type="text"
              value={refineText}
              onChange={(e) => setRefineText(e.target.value)}
              placeholder="e.g., Dusk blue hour lighting, brutalist concrete wall..."
              className="flex-1 min-w-0 px-2.5 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
            />
            <button
              type="submit"
              disabled={!refineText.trim()}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md cursor-pointer whitespace-nowrap shrink-0"
            >
              Apply
            </button>
          </form>
        )}
      </div>
    </article>
  );
};
