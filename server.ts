import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  assertNanoBananaModel,
  formatGeminiError,
  generateAnchorProductImage,
  generateBrandDnaSpec,
  generateMediumCampaignImage,
} from "./server/gemini.ts";
import type {
  AspectRatio,
  BrandDnaSpec,
  ImageResolution,
  NanoBananaModel,
} from "./src/types/brand.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === "production";

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "30mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.post("/api/brand/brief", async (req, res) => {
    try {
      const { productName, productDescription, brandTone } = req.body as {
        productName?: string;
        productDescription?: string;
        brandTone?: string;
      };

      if (!productName?.trim() || !productDescription?.trim()) {
        res.status(400).json({
          error: "Product name and product description are required.",
          code: "INVALID_INPUT",
          hint: "Provide both a product name and visual description.",
        });
        return;
      }

      const dna = await generateBrandDnaSpec({
        productName: productName.trim(),
        productDescription: productDescription.trim(),
        brandTone: (brandTone || "Minimalist architectural").trim(),
      });

      res.json({ dna });
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json(formatted);
    }
  });

  app.post("/api/brand/anchor", async (req, res) => {
    try {
      const {
        model,
        imageSize = "1K",
        productName,
        productDescription,
        brandTone,
        dna,
        referenceImageDataUrl,
      } = req.body as {
        model?: NanoBananaModel;
        imageSize?: ImageResolution;
        productName?: string;
        productDescription?: string;
        brandTone?: string;
        dna?: BrandDnaSpec;
        referenceImageDataUrl?: string;
      };

      const validatedModel = assertNanoBananaModel(model);

      if (!productName?.trim() || !productDescription?.trim() || !dna) {
        res.status(400).json({
          error: "Missing product details or Brand DNA specification.",
          code: "INVALID_INPUT",
          hint: "Generate or provide a Brand DNA spec before creating the anchor shot.",
        });
        return;
      }

      const imageUrl = await generateAnchorProductImage({
        model: validatedModel,
        imageSize,
        productName: productName.trim(),
        productDescription: productDescription.trim(),
        brandTone: (brandTone || "Minimalist architectural").trim(),
        dna,
        referenceImageDataUrl,
      });

      res.json({ imageUrl, model: validatedModel });
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json(formatted);
    }
  });

  app.post("/api/brand/medium", async (req, res) => {
    try {
      const {
        model,
        imageSize = "1K",
        aspectRatio = "1:1",
        mediumLabel,
        mediumArtDirection,
        productName,
        productDescription,
        brandTone,
        dna,
        anchorImageDataUrl,
        previousMediumDataUrl,
        editInstruction,
      } = req.body as {
        model?: NanoBananaModel;
        imageSize?: ImageResolution;
        aspectRatio?: AspectRatio;
        mediumLabel?: string;
        mediumArtDirection?: string;
        productName?: string;
        productDescription?: string;
        brandTone?: string;
        dna?: BrandDnaSpec;
        anchorImageDataUrl?: string;
        previousMediumDataUrl?: string;
        editInstruction?: string;
      };

      const validatedModel = assertNanoBananaModel(model);

      if (
        !mediumLabel?.trim() ||
        !mediumArtDirection?.trim() ||
        !productName?.trim() ||
        !dna ||
        !anchorImageDataUrl
      ) {
        res.status(400).json({
          error:
            "Anchor reference image, Brand DNA, and medium details are required.",
          code: "INVALID_INPUT",
          hint: "Create or upload the master anchor product image first.",
        });
        return;
      }

      const imageUrl = await generateMediumCampaignImage({
        model: validatedModel,
        imageSize,
        aspectRatio,
        mediumLabel: mediumLabel.trim(),
        mediumArtDirection: mediumArtDirection.trim(),
        productName: productName.trim(),
        productDescription: (productDescription || dna.visualSignature).trim(),
        brandTone: (brandTone || "Minimalist architectural").trim(),
        dna,
        anchorImageDataUrl,
        previousMediumDataUrl,
        editInstruction: editInstruction?.trim(),
      });

      res.json({ imageUrl, model: validatedModel });
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json(formatted);
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    app.use(express.static(distDir));
    app.get("/{*splat}", (_req, res) => {
      const indexFile = path.join(distDir, "index.html");
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send("Build output not found. Run npm run build first.");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Brand Builder server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
