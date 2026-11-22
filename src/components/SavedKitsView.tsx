import React from "react";
import { Trash2, FolderOpen, BookmarkPlus } from "lucide-react";
import type { BrandCampaign } from "../types/brand.ts";

interface SavedKitsViewProps {
  savedKits: BrandCampaign[];
  activeCampaignId: string;
  onSaveCurrent: () => void;
  onLoadKit: (kit: BrandCampaign) => void;
  onDeleteKit: (id: string) => void;
}

export const SavedKitsView: React.FC<SavedKitsViewProps> = ({
  savedKits,
  activeCampaignId,
  onSaveCurrent,
  onLoadKit,
  onDeleteKit,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Campaign Archive · Browser Storage
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Saved Brand Kits
          </h1>
        </div>
        <button
          type="button"
          onClick={onSaveCurrent}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg inline-flex items-center gap-2 cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <BookmarkPlus className="w-4 h-4" />
          Save Active Campaign
        </button>
      </div>

      {savedKits.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center space-y-3">
          <p className="text-sm font-medium text-slate-900">
            No saved brand kits yet
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Generate a campaign in the studio or click “Save Active Campaign”
            above to keep a copy of your anchor shot and medium renders.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedKits.map((kit) => {
            const readyCount = Object.values(kit.shots).filter(
              (s) => s.status === "ready" && s.imageUrl
            ).length;
            const isCurrent = kit.id === activeCampaignId;
            return (
              <article
                key={kit.id}
                className="bg-white border border-zinc-200 rounded-xl overflow-hidden flex flex-col"
              >
                <div className="aspect-video bg-zinc-100 border-b border-zinc-100 overflow-hidden grid grid-cols-2 gap-px">
                  {kit.anchorImageUrl ? (
                    <img
                      src={kit.anchorImageUrl}
                      alt={kit.productName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="bg-zinc-100" />
                  )}
                  {Object.values(kit.shots).find((s) => s.imageUrl)
                    ?.imageUrl ? (
                    <img
                      src={
                        Object.values(kit.shots).find((s) => s.imageUrl)!
                          .imageUrl!
                      }
                      alt={`${kit.productName} medium preview`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="bg-zinc-100" />
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-900 truncate">
                        {kit.productName}
                      </h3>
                      {isCurrent && (
                        <span className="text-[11px] font-medium text-blue-600 shrink-0">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 tabular-nums">
                      {readyCount} mediums ·{" "}
                      {new Date(kit.updatedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {kit.productDescription}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-zinc-100">
                    <button
                      type="button"
                      onClick={() => onLoadKit(kit)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      Open in Studio
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteKit(kit.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                      aria-label={`Delete ${kit.productName}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
