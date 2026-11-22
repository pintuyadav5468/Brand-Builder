import React, { useEffect, useState } from "react";
import { Check, Layers } from "lucide-react";
import type { BrandDnaSpec } from "../types/brand.ts";

interface BrandDnaViewProps {
  dna: BrandDnaSpec;
  anchorImageUrl: string | null;
  isBusy: boolean;
  onUpdateDna: (updated: BrandDnaSpec) => void;
  onSyncAllMediums: () => void;
}

export const BrandDnaView: React.FC<BrandDnaViewProps> = ({
  dna,
  anchorImageUrl,
  isBusy,
  onUpdateDna,
  onSyncAllMediums,
}) => {
  const [draft, setDraft] = useState<BrandDnaSpec>(dna);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setDraft(dna);
  }, [dna]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateDna(draft);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Locked Brand Specification · {dna.category}
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 mt-1">
            {dna.productName} Brand DNA
          </h1>
        </div>
        <button
          type="button"
          onClick={onSyncAllMediums}
          disabled={isBusy || !anchorImageUrl}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg inline-flex items-center gap-2 cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Layers className="w-4 h-4" />
          Re-Render All Mediums with DNA
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Master Anchor Reference
            </h2>
            <div className="aspect-square rounded-lg border border-zinc-200 bg-zinc-100 overflow-hidden">
              {anchorImageUrl ? (
                <img
                  src={anchorImageUrl}
                  alt={dna.productName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                  No anchor generated yet
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100">
            <h3 className="text-xs font-medium text-slate-500 mb-3">
              Palette Specification
            </h3>
            <div className="space-y-2.5">
              {draft.colorPalette.map((swatch, idx) => (
                <div
                  key={`${swatch.name}-${idx}`}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-5 h-5 rounded border border-zinc-200 shrink-0"
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <span className="text-xs font-medium text-slate-800 truncate">
                      {swatch.name}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-slate-500 tabular-nums">
                    {swatch.hex}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSave}
          className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl p-6 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Campaign Headline
              </label>
              <input
                type="text"
                value={draft.headline}
                onChange={(e) =>
                  setDraft({ ...draft, headline: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Category
              </label>
              <input
                type="text"
                value={draft.category}
                onChange={(e) =>
                  setDraft({ ...draft, category: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Editorial Tagline
            </label>
            <input
              type="text"
              value={draft.tagline}
              onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Locked Visual Signature (Shared Across All Mediums)
            </label>
            <textarea
              rows={3}
              value={draft.visualSignature}
              onChange={(e) =>
                setDraft({ ...draft, visualSignature: e.target.value })
              }
              className="w-full px-3 py-2 text-sm leading-relaxed bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Materials & Surface Finish
            </label>
            <textarea
              rows={2}
              value={draft.materialsAndFinish}
              onChange={(e) =>
                setDraft({ ...draft, materialsAndFinish: e.target.value })
              }
              className="w-full px-3 py-2 text-sm leading-relaxed bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Typography & Layout Direction
            </label>
            <input
              type="text"
              value={draft.typographyDirection}
              onChange={(e) =>
                setDraft({ ...draft, typographyDirection: e.target.value })
              }
              className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {savedNotice ? (
                <span className="text-emerald-700 inline-flex items-center gap-1 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  Brand DNA saved to active campaign
                </span>
              ) : (
                "Changes apply to subsequent medium renders."
              )}
            </span>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              Save Brand DNA
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
