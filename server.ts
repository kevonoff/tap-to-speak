import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

// Initialize Gemini Client server-side
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. AI image generation will use high-quality vector preset fallback.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Helper to generate a clean vector SVG symbol when AI image generation fails or quota is exhausted
function generateVectorSymbolSvg(conceptText: string): string {
  const text = (conceptText || "Card").trim();
  const titleText = text.length > 12 ? text.substring(0, 12) + "…" : text;
  const initial = text.charAt(0).toUpperCase() || "A";
  
  const palettes = [
    { bg: "#EFF6FF", circle: "#3B82F6", text: "#1E40AF" },
    { bg: "#ECFDF5", circle: "#10B981", text: "#065F46" },
    { bg: "#FFFBEB", circle: "#F59E0B", text: "#92400E" },
    { bg: "#F3E8FF", circle: "#8B5CF6", text: "#5B21B6" },
    { bg: "#FCE7F3", circle: "#EC4899", text: "#9D174D" },
    { bg: "#E0F2FE", circle: "#0284C7", text: "#075985" },
  ];
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash);
  const p = palettes[Math.abs(hash) % palettes.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <rect width="200" height="200" rx="32" fill="${p.bg}"/>
    <circle cx="100" cy="90" r="54" fill="${p.circle}"/>
    <text x="100" y="106" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" text-anchor="middle">${initial}</text>
    <text x="100" y="168" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="800" fill="${p.text}" text-anchor="middle" letter-spacing="1">${titleText.toUpperCase()}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// API Endpoint to generate AAC communication images using Gemini AI
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, label } = req.body;
    if (!prompt && !label) {
      return res.status(400).json({ error: "Prompt or label is required" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      const fallbackUrl = generateVectorSymbolSvg(prompt || label || "Custom Card");
      return res.json({
        imageUrl: fallbackUrl,
        warning: "Gemini API key not configured. Created a clean vector symbol graphic instead."
      });
    }

    const imagePrompt = `A simple, clear, high-contrast AAC (Augmentative and Alternative Communication) picture symbol for: "${prompt || label}". Style: Clean modern vector illustration, bold outlines, vibrant flat colors, isolated on a clean white background, easily recognizable by children and people with developmental needs. No text in the image.`;

    console.log(`Generating AI image for prompt: "${imagePrompt}"`);

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
      contents: {
        parts: [
          {
            text: imagePrompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    let imageUrl: string | null = null;

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const mimeType = part.inlineData.mimeType || "image/png";
          imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      throw new Error("No image data returned from AI model");
    }

    return res.json({ imageUrl });
  } catch (error: any) {
    console.error("Error generating image with Gemini:", error);
    const fallbackUrl = generateVectorSymbolSvg(req.body?.prompt || req.body?.label || "Custom Card");
    const isQuotaError = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('Quota') || error?.message?.includes('RESOURCE_EXHAUSTED');

    return res.json({
      imageUrl: fallbackUrl,
      warning: isQuotaError
        ? "AI Image API quota limit reached. Created a clean vector symbol graphic instead."
        : "AI image generation service unavailable. Created a clean vector symbol graphic instead."
    });
  }
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AAC Android App Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
