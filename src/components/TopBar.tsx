import React from "react";

export type AppView = "studio" | "dna" | "saved";

interface TopBarProps {
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  onNewCampaign: () => void;
  savedCount: number;
  isGenerating: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  onSelectView,
  onNewCampaign,
  savedCount,
  isGenerating,
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-sm border-b border-zinc-200 px-6 lg:px-8 flex items-center justify-between gap-8">
      <a
        href="#studio"
        onClick={(e) => {
          e.preventDefault();
          onSelectView("studio");
        }}
        className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
      >
        Brand Builder
      </a>

      <nav
        aria-label="Primary"
        className="hidden md:flex items-center gap-7 text-sm font-medium"
      >
        <button
          type="button"
          onClick={() => onSelectView("studio")}
          className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
            activeView === "studio"
              ? "border-blue-600 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Campaign Studio
        </button>
        <button
          type="button"
          onClick={() => onSelectView("dna")}
          className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
            activeView === "dna"
              ? "border-blue-600 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Brand DNA
        </button>
        <button
          type="button"
          onClick={() => onSelectView("saved")}
          className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 tabular-nums ${
            activeView === "saved"
              ? "border-blue-600 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Saved Kits ({savedCount})
        </button>
      </nav>

      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={onNewCampaign}
          disabled={isGenerating}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          New Campaign
        </button>
      </div>
    </header>
  );
};
