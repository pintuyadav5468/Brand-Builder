import { GoogleGenAI, Type } from "@google/genai";
import type {
  AspectRatio,
  BrandDnaSpec,
  ImageResolution,
  NanoBananaModel,
} from "../src/types/brand.ts";

const ZERO_PEOPLE_DIRECTIVE =
  "CRITICAL CONSTRAINT: Strictly NO people, NO humans, NO hands, NO fingers, NO faces, NO silhouettes, NO models, NO pedestrians, NO crowds, NO bystanders anywhere in the frame. Render a completely uninhabited environment focusing solely on the product and physical medium.";

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    const err = new Error(
      "GEMINI_API_KEY is not configured. Open Settings > Secrets to set a billing-enabled Gemini API key."
    ) as Error & { statusCode?: number; code?: string };
    err.statusCode = 403;
    err.code = "API_KEY_MISSING";
    throw err;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

export function parseDataUrl(dataUrl: string): {
  mimeType: string;
  base64: string;
} {
  const match = /^data:([^;]+);base64,(.+)$/s.exec(dataUrl.trim());
  if (!match) {
    throw new Error("Invalid image data URL format.");
  }
  return {
    mimeType: match[1],
    base64: match[2],
  };
}

export function formatGeminiError(err: unknown): {
  status: number;
  error: string;
  code: string;
  hint: string;
} {
  const rawMessage = err instanceof Error ? err.message : String(err);
  const statusMatch = /\b(400|401|403|404|429|500|503)\b/.exec(rawMessage);
  const parsedStatus = statusMatch ? Number(statusMatch[1]) : 500;
  const statusCode =
    typeof (err as { statusCode?: number }).statusCode === "number"
      ? (err as { statusCode: number }).statusCode
      : parsedStatus;

  if (
    statusCode === 403 ||
    rawMessage.includes("PERMISSION_DENIED") ||
    rawMessage.includes("API_KEY_MISSING")
  ) {
    return {
      status: 403,
      code: "PERMISSION_DENIED",
      error: rawMessage,
      hint: "Check or select a billing-enabled Gemini API key in Settings > Secrets for Nano-Banana image generation.",
    };
  }
  if (statusCode === 429 || rawMessage.includes("RESOURCE_EXHAUSTED")) {
    return {
      status: 429,
      code: "RESOURCE_EXHAUSTED",
      error: rawMessage,
      hint: "Nano-Banana requires a paid-tier API key or higher quota. Check your billing-enabled key in Settings > Secrets.",
    };
  }
  if (statusCode === 400 || rawMessage.includes("API_KEY_INVALID")) {
    return {
      status: 400,
      code: "BAD_REQUEST",
      error: rawMessage,
      hint: "Verify your prompt parameters and that your GEMINI_API_KEY is valid in Settings > Secrets.",
    };
  }
  if (statusCode === 404 || rawMessage.includes("NOT_FOUND")) {
    return {
      status: 404,
      code: "NOT_FOUND",
      error: rawMessage,
      hint: "Requested Nano-Banana model could not be reached. Try switching models or checking API access.",
    };
  }

  return {
    status: 500,
    code: "GENERATION_FAILED",
    error: rawMessage || "Unexpected error while calling Nano-Banana.",
    hint: "Retry generating this asset in a moment.",
  };
}

const ALLOWED_NANO_BANANA_MODELS: ReadonlySet<NanoBananaModel> = new Set([
  "gemini-3.1-flash-lite-image",
  "gemini-nano-banana-2.1",
]);

export function assertNanoBananaModel(model?: string): NanoBananaModel {
  if (!model) {
    return "gemini-3.1-flash-lite-image";
  }
  if (ALLOWED_NANO_BANANA_MODELS.has(model as NanoBananaModel)) {
    return model as NanoBananaModel;
  }
  const err = new Error(
    `Unsupported image model "${model}". Only Nano-Banana image models are permitted.`
  ) as Error & { statusCode?: number; code?: string };
  err.statusCode = 400;
  err.code = "UNSUPPORTED_IMAGE_MODEL";
  throw err;
}

function buildImageConfig(
  model: NanoBananaModel,
  aspectRatio: AspectRatio,
  imageSize: ImageResolution
) {
  if (model === "gemini-nano-banana-2.1") {
    return {
      aspectRatio,
      imageSize,
    };
  }
  return {
    aspectRatio,
  };
}

function extractFirstImageDataUrl(response: {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        inlineData?: { data?: string; mimeType?: string };
      }>;
    };
  }>;
}): string {
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      const mimeType = part.inlineData.mimeType ?? "image/png";
      return `data:${mimeType};base64,${part.inlineData.data}`;
    }
  }
  const textFallback = parts
    .map((p) => p.text)
    .filter(Boolean)
    .join(" ")
    .trim();
  throw new Error(
    textFallback
      ? `Nano-Banana returned text instead of an image: ${textFallback}`
      : "Nano-Banana did not return an image part."
  );
}

export async function generateBrandDnaSpec(params: {
  productName: string;
  productDescription: string;
  brandTone: string;
}): Promise<BrandDnaSpec> {
  const ai = getClient();

  const prompt = [
    `Create a concise, locked brand visual DNA specification for the following product so that multiple advertising photographs across billboards, newspapers, and social posts stay 100% visually consistent.`,
    `Product Name: ${params.productName}`,
    `Brand Tone: ${params.brandTone || "Architectural minimalist luxury"}`,
    `Product Description: ${params.productDescription}`,
    `Keep headline under 5 words (e.g. "PURE EXTRACTION"). Keep visualSignature ultra-specific about geometry, proportions, surface finish, hardware details, and label placement. Never reference people or human models.`,
  ].join("\n");

  const response = await ai.models.generateContent({
    model: "gemini-4-hydrogen",
    contents: prompt,
    config: {
      systemInstruction:
        "You are an executive industrial designer and brand art director. Output crisp, concrete physical product specifications and punchy print headlines. Never mention people, hands, or human models.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          productName: { type: Type.STRING },
          category: { type: Type.STRING },
          headline: { type: Type.STRING },
          tagline: { type: Type.STRING },
          visualSignature: { type: Type.STRING },
          materialsAndFinish: { type: Type.STRING },
          colorPalette: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                hex: { type: Type.STRING },
              },
            },
          },
          typographyDirection: { type: Type.STRING },
        },
      },
    },
  });

  const rawJson = (response.text ?? "{}").trim();
  const parsed = JSON.parse(rawJson) as Partial<BrandDnaSpec>;
  return {
    productName: parsed.productName || params.productName,
    category: parsed.category || "Consumer Object",
    headline: parsed.headline || params.productName.toUpperCase(),
    tagline: parsed.tagline || "Engineered for enduring daily ritual.",
    visualSignature: parsed.visualSignature || params.productDescription,
    materialsAndFinish: parsed.materialsAndFinish || params.productDescription,
    colorPalette:
      Array.isArray(parsed.colorPalette) && parsed.colorPalette.length > 0
        ? parsed.colorPalette.slice(0, 4)
        : [
            { name: "Carbon", hex: "#141413" },
            { name: "Studio Paper", hex: "#F4F3EF" },
            { name: "Brushed Metal", hex: "#B89B67" },
          ],
    typographyDirection:
      parsed.typographyDirection ||
      "Clean geometric Swiss grotesque headline paired with crisp tabular specs.",
  };
}

export async function generateAnchorProductImage(params: {
  model: NanoBananaModel;
  imageSize: ImageResolution;
  productName: string;
  productDescription: string;
  brandTone: string;
  dna: BrandDnaSpec;
  referenceImageDataUrl?: string;
}): Promise<string> {
  const ai = getClient();

  const basePrompt = [
    `Commercial studio master reference photograph of the product "${params.productName}".`,
    `Locked Product Geometry & Materials: ${params.dna.visualSignature}. Materials and finishes: ${params.dna.materialsAndFinish}.`,
    `User Description: ${params.productDescription}.`,
    `Brand Aesthetic: ${params.brandTone}.`,
    `Composition: Centered full-product three-quarter front view resting on a clean, seamless neutral cool light-gray studio cyclorama surface, crisp softbox side lighting, subtle grounded contact shadow, sharp edge-to-edge clarity so this single shot can serve as the master visual anchor for all downstream advertising mediums.`,
    ZERO_PEOPLE_DIRECTIVE,
  ].join(" ");

  const parts: Array<
    { text: string } | { inlineData: { data: string; mimeType: string } }
  > = [];

  if (params.referenceImageDataUrl) {
    const parsed = parseDataUrl(params.referenceImageDataUrl);
    parts.push({
      inlineData: {
        data: parsed.base64,
        mimeType: parsed.mimeType,
      },
    });
    parts.push({
      text: `Transform and standardize the uploaded product photo into a clean studio master reference shot while preserving the EXACT product design, shape, label, and colors. ${basePrompt}`,
    });
  } else {
    parts.push({ text: basePrompt });
  }

  const response = await ai.models.generateContent({
    model: params.model,
    contents: { parts },
    config: {
      imageConfig: buildImageConfig(params.model, "1:1", params.imageSize),
    },
  });

  return extractFirstImageDataUrl(response);
}

export async function generateMediumCampaignImage(params: {
  model: NanoBananaModel;
  imageSize: ImageResolution;
  aspectRatio: AspectRatio;
  mediumLabel: string;
  mediumArtDirection: string;
  productName: string;
  productDescription: string;
  brandTone: string;
  dna: BrandDnaSpec;
  anchorImageDataUrl: string;
  previousMediumDataUrl?: string;
  editInstruction?: string;
}): Promise<string> {
  const ai = getClient();
  const anchor = parseDataUrl(params.anchorImageDataUrl);

  const parts: Array<
    { text: string } | { inlineData: { data: string; mimeType: string } }
  > = [
    {
      inlineData: {
        data: anchor.base64,
        mimeType: anchor.mimeType,
      },
    },
  ];

  if (params.previousMediumDataUrl && params.editInstruction) {
    const prev = parseDataUrl(params.previousMediumDataUrl);
    parts.push({
      inlineData: {
        data: prev.base64,
        mimeType: prev.mimeType,
      },
    });
  }

  const consistencyInstruction = [
    `PRODUCT CONSISTENCY LOCK: The first attached image is the master studio reference for "${params.productName}".`,
    `You MUST reproduce this EXACT same product—preserving its precise silhouette, proportions, materials (${params.dna.materialsAndFinish}), colorway, label/mark placement, and hardware details—without redesigning or morphing the object.`,
    `Visual Signature: ${params.dna.visualSignature}.`,
  ].join(" ");

  const mediumPrompt = [
    consistencyInstruction,
    `TARGET MEDIUM: ${params.mediumLabel}.`,
    `SCENE & ART DIRECTION: ${params.mediumArtDirection}`,
    `BRAND COPY & TYPOGRAPHY: Feature the short campaign headline "${params.dna.headline}" and subtle brand name "${params.productName}" rendered cleanly inside the medium layout (${params.dna.typographyDirection}). Tone: ${params.brandTone}.`,
    params.editInstruction
      ? `USER REFINEMENT INSTRUCTION (keep the product identical to image 1 while applying this change to the scene/layout/lighting): ${params.editInstruction}`
      : "",
    ZERO_PEOPLE_DIRECTIVE,
  ]
    .filter(Boolean)
    .join(" ");

  parts.push({ text: mediumPrompt });

  const response = await ai.models.generateContent({
    model: params.model,
    contents: { parts },
    config: {
      imageConfig: buildImageConfig(
        params.model,
        params.aspectRatio,
        params.imageSize
      ),
    },
  });

  return extractFirstImageDataUrl(response);
}
