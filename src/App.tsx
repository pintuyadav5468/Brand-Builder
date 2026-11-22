import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, BookmarkPlus, Check, X } from "lucide-react";
import { TopBar, type AppView } from "./components/TopBar.tsx";
import { StudioSidebar } from "./components/StudioSidebar.tsx";
import { AnchorBanner } from "./components/AnchorBanner.tsx";
import { MediumCard } from "./components/MediumCard.tsx";
import { LightboxModal } from "./components/LightboxModal.tsx";
import { BrandDnaView } from "./components/BrandDnaView.tsx";
import { SavedKitsView } from "./components/SavedKitsView.tsx";
import { DEFAULT_MEDIUMS, SAMPLE_CAMPAIGN } from "./data/presets.ts";
import { toDataUrlIfNeeded } from "./utils/imageHelpers.ts";
import type {
  BrandCampaign,
  BrandDnaSpec,
  ImageResolution,
  MediumDefinition,
  MediumId,
  MediumShot,
  NanoBananaModel,
  ProductPreset,
} from "./types/brand.ts";

const STORAGE_KEY = "brand-builder-kits-v1";

function createEmptyCampaign(): BrandCampaign {
  const now = new Date().toISOString();
  const initialSelected: MediumId[] = ["billboard", "newspaper", "social"];
  const shots: Record<MediumId, MediumShot> = {};
  for (const id of initialSelected) {
    const def = DEFAULT_MEDIUMS.find((m) => m.id === id);
    if (def) {
      shots[id] = {
        mediumId: def.id,
        label: def.label,
        aspectRatio: def.aspectRatio,
        formatSummary: def.formatSummary,
        imageUrl: null,
        status: "idle",
      };
    }
  }
  return {
    id: `kit-${Date.now()}`,
    productName: "",
    productDescription: "",
    brandTone: "Precision architectural minimalism",
    model: "gemini-3.1-flash-lite-image",
    imageSize: "1K",
    anchorImageUrl: null,
    anchorStatus: "idle",
    dna: {
      productName: "Untitled Product",
      category: "Consumer Product",
      headline: "BUILT TO ENDURE",
      tagline: "Consistent across every surface and scale.",
      visualSignature: "",
      materialsAndFinish: "",
      colorPalette: [
        { name: "Carbon", hex: "#0F172A" },
        { name: "Paper", hex: "#FAFAFA" },
        { name: "Cobalt", hex: "#2563EB" },
      ],
      typographyDirection:
        "Bold Swiss grotesque headlines with restrained editorial body copy.",
    },
    selectedMediumIds: initialSelected,
    customMediums: [],
    shots,
    createdAt: now,
    updatedAt: now,
  };
}

export default function App() {
  const [activeView, setActiveView] = useState<AppView>("studio");
  const [campaign, setCampaign] = useState<BrandCampaign>(SAMPLE_CAMPAIGN);
  const [uploadedReferenceUrl, setUploadedReferenceUrl] = useState<
    string | null
  >(null);
  const [savedKits, setSavedKits] = useState<BrandCampaign[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as BrandCampaign[];
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });

  const [bannerError, setBannerError] = useState<{
    error: string;
    hint?: string;
  } | null>(null);
  const [savedToast, setSavedToast] = useState(false);

  const [lightboxShotId, setLightboxShotId] = useState<string | null>(null);
  const [lightboxAnchorOpen, setLightboxAnchorOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedKits));
    } catch {
      // ignore quota exceeded for large base64 images
    }
  }, [savedKits]);

  const allMediums = useMemo<MediumDefinition[]>(
    () => [...DEFAULT_MEDIUMS, ...campaign.customMediums],
    [campaign.customMediums]
  );

  const isGeneratingAny = useMemo(() => {
    if (campaign.anchorStatus === "generating") return true;
    return campaign.selectedMediumIds.some(
      (id) => campaign.shots[id]?.status === "generating"
    );
  }, [campaign.anchorStatus, campaign.selectedMediumIds, campaign.shots]);

  const findMediumDef = useCallback(
    (id: MediumId): MediumDefinition | undefined =>
      allMediums.find((m) => m.id === id),
    [allMediums]
  );

  const generateSingleMedium = useCallback(
    async (params: {
      mediumId: MediumId;
      anchorUrl: string;
      dna: BrandDnaSpec;
      productName: string;
      productDescription: string;
      brandTone: string;
      model: NanoBananaModel;
      imageSize: ImageResolution;
      editInstruction?: string;
      previousMediumUrl?: string | null;
    }) => {
      const def = findMediumDef(params.mediumId);
      if (!def) return;

      setCampaign((prev) => ({
        ...prev,
        shots: {
          ...prev.shots,
          [params.mediumId]: {
            mediumId: def.id,
            label: def.label,
            aspectRatio: def.aspectRatio,
            formatSummary: def.formatSummary,
            imageUrl: prev.shots[params.mediumId]?.imageUrl ?? null,
            status: "generating",
            error: undefined,
          },
        },
      }));

      try {
        const anchorDataUrl = await toDataUrlIfNeeded(params.anchorUrl);
        const previousMediumDataUrl =
          params.previousMediumUrl && params.editInstruction
            ? await toDataUrlIfNeeded(params.previousMediumUrl)
            : undefined;

        const res = await fetch("/api/brand/medium", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: params.model,
            imageSize: params.imageSize,
            aspectRatio: def.aspectRatio,
            mediumLabel: def.label,
            mediumArtDirection: def.artDirectionCue,
            productName: params.productName,
            productDescription: params.productDescription,
            brandTone: params.brandTone,
            dna: params.dna,
            anchorImageDataUrl: anchorDataUrl,
            previousMediumDataUrl,
            editInstruction: params.editInstruction,
          }),
        });

        const data = (await res.json()) as {
          imageUrl?: string;
          error?: string;
          hint?: string;
        };

        if (!res.ok || !data.imageUrl) {
          const message = data.hint
            ? `${data.error || "Failed to generate medium."} ${data.hint}`
            : data.error || "Failed to generate medium.";
          setBannerError({
            error: data.error || "Medium generation failed.",
            hint: data.hint,
          });
          setCampaign((prev) => ({
            ...prev,
            shots: {
              ...prev.shots,
              [params.mediumId]: {
                ...prev.shots[params.mediumId],
                mediumId: def.id,
                label: def.label,
                aspectRatio: def.aspectRatio,
                formatSummary: def.formatSummary,
                status: "error",
                error: message,
              },
            },
          }));
          return;
        }

        setCampaign((prev) => ({
          ...prev,
          updatedAt: new Date().toISOString(),
          shots: {
            ...prev.shots,
            [params.mediumId]: {
              mediumId: def.id,
              label: def.label,
              aspectRatio: def.aspectRatio,
              formatSummary: def.formatSummary,
              imageUrl: data.imageUrl!,
              status: "ready",
              error: undefined,
              modelUsed: params.model,
              lastInstruction: params.editInstruction,
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Network error generating shot.";
        setCampaign((prev) => ({
          ...prev,
          shots: {
            ...prev.shots,
            [params.mediumId]: {
              ...prev.shots[params.mediumId],
              mediumId: def.id,
              label: def.label,
              aspectRatio: def.aspectRatio,
              formatSummary: def.formatSummary,
              status: "error",
              error: message,
            },
          },
        }));
      }
    },
    [findMediumDef]
  );

  const handleBuildCampaign = async () => {
    if (
      !campaign.productName.trim() ||
      !campaign.productDescription.trim() ||
      campaign.selectedMediumIds.length === 0
    ) {
      return;
    }

    setBannerError(null);
    const snapshotName = campaign.productName.trim();
    const snapshotDesc = campaign.productDescription.trim();
    const snapshotTone = campaign.brandTone.trim();
    const snapshotModel = campaign.model;
    const snapshotSize = campaign.imageSize;
    const snapshotMediumIds = [...campaign.selectedMediumIds];

    setCampaign((prev) => {
      const nextShots = { ...prev.shots };
      for (const id of snapshotMediumIds) {
        const def = findMediumDef(id);
        if (def) {
          nextShots[id] = {
            mediumId: def.id,
            label: def.label,
            aspectRatio: def.aspectRatio,
            formatSummary: def.formatSummary,
            imageUrl: nextShots[id]?.imageUrl ?? null,
            status: "generating",
            error: undefined,
          };
        }
      }
      return {
        ...prev,
        anchorStatus: "generating",
        anchorError: undefined,
        shots: nextShots,
      };
    });

    try {
      // 1. Synthesize locked Brand DNA specification
      const briefRes = await fetch("/api/brand/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: snapshotName,
          productDescription: snapshotDesc,
          brandTone: snapshotTone,
        }),
      });
      const briefData = (await briefRes.json()) as {
        dna?: BrandDnaSpec;
        error?: string;
        hint?: string;
      };

      if (!briefRes.ok || !briefData.dna) {
        throw new Error(
          briefData.hint
            ? `${briefData.error} ${briefData.hint}`
            : briefData.error || "Failed to generate Brand DNA."
        );
      }

      const lockedDna = briefData.dna;
      setCampaign((prev) => ({
        ...prev,
        dna: lockedDna,
      }));

      // 2. Generate Master Anchor Reference Shot using Nano-Banana
      const anchorRes = await fetch("/api/brand/anchor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: snapshotModel,
          imageSize: snapshotSize,
          productName: snapshotName,
          productDescription: snapshotDesc,
          brandTone: snapshotTone,
          dna: lockedDna,
          referenceImageDataUrl: uploadedReferenceUrl ?? undefined,
        }),
      });

      const anchorData = (await anchorRes.json()) as {
        imageUrl?: string;
        error?: string;
        hint?: string;
      };

      if (!anchorRes.ok || !anchorData.imageUrl) {
        setBannerError({
          error: anchorData.error || "Anchor generation failed.",
          hint: anchorData.hint,
        });
        const errMsg = anchorData.hint
          ? `${anchorData.error} ${anchorData.hint}`
          : anchorData.error || "Unable to generate anchor reference.";
        setCampaign((prev) => {
          const nextShots = { ...prev.shots };
          for (const id of snapshotMediumIds) {
            if (nextShots[id]) {
              nextShots[id] = {
                ...nextShots[id],
                status: "error",
                error: "Waiting for Master Product Anchor.",
              };
            }
          }
          return {
            ...prev,
            anchorStatus: "error",
            anchorError: errMsg,
            shots: nextShots,
          };
        });
        return;
      }

      const anchorUrl = anchorData.imageUrl;
      setCampaign((prev) => ({
        ...prev,
        anchorImageUrl: anchorUrl,
        anchorStatus: "ready",
        anchorError: undefined,
        updatedAt: new Date().toISOString(),
      }));

      // 3. Render every selected medium anchored to the exact Master Product Reference
      await Promise.allSettled(
        snapshotMediumIds.map((mediumId) =>
          generateSingleMedium({
            mediumId,
            anchorUrl,
            dna: lockedDna,
            productName: snapshotName,
            productDescription: snapshotDesc,
            brandTone: snapshotTone,
            model: snapshotModel,
            imageSize: snapshotSize,
          })
        )
      );
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to build campaign.";
      setBannerError({ error: msg });
      setCampaign((prev) => {
        const nextShots = { ...prev.shots };
        for (const id of snapshotMediumIds) {
          if (nextShots[id]) {
            nextShots[id] = {
              ...nextShots[id],
              status: "error",
              error: msg,
            };
          }
        }
        return {
          ...prev,
          anchorStatus: "error",
          anchorError: msg,
          shots: nextShots,
        };
      });
    }
  };

  const handleRegenerateAnchor = async () => {
    if (!campaign.productName.trim() || !campaign.productDescription.trim()) {
      return;
    }
    setBannerError(null);
    setCampaign((prev) => ({
      ...prev,
      anchorStatus: "generating",
      anchorError: undefined,
    }));

    try {
      const res = await fetch("/api/brand/anchor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: campaign.model,
          imageSize: campaign.imageSize,
          productName: campaign.productName.trim(),
          productDescription: campaign.productDescription.trim(),
          brandTone: campaign.brandTone.trim(),
          dna: campaign.dna,
          referenceImageDataUrl: uploadedReferenceUrl ?? undefined,
        }),
      });
      const data = (await res.json()) as {
        imageUrl?: string;
        error?: string;
        hint?: string;
      };
      if (!res.ok || !data.imageUrl) {
        setBannerError({
          error: data.error || "Anchor regeneration failed.",
          hint: data.hint,
        });
        setCampaign((prev) => ({
          ...prev,
          anchorStatus: "error",
          anchorError: data.hint
            ? `${data.error} ${data.hint}`
            : data.error || "Failed to regenerate anchor.",
        }));
        return;
      }

      setCampaign((prev) => ({
        ...prev,
        anchorImageUrl: data.imageUrl!,
        anchorStatus: "ready",
        anchorError: undefined,
        updatedAt: new Date().toISOString(),
      }));
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to regenerate anchor.";
      setCampaign((prev) => ({
        ...prev,
        anchorStatus: "error",
        anchorError: msg,
      }));
    }
  };

  const handleSyncAllMediums = async () => {
    if (!campaign.anchorImageUrl || campaign.selectedMediumIds.length === 0) {
      return;
    }
    setBannerError(null);
    await Promise.allSettled(
      campaign.selectedMediumIds.map((mediumId) =>
        generateSingleMedium({
          mediumId,
          anchorUrl: campaign.anchorImageUrl!,
          dna: campaign.dna,
          productName: campaign.productName,
          productDescription: campaign.productDescription,
          brandTone: campaign.brandTone,
          model: campaign.model,
          imageSize: campaign.imageSize,
        })
      )
    );
  };

  const handleRegenerateMedium = (mediumId: MediumId) => {
    if (!campaign.anchorImageUrl) return;
    setBannerError(null);
    void generateSingleMedium({
      mediumId,
      anchorUrl: campaign.anchorImageUrl,
      dna: campaign.dna,
      productName: campaign.productName,
      productDescription: campaign.productDescription,
      brandTone: campaign.brandTone,
      model: campaign.model,
      imageSize: campaign.imageSize,
    });
  };

  const handleRefineMedium = (mediumId: MediumId, instruction: string) => {
    if (!campaign.anchorImageUrl) return;
    setBannerError(null);
    const existingShot = campaign.shots[mediumId];
    void generateSingleMedium({
      mediumId,
      anchorUrl: campaign.anchorImageUrl,
      dna: campaign.dna,
      productName: campaign.productName,
      productDescription: campaign.productDescription,
      brandTone: campaign.brandTone,
      model: campaign.model,
      imageSize: campaign.imageSize,
      editInstruction: instruction,
      previousMediumUrl: existingShot?.imageUrl ?? null,
    });
  };

  const handleToggleMedium = (id: MediumId) => {
    setCampaign((prev) => {
      const exists = prev.selectedMediumIds.includes(id);
      const nextSelected = exists
        ? prev.selectedMediumIds.filter((m) => m !== id)
        : [...prev.selectedMediumIds, id];

      const nextShots = { ...prev.shots };
      if (!exists && !nextShots[id]) {
        const def = [...DEFAULT_MEDIUMS, ...prev.customMediums].find(
          (m) => m.id === id
        );
        if (def) {
          nextShots[id] = {
            mediumId: def.id,
            label: def.label,
            aspectRatio: def.aspectRatio,
            formatSummary: def.formatSummary,
            imageUrl: null,
            status: "idle",
          };
        }
      }
      return {
        ...prev,
        selectedMediumIds: nextSelected,
        shots: nextShots,
      };
    });
  };

  const handleAddCustomMedium = (medium: MediumDefinition) => {
    setCampaign((prev) => ({
      ...prev,
      customMediums: [...prev.customMediums, medium],
      selectedMediumIds: [...prev.selectedMediumIds, medium.id],
      shots: {
        ...prev.shots,
        [medium.id]: {
          mediumId: medium.id,
          label: medium.label,
          aspectRatio: medium.aspectRatio,
          formatSummary: medium.formatSummary,
          imageUrl: null,
          status: "idle",
        },
      },
    }));
  };

  const handleApplyPreset = (preset: ProductPreset) => {
    setUploadedReferenceUrl(null);
    if (preset.id === "vespera-grinder") {
      setCampaign(SAMPLE_CAMPAIGN);
      return;
    }
    setCampaign((prev) => {
      const resetShots: Record<MediumId, MediumShot> = {};
      for (const id of prev.selectedMediumIds) {
        const def = [...DEFAULT_MEDIUMS, ...prev.customMediums].find(
          (m) => m.id === id
        );
        if (def) {
          resetShots[id] = {
            mediumId: def.id,
            label: def.label,
            aspectRatio: def.aspectRatio,
            formatSummary: def.formatSummary,
            imageUrl: null,
            status: "idle",
          };
        }
      }
      return {
        ...prev,
        id: `kit-${Date.now()}`,
        productName: preset.productName,
        productDescription: preset.productDescription,
        brandTone: preset.brandTone,
        anchorImageUrl: null,
        anchorStatus: "idle",
        anchorError: undefined,
        dna: {
          ...prev.dna,
          productName: preset.productName,
          headline: preset.productName.toUpperCase(),
          visualSignature: preset.productDescription,
          materialsAndFinish: preset.productDescription,
        },
        shots: resetShots,
      };
    });
  };

  const handleSaveCurrentKit = () => {
    setSavedKits((prev) => {
      const existsIdx = prev.findIndex((k) => k.id === campaign.id);
      const updatedKit = {
        ...campaign,
        updatedAt: new Date().toISOString(),
      };
      if (existsIdx >= 0) {
        const copy = [...prev];
        copy[existsIdx] = updatedKit;
        return copy;
      }
      return [updatedKit, ...prev];
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleNewCampaign = () => {
    setUploadedReferenceUrl(null);
    setBannerError(null);
    setCampaign(createEmptyCampaign());
    setActiveView("studio");
  };

  const lightboxShot = lightboxShotId
    ? campaign.shots[lightboxShotId] ?? null
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#0F172A]">
      <TopBar
        activeView={activeView}
        onSelectView={setActiveView}
        onNewCampaign={handleNewCampaign}
        savedCount={savedKits.length}
        isGenerating={isGeneratingAny}
      />

      <div className="md:hidden border-b border-zinc-200 bg-white px-4 py-2 flex items-center gap-4 text-xs font-medium overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveView("studio")}
          className={`py-1 whitespace-nowrap shrink-0 ${
            activeView === "studio"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-600"
          }`}
        >
          Campaign Studio
        </button>
        <button
          type="button"
          onClick={() => setActiveView("dna")}
          className={`py-1 whitespace-nowrap shrink-0 ${
            activeView === "dna"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-600"
          }`}
        >
          Brand DNA
        </button>
        <button
          type="button"
          onClick={() => setActiveView("saved")}
          className={`py-1 whitespace-nowrap shrink-0 tabular-nums ${
            activeView === "saved"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-600"
          }`}
        >
          Saved Kits ({savedKits.length})
        </button>
      </div>

      <main className="flex-1">
        {activeView === "studio" && (
          <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
            <StudioSidebar
              productName={campaign.productName}
              productDescription={campaign.productDescription}
              brandTone={campaign.brandTone}
              model={campaign.model}
              imageSize={campaign.imageSize}
              allMediums={allMediums}
              selectedMediumIds={campaign.selectedMediumIds}
              uploadedReferenceUrl={uploadedReferenceUrl}
              isGenerating={isGeneratingAny}
              onChangeProductName={(val) =>
                setCampaign((prev) => ({ ...prev, productName: val }))
              }
              onChangeProductDescription={(val) =>
                setCampaign((prev) => ({ ...prev, productDescription: val }))
              }
              onChangeBrandTone={(val) =>
                setCampaign((prev) => ({ ...prev, brandTone: val }))
              }
              onChangeModel={(model) =>
                setCampaign((prev) => ({ ...prev, model }))
              }
              onChangeImageSize={(imageSize) =>
                setCampaign((prev) => ({ ...prev, imageSize }))
              }
              onToggleMedium={handleToggleMedium}
              onAddCustomMedium={handleAddCustomMedium}
              onApplyPreset={handleApplyPreset}
              onUploadReference={setUploadedReferenceUrl}
              onBuildCampaign={handleBuildCampaign}
            />

            <div className="flex-1 min-w-0 p-6 lg:p-8 space-y-6">
              {bannerError && (
                <div
                  role="alert"
                  className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-900">
                        {bannerError.error}
                      </p>
                      {bannerError.hint && (
                        <p className="text-xs text-red-700 mt-1 leading-relaxed">
                          {bannerError.hint}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBannerError(null)}
                    aria-label="Dismiss error"
                    className="text-red-500 hover:text-red-800 p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <AnchorBanner
                anchorImageUrl={campaign.anchorImageUrl}
                anchorStatus={campaign.anchorStatus}
                anchorError={campaign.anchorError}
                dna={campaign.dna}
                model={campaign.model}
                isBusy={isGeneratingAny}
                onRegenerateAnchor={handleRegenerateAnchor}
                onSwapAnchorImage={(dataUrl) => {
                  setUploadedReferenceUrl(dataUrl);
                  setCampaign((prev) => ({
                    ...prev,
                    anchorImageUrl: dataUrl,
                    anchorStatus: "ready",
                    anchorError: undefined,
                  }));
                }}
                onSyncAllMediums={handleSyncAllMediums}
                onInspectAnchor={() => setLightboxAnchorOpen(true)}
              />

              <div className="flex items-center justify-between gap-4 pt-2">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Campaign Mediums
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                    {campaign.selectedMediumIds.length} active formats · Anchored
                    to {campaign.dna.productName || "product reference"} · Zero
                    people
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveCurrentKit}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {savedToast ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Saved to Kits
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      Save Kit
                    </>
                  )}
                </button>
              </div>

              {campaign.selectedMediumIds.length === 0 ? (
                <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center">
                  <p className="text-sm font-medium text-slate-900">
                    No mediums selected
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Select one or more mediums in the sidebar to render your
                    product campaign.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  {campaign.selectedMediumIds.map((mediumId) => {
                    const shot = campaign.shots[mediumId];
                    if (!shot) return null;
                    return (
                      <MediumCard
                        key={mediumId}
                        shot={shot}
                        productName={
                          campaign.productName || campaign.dna.productName
                        }
                        hasAnchor={Boolean(campaign.anchorImageUrl)}
                        onInspect={(s) => setLightboxShotId(s.mediumId)}
                        onRegenerate={handleRegenerateMedium}
                        onRefine={handleRefineMedium}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === "dna" && (
          <BrandDnaView
            dna={campaign.dna}
            anchorImageUrl={campaign.anchorImageUrl}
            isBusy={isGeneratingAny}
            onUpdateDna={(updated) =>
              setCampaign((prev) => ({
                ...prev,
                dna: updated,
                productName: updated.productName,
                updatedAt: new Date().toISOString(),
              }))
            }
            onSyncAllMediums={() => {
              setActiveView("studio");
              void handleSyncAllMediums();
            }}
          />
        )}

        {activeView === "saved" && (
          <SavedKitsView
            savedKits={savedKits}
            activeCampaignId={campaign.id}
            onSaveCurrent={handleSaveCurrentKit}
            onLoadKit={(kit) => {
              setCampaign(kit);
              setUploadedReferenceUrl(null);
              setActiveView("studio");
            }}
            onDeleteKit={(id) =>
              setSavedKits((prev) => prev.filter((k) => k.id !== id))
            }
          />
        )}
      </main>

      {(lightboxShot || lightboxAnchorOpen) && (
        <LightboxModal
          shot={lightboxShot}
          anchorImageUrl={campaign.anchorImageUrl}
          productName={campaign.productName || campaign.dna.productName}
          isAnchorView={lightboxAnchorOpen}
          onClose={() => {
            setLightboxShotId(null);
            setLightboxAnchorOpen(false);
          }}
          onRegenerate={handleRegenerateMedium}
          onRefine={handleRefineMedium}
        />
      )}
    </div>
  );
}
