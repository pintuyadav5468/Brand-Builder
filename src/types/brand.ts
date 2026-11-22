export type NanoBananaModel =
  | "gemini-3.1-flash-lite-image"
  | "gemini-nano-banana-2.1";

export type ImageResolution = "1K" | "2K";

export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

export type MediumId =
  | "billboard"
  | "newspaper"
  | "social"
  | "subway"
  | "packaging"
  | "magazine"
  | string;

export interface MediumDefinition {
  id: MediumId;
  label: string;
  aspectRatio: AspectRatio;
  formatSummary: string;
  artDirectionCue: string;
  isCustom?: boolean;
}

export interface BrandDnaSpec {
  productName: string;
  category: string;
  headline: string;
  tagline: string;
  visualSignature: string;
  materialsAndFinish: string;
  colorPalette: Array<{
    name: string;
    hex: string;
  }>;
  typographyDirection: string;
}

export type ShotStatus = "idle" | "generating" | "ready" | "error";

export interface MediumShot {
  mediumId: MediumId;
  label: string;
  aspectRatio: AspectRatio;
  formatSummary: string;
  imageUrl: string | null;
  status: ShotStatus;
  error?: string;
  modelUsed?: NanoBananaModel;
  lastInstruction?: string;
  updatedAt?: string;
}

export interface BrandCampaign {
  id: string;
  productName: string;
  productDescription: string;
  brandTone: string;
  model: NanoBananaModel;
  imageSize: ImageResolution;
  anchorImageUrl: string | null;
  anchorStatus: ShotStatus;
  anchorError?: string;
  dna: BrandDnaSpec;
  selectedMediumIds: MediumId[];
  customMediums: MediumDefinition[];
  shots: Record<MediumId, MediumShot>;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPreset {
  id: string;
  label: string;
  productName: string;
  brandTone: string;
  productDescription: string;
}
