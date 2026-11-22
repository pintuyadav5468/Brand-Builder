import type {
  BrandCampaign,
  MediumDefinition,
  ProductPreset,
} from "../types/brand.ts";

export const DEFAULT_MEDIUMS: MediumDefinition[] = [
  {
    id: "billboard",
    label: "Highway Billboard",
    aspectRatio: "16:9",
    formatSummary: "Outdoor 16:9",
    artDirectionCue:
      "Architectural wide-angle photograph of a monumental roadside highway billboard against a crisp morning blue sky and clean concrete overpass. The billboard canvas features the exact product centered on an off-white architectural field with bold Swiss sans-serif display typography. Empty deserted highway and landscape.",
  },
  {
    id: "newspaper",
    label: "Newspaper Broadsheet",
    aspectRatio: "3:4",
    formatSummary: "Print Ad 3:4",
    artDirectionCue:
      "Overhead flat-lay photograph of an open folded broadsheet newspaper resting on a pale oak drafting desk, featuring a full-page high-contrast monochrome and spot-tone editorial print advertisement of the exact product. Classic newspaper serif headline, crisp newsprint ink grain, natural window light.",
  },
  {
    id: "social",
    label: "Social Post",
    aspectRatio: "1:1",
    formatSummary: "Square Feed 1:1",
    artDirectionCue:
      "Square editorial studio still-life photograph formatted for a flagship social feed. The exact product rests on a sculpted honed travertine stone plinth with crisp geometric window shadows and refined minimal companion props tailored to the category.",
  },
  {
    id: "subway",
    label: "Subway Lightbox",
    aspectRatio: "3:4",
    formatSummary: "Transit Poster 3:4",
    artDirectionCue:
      "Architectural photograph of an illuminated vertical backlit lightbox poster mounted on a sleek tiled minimalist transit station wall in an empty, completely deserted underground concourse at night. Clean glass reflections and sharp editorial product layout.",
  },
  {
    id: "packaging",
    label: "Retail Packaging",
    aspectRatio: "4:3",
    formatSummary: "Unboxing 4:3",
    artDirectionCue:
      "Commercial studio packaging photograph showing the exact product standing next to its bespoke matte rigid paperboard presentation box with debossed typography and sculpted molded pulp insert on a neutral stone tabletop.",
  },
  {
    id: "magazine",
    label: "Magazine Spread",
    aspectRatio: "16:9",
    formatSummary: "Editorial 16:9",
    artDirectionCue:
      "Overhead three-quarter photograph of a thick open luxury design magazine lying flat on a travertine table, displaying a crisp two-page full-bleed advertising spread showcasing the exact product on the right page and disciplined editorial typography on the left.",
  },
];

export const PRODUCT_PRESETS: ProductPreset[] = [
  {
    id: "vespera-grinder",
    label: "Vespera M1 Grinder",
    productName: "Vespera M1",
    brandTone: "Precision architectural minimalism",
    productDescription:
      "Cylindrical matte black anodized aluminum single-dose espresso grinder with a brushed solid brass adjustment collar, knurled black top dial with white tick marks, and a clean minimalist wordmark.",
  },
  {
    id: "solis-serum",
    label: "Solis Botanical Serum",
    productName: "Solis No. 04",
    brandTone: "Apothecary tactile luxury",
    productDescription:
      "Heavy fluted amber glass dropper bottle with a matte warm-stone cylindrical pipette cap, crisp unbleached cotton paper label with fine black serif typography, and golden botanical oil inside.",
  },
  {
    id: "koma-synth",
    label: "Koma Field Synth",
    productName: "Koma OP-Field",
    brandTone: "Industrial Dieter Rams utility",
    productDescription:
      "Ultra-thin bead-blasted silver aluminum portable synthesizer with recessed circular cream keys, four anodized encoder knobs (cobalt blue, burnt orange, slate, charcoal), and a crisp miniature OLED strip.",
  },
  {
    id: "sora-kettle",
    label: "Sora Ceramic Kettle",
    productName: "Sora Pour-Over",
    brandTone: "Quiet Nordic stoneware",
    productDescription:
      "Sculptural gooseneck pour-over kettle in unglazed slate-charcoal stoneware ceramic body paired with a steam-bent pale ash wood handle and brushed stainless steel lid finial.",
  },
];

export const SAMPLE_CAMPAIGN: BrandCampaign = {
  id: "sample-vespera-m1",
  productName: "Vespera M1",
  productDescription:
    "Cylindrical matte black anodized aluminum single-dose espresso grinder with a brushed solid brass adjustment collar, knurled black top dial with white tick marks, and a clean minimalist wordmark.",
  brandTone: "Precision architectural minimalism",
  model: "gemini-3.1-flash-lite-image",
  imageSize: "1K",
  anchorImageUrl: "/src/assets/images/sample_product_anchor_1794803915047.jpg",
  anchorStatus: "ready",
  dna: {
    productName: "Vespera M1",
    category: "Precision Coffee Hardware",
    headline: "PURE EXTRACTION",
    tagline: "Engineered for the quiet morning ritual.",
    visualSignature:
      "Cylindrical matte black anodized aluminum body, brushed brass stepped collar, knurled black precision top dial with fine white graduation ticks, centered Vespera M1 wordmark.",
    materialsAndFinish:
      "Bead-blasted matte black anodized 6061 aluminum, raw brushed C360 brass collar, micro-knurled dial.",
    colorPalette: [
      { name: "Anodized Obsidian", hex: "#141416" },
      { name: "Brushed Brass", hex: "#B9975B" },
      { name: "Studio Paper", hex: "#F2F1EC" },
      { name: "Cobalt Accent", hex: "#2563EB" },
    ],
    typographyDirection:
      "High-tracking geometric grotesque headlines paired with restrained broadsheet serif editorial copy.",
  },
  selectedMediumIds: ["billboard", "newspaper", "social"],
  customMediums: [],
  shots: {
    billboard: {
      mediumId: "billboard",
      label: "Highway Billboard",
      aspectRatio: "16:9",
      formatSummary: "Outdoor 16:9",
      imageUrl: "/src/assets/images/sample_billboard_1794803916226.jpg",
      status: "ready",
      modelUsed: "gemini-3.1-flash-lite-image",
      updatedAt: "2026-11-15T20:38:00.000Z",
    },
    newspaper: {
      mediumId: "newspaper",
      label: "Newspaper Broadsheet",
      aspectRatio: "3:4",
      formatSummary: "Print Ad 3:4",
      imageUrl: "/src/assets/images/sample_newspaper_1794803916545.jpg",
      status: "ready",
      modelUsed: "gemini-3.1-flash-lite-image",
      updatedAt: "2026-11-15T20:38:00.000Z",
    },
    social: {
      mediumId: "social",
      label: "Social Post",
      aspectRatio: "1:1",
      formatSummary: "Square Feed 1:1",
      imageUrl: "/src/assets/images/sample_social_post_1794803916330.jpg",
      status: "ready",
      modelUsed: "gemini-3.1-flash-lite-image",
      updatedAt: "2026-11-15T20:38:00.000Z",
    },
  },
  createdAt: "2026-11-15T20:38:00.000Z",
  updatedAt: "2026-11-15T20:38:00.000Z",
};
