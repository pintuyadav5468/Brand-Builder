import React, { useRef } from "react";
import { RefreshCw, Upload, Layers, Image as ImageIcon } from "lucide-react";
import type { BrandDnaSpec, NanoBananaModel, ShotStatus } from "../types/brand.ts";
import { readFileAsDataUrl } from "../utils/imageHelpers.ts";

interface AnchorBannerProps {
  anchorImageUrl: string | null;
  anchorStatus: ShotStatus;
  anchorError?: string;
  dna: BrandDnaSpec;
  model: NanoBananaModel;
  isBusy: boolean;
  onRegenerateAnchor: () => void;
  onSwapAnchorImage: (dataUrl: string) => void;
  onSyncAllMediums: () => void;
  onInspectAnchor: () => void;
}

export const AnchorBanner: React.FC<AnchorBannerProps> = ({
  anchorImageUrl,
  anchorStatus,
  anchorError,
  dna,
  model,
  isBusy,
  onRegenerateAnchor,
  onSwapAnchorImage,
  onSyncAllMediums,
  onInspectAnchor,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      onSwapAnchorImage(dataUrl);
    } finally {
      e.target.value = "";
    }
  };

  return (
    <section
      aria-label="Master Product Anchor"
      className="bg-white border border-zinc-200 rounded-xl p-5 sm:p-6"
    >
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="w-36 h-36 sm:w-44 sm:h-44 shrink-0 rounded-lg border border-zinc-200 bg-zinc-100 overflow-hidden relative">
          {anchorStatus === "generating" ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center animate-pulse bg-zinc-100">
              <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
              <span className="text-xs font-medium text-slate-600">
                Locking Anchor
              </span>
            </div>
          ) : anchorImageUrl ? (
            <button
              type="button"
              onClick={onInspectAnchor}
              className="w-full h-full block group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-label="Inspect Master Anchor Image"
            >
              <img
                src={anchorImageUrl}
                alt={`${dna.productName} master anchor reference`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
              />
            </button>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-slate-400">
              <ImageIcon className="w-6 h-6 mb-1.5" />
              <span className="text-xs">No anchor yet</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-slate-700">
              Master Product Anchor
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">1:1 Reference</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{model}</span>
          </div>

          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {dna.productName}
            </h1>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed max-w-2xl">
              “{dna.headline}” — {dna.tagline}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <div className="flex items-center gap-2">
              {dna.colorPalette.map((swatch) => (
                <div
                  key={`${swatch.name}-${swatch.hex}`}
                  className="flex items-center gap-1.5 text-xs text-slate-600"
                  title={`${swatch.name} (${swatch.hex})`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-sm border border-zinc-300 shrink-0"
                    style={{ backgroundColor: swatch.hex }}
                  />
                  <span className="font-mono text-[11px] tabular-nums">
                    {swatch.hex}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {anchorError && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {anchorError}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onRegenerateAnchor}
              disabled={isBusy}
              className="px-3.5 py-2 text-xs font-medium text-slate-800 bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 disabled:opacity-50 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate Anchor
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={isBusy}
              className="px-3.5 py-2 text-xs font-medium text-slate-800 bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 disabled:opacity-50 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5" />
              Swap Reference Photo
            </button>

            <button
              type="button"
              onClick={onSyncAllMediums}
              disabled={isBusy || !anchorImageUrl}
              className="px-3.5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Layers className="w-3.5 h-3.5" />
              Sync All Mediums to Anchor
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
