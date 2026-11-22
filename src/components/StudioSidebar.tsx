import React, { useRef, useState } from "react";
import { Plus, Upload, X, Check } from "lucide-react";
import type {
  AspectRatio,
  ImageResolution,
  MediumDefinition,
  MediumId,
  NanoBananaModel,
  ProductPreset,
} from "../types/brand.ts";
import { PRODUCT_PRESETS } from "../data/presets.ts";
import { readFileAsDataUrl } from "../utils/imageHelpers.ts";

interface StudioSidebarProps {
  productName: string;
  productDescription: string;
  brandTone: string;
  model: NanoBananaModel;
  imageSize: ImageResolution;
  allMediums: MediumDefinition[];
  selectedMediumIds: MediumId[];
  uploadedReferenceUrl: string | null;
  isGenerating: boolean;
  onChangeProductName: (val: string) => void;
  onChangeProductDescription: (val: string) => void;
  onChangeBrandTone: (val: string) => void;
  onChangeModel: (model: NanoBananaModel) => void;
  onChangeImageSize: (size: ImageResolution) => void;
  onToggleMedium: (id: MediumId) => void;
  onAddCustomMedium: (medium: MediumDefinition) => void;
  onApplyPreset: (preset: ProductPreset) => void;
  onUploadReference: (dataUrl: string | null) => void;
  onBuildCampaign: () => void;
}

export const StudioSidebar: React.FC<StudioSidebarProps> = ({
  productName,
  productDescription,
  brandTone,
  model,
  imageSize,
  allMediums,
  selectedMediumIds,
  uploadedReferenceUrl,
  isGenerating,
  onChangeProductName,
  onChangeProductDescription,
  onChangeBrandTone,
  onChangeModel,
  onChangeImageSize,
  onToggleMedium,
  onAddCustomMedium,
  onApplyPreset,
  onUploadReference,
  onBuildCampaign,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [customAspect, setCustomAspect] = useState<AspectRatio>("4:3");
  const [customCue, setCustomCue] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      onUploadReference(dataUrl);
    } catch {
      // handled silently if canceled
    } finally {
      e.target.value = "";
    }
  };

  const handleCreateCustomMedium = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLabel.trim() || !customCue.trim()) return;
    const slug = customLabel
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    const newMedium: MediumDefinition = {
      id: `custom-${slug}-${Date.now()}`,
      label: customLabel.trim(),
      aspectRatio: customAspect,
      formatSummary: `Custom ${customAspect}`,
      artDirectionCue: customCue.trim(),
      isCustom: true,
    };
    onAddCustomMedium(newMedium);
    setCustomLabel("");
    setCustomCue("");
    setShowCustomForm(false);
  };

  const canSubmit =
    productName.trim().length > 0 &&
    productDescription.trim().length > 0 &&
    selectedMediumIds.length > 0 &&
    !isGenerating;

  return (
    <aside className="w-full lg:w-[400px] xl:w-[420px] shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-zinc-200 p-6 space-y-7">
      <div>
        <div className="flex items-baseline justify-between gap-2 mb-3">
          <h2 className="text-base font-semibold text-slate-900">
            Product Brief
          </h2>
          <span className="text-xs text-slate-500">Starter Presets</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-100 rounded-lg">
          {PRODUCT_PRESETS.map((preset) => {
            const isActive =
              productName.trim().toLowerCase() ===
              preset.productName.toLowerCase();
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onApplyPreset(preset)}
                className={`px-2.5 py-2 text-xs font-medium rounded-md text-left truncate transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="product-name"
            className="block text-xs font-medium text-slate-700 mb-1.5"
          >
            Product Name
          </label>
          <input
            id="product-name"
            type="text"
            value={productName}
            onChange={(e) => onChangeProductName(e.target.value)}
            placeholder="e.g., Vespera M1 Espresso Grinder"
            className="w-full px-3 py-2.5 text-sm bg-white border border-zinc-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <div>
          <label
            htmlFor="brand-tone"
            className="block text-xs font-medium text-slate-700 mb-1.5"
          >
            Art Direction & Tone
          </label>
          <input
            id="brand-tone"
            type="text"
            value={brandTone}
            onChange={(e) => onChangeBrandTone(e.target.value)}
            placeholder="e.g., Precision architectural minimalism"
            className="w-full px-3 py-2.5 text-sm bg-white border border-zinc-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <div>
          <label
            htmlFor="product-description"
            className="block text-xs font-medium text-slate-700 mb-1.5"
          >
            Physical Product Description
          </label>
          <textarea
            id="product-description"
            rows={4}
            value={productDescription}
            onChange={(e) => onChangeProductDescription(e.target.value)}
            placeholder="Describe exact geometry, materials, colors, hardware details, and label placement for consistent rendering across shots..."
            className="w-full px-3 py-2.5 text-sm leading-relaxed bg-white border border-zinc-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-y"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-700">
              Optional Product Reference Photo
            </span>
            {uploadedReferenceUrl && (
              <button
                type="button"
                onClick={() => onUploadReference(null)}
                className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Remove
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          {uploadedReferenceUrl ? (
            <div className="flex items-center gap-3 p-2.5 border border-zinc-200 rounded-lg bg-zinc-50">
              <img
                src={uploadedReferenceUrl}
                alt="Uploaded product reference"
                referrerPolicy="no-referrer"
                className="w-14 h-14 object-cover rounded-md border border-zinc-200 bg-white shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-900 truncate">
                  Custom reference attached
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Nano-Banana will lock to this product.
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 border border-zinc-200 bg-white rounded-md cursor-pointer whitespace-nowrap shrink-0"
              >
                Replace
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-3 py-2.5 border border-dashed border-zinc-300 hover:border-blue-600 rounded-lg text-xs font-medium text-slate-600 hover:text-blue-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Attach existing product photo (optional)
            </button>
          )}
        </div>
      </div>

      <div className="pt-5 border-t border-zinc-200 space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-medium text-slate-700">
            Nano-Banana Model
          </span>
          <span className="font-mono text-[11px] text-slate-500">
            {model}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-100 rounded-lg">
          <button
            type="button"
            onClick={() => onChangeModel("gemini-3.1-flash-lite-image")}
            className={`px-3 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              model === "gemini-3.1-flash-lite-image"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Nano-Banana
          </button>
          <button
            type="button"
            onClick={() => onChangeModel("gemini-nano-banana-2.1")}
            className={`px-3 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              model === "gemini-nano-banana-2.1"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Nano-Banana 2.1
          </button>
        </div>

        {model === "gemini-nano-banana-2.1" && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-600">Output Resolution</span>
            <div className="flex items-center gap-1 p-0.5 bg-zinc-100 rounded-md">
              {(["1K", "2K"] as ImageResolution[]).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onChangeImageSize(size)}
                  className={`px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
                    imageSize === size
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-5 border-t border-zinc-200 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-slate-700">
            Campaign Mediums ({selectedMediumIds.length} selected)
          </h3>
          <button
            type="button"
            onClick={() => setShowCustomForm((prev) => !prev)}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Custom Medium
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {allMediums.map((m) => {
            const selected = selectedMediumIds.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onToggleMedium(m.id)}
                className={`px-3 py-2.5 rounded-lg border text-left transition-colors cursor-pointer flex items-start justify-between gap-2 ${
                  selected
                    ? "border-blue-600 bg-blue-50/60 text-slate-900"
                    : "border-zinc-200 bg-white text-slate-600 hover:border-zinc-300 hover:text-slate-900"
                }`}
              >
                <div className="min-w-0">
                  <div className="text-xs font-medium truncate">{m.label}</div>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5 tabular-nums">
                    {m.aspectRatio}
                  </div>
                </div>
                {selected && (
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {showCustomForm && (
          <form
            onSubmit={handleCreateCustomMedium}
            className="p-3 border border-zinc-200 rounded-lg bg-zinc-50 space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-900">
                Add Custom Medium
              </span>
              <button
                type="button"
                onClick={() => setShowCustomForm(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
                aria-label="Close custom medium form"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="e.g., Bus Shelter"
                className="col-span-2 px-2.5 py-1.5 text-xs bg-white border border-zinc-200 rounded-md focus:outline-none focus:border-blue-600"
              />
              <select
                value={customAspect}
                onChange={(e) => setCustomAspect(e.target.value as AspectRatio)}
                className="px-2 py-1.5 text-xs font-mono bg-white border border-zinc-200 rounded-md focus:outline-none focus:border-blue-600"
              >
                <option value="16:9">16:9</option>
                <option value="3:4">3:4</option>
                <option value="1:1">1:1</option>
                <option value="4:3">4:3</option>
                <option value="9:16">9:16</option>
              </select>
            </div>
            <textarea
              rows={2}
              value={customCue}
              onChange={(e) => setCustomCue(e.target.value)}
              placeholder="Scene direction (e.g., Illuminated glass transit shelter on an empty rain-slicked avenue at dusk...)"
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-zinc-200 rounded-md focus:outline-none focus:border-blue-600"
            />
            <button
              type="submit"
              className="w-full py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md cursor-pointer"
            >
              Add to Campaign
            </button>
          </form>
        )}
      </div>

      <div className="pt-4 border-t border-zinc-200 space-y-3">
        <p className="text-xs text-slate-500 leading-relaxed">
          Product consistency lock active · Strictly zero people, hands, or
          bystanders in every generated frame.
        </p>
        <button
          type="button"
          onClick={onBuildCampaign}
          disabled={!canSubmit}
          className="w-full py-3 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          {isGenerating ? "Rendering Campaign..." : "Build Brand Campaign"}
        </button>
      </div>
    </aside>
  );
};
