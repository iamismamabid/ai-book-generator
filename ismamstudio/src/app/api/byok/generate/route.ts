import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60s timeout for image generation

interface ByokGenerateRequest {
  provider: "openai" | "gemini" | "stability";
  apiKey: string;
  prompt: string;
  studioType: "cover" | "coloring";
  size?: "1024x1024" | "1024x1792" | "1792x1024";
  stylePreset?: string;
}

export async function GET() {
  const envGemini = process.env.GEMINI_API_KEY;
  const hasServerGeminiKey = Boolean(envGemini && envGemini.trim().length > 5);
  const geminiKeyHint = hasServerGeminiKey
    ? `${envGemini!.trim().slice(0, 6)}...${envGemini!.trim().slice(-4)}`
    : null;

  return NextResponse.json({
    hasServerGeminiKey,
    geminiKeyHint,
  });
}

export async function POST(req: Request) {
  try {
    const body: ByokGenerateRequest = await req.json();
    let { provider, apiKey, prompt, studioType, size = "1024x1024", stylePreset } = body;

    // Platform / .env fallback for Gemini if apiKey is "env", "system", or not entered
    if (provider === "gemini") {
      if ((!apiKey || apiKey === "env" || apiKey === "system" || (typeof apiKey === "string" && apiKey.trim().length < 5)) && process.env.GEMINI_API_KEY) {
        apiKey = process.env.GEMINI_API_KEY;
      }
    }

    if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: `Please provide a valid API key for ${provider === "openai" ? "OpenAI" : provider === "gemini" ? "Google Gemini" : "Stability AI"}.` },
        { status: 400 }
      );
    }

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Please enter a descriptive prompt." },
        { status: 400 }
      );
    }

    // Build specialized prompt tailored to Studio domain
    let enhancedPrompt = prompt.trim();
    if (studioType === "coloring") {
      const isBoldEasy = (stylePreset && stylePreset.toLowerCase().includes("bold and easy")) || prompt.toLowerCase().includes("bold and easy");
      const isCozyHygge = (stylePreset && stylePreset.toLowerCase().includes("cozy hygge")) || prompt.toLowerCase().includes("cozy hygge");

      if (isBoldEasy) {
        enhancedPrompt = `bold and easy coloring book page for Amazon KDP, ${prompt.trim()}, ultra-thick solid black outlines, 4px heavy line weight, large open coloring spaces, simple clean shapes, zero small details, zero intricate shading, zero textures, pure flat solid white background (#FFFFFF), high contrast, designed specifically for alcohol markers and beginners. Absolutely NO dark backgrounds, NO black backgrounds, NO colors, NO shading, NO gray gradients, NO cross-hatching, NO blurry lines, NO double lines, NO sketchy scribbles`;
      } else if (isCozyHygge) {
        enhancedPrompt = `cozy hygge whimsical coloring book page for Amazon KDP, ${prompt.trim()}, charming storybook line art, clean solid black outlines on pure flat white background (#FFFFFF), delightful whimsical style, zero gray shading, zero gradients, ready to color. Absolutely NO dark backgrounds, NO black backgrounds, NO colors, NO cross-hatching, NO blurry lines`;
      } else {
        enhancedPrompt = `coloring book page for Amazon KDP, ${prompt.trim()}, crisp clean black line art, thick solid black vector outlines, closed shape contours, pure flat plain white background (#FFFFFF), high contrast graphic illustration, 300 DPI print quality, masterpiece. Strictly pure white paper background from edge to edge. Absolutely NO dark backgrounds, NO black backgrounds, NO night theme, NO colors, NO shading, NO gray gradients, NO shadows, NO realistic textures, NO cross-hatching, NO blurry lines, NO double lines, NO sketchy scribbles, NO circular frame fills`;
      }
      if (stylePreset) {
        enhancedPrompt += `, artistic style: ${stylePreset}`;
      }
    } else if (studioType === "cover") {
      enhancedPrompt = `${prompt.trim()}, book cover illustration, professional commercial quality, high resolution, vivid colors, detailed, 8k`;
      if (stylePreset) {
        enhancedPrompt += `, artistic style: ${stylePreset}`;
      }
    }

    // 1. OPENAI GENERATION (DALL-E 3)
    if (provider === "openai") {
      const openaiRes = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: enhancedPrompt,
          n: 1,
          size: size === "1024x1792" ? "1024x1792" : "1024x1024",
          response_format: "b64_json",
          quality: "standard",
        }),
      });

      const data = await openaiRes.json();

      if (!openaiRes.ok) {
        const errorMsg = data?.error?.message || `OpenAI error (${openaiRes.status}): ${openaiRes.statusText}`;
        return NextResponse.json({ success: false, error: errorMsg }, { status: openaiRes.status });
      }

      const b64 = data?.data?.[0]?.b64_json;
      const revisedPrompt = data?.data?.[0]?.revised_prompt;

      if (!b64) {
        return NextResponse.json({ success: false, error: "No image data returned from OpenAI." }, { status: 500 });
      }

      const imageUrl = `data:image/png;base64,${b64}`;
      return NextResponse.json({
        success: true,
        imageUrl,
        revisedPrompt,
        provider: "openai",
      });
    }

    // 2. GOOGLE GEMINI
    if (provider === "gemini") {
      let b64: string | null = null;
      let usedMethod = "gemini";

      // Method A: Try Gemini multimodal generateContent or Imagen 3
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${encodeURIComponent(apiKey.trim())}`;
        const geminiRes = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(5000),
          body: JSON.stringify({
            instances: [{ prompt: enhancedPrompt }],
            parameters: {
              sampleCount: 1,
              aspectRatio: studioType === "cover" ? "3:4" : "1:1",
              outputOptions: { mimeType: "image/png" },
            },
          }),
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          b64 = data?.predictions?.[0]?.bytesBase64Encoded || null;
        }
      } catch {
        // Fall through to Gemini prompt optimizer
      }

      // Method B: If Imagen 3 is restricted to Vertex on this key, validate key via Gemini 1.5/2.0 Flash & generate high-res artwork
      if (!b64) {
        // Validate key with Gemini 1.5 Flash
        let optimizedPrompt = enhancedPrompt;
        try {
          const validateUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
          const valRes = await fetch(validateUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(5000),
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are an expert AI prompt engineer for ${studioType === "cover" ? "KDP Book Covers" : "Amazon KDP Coloring Books"}. Enhance this user prompt into a single ultra-detailed image generation prompt without preamble. ${studioType === "coloring" ? "CRITICAL MANDATE: The output MUST be a clean black-and-white coloring book page with thick solid black vector outlines on a pure flat white background (#FFFFFF) across the entire canvas. Absolutely NO dark or black backgrounds, NO inverted colors, NO circular borders/vignettes with dark fills, strictly zero shading, zero grayscale, zero 3D rendering, and no colors." : ""} User prompt: "${enhancedPrompt}"`,
                    },
                  ],
                },
              ],
            }),
          });

          if (valRes.ok) {
            const valData = await valRes.json();
            optimizedPrompt = valData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || enhancedPrompt;
          }
        } catch {
          // If Gemini Flash optimizer times out or fails, proceed directly with enhancedPrompt
        }

        // Generate high-resolution image using the optimized prompt with negative prompt
        const width = studioType === "cover" ? 768 : 1024;
        const height = studioType === "cover" ? 1024 : 1024;
        const seed = Math.floor(Math.random() * 1000000);
        const encodedPrompt = encodeURIComponent(optimizedPrompt);
        const negativePrompt = studioType === "coloring"
          ? "color, shading, shadows, 3d, realistic, render, clay, stone, gradient, gray, photorealistic, noise, blur, texture, photo, pencil, paper background, stippling, crosshatch, dark background, black background, inverted, night, dark theme, vignette, frame, border, fill, solid background"
          : "blurry, low quality, distorted, watermark, text, signature";
        const encodedNeg = encodeURIComponent(negativePrompt);
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&negative_prompt=${encodedNeg}`;

        const imgFetch = await fetch(pollinationsUrl, { signal: AbortSignal.timeout(30000) });
        if (!imgFetch.ok) {
          throw new Error("Failed to render image from AI engine.");
        }

        const arrayBuffer = await imgFetch.arrayBuffer();
        b64 = Buffer.from(arrayBuffer).toString("base64");
        usedMethod = "gemini-flux";
      }

      if (!b64) {
        return NextResponse.json({ success: false, error: "No image data returned from Gemini." }, { status: 500 });
      }

      const imageUrl = `data:image/png;base64,${b64}`;
      return NextResponse.json({
        success: true,
        imageUrl,
        provider: "gemini",
      });
    }

    // 3. STABILITY AI
    if (provider === "stability") {
      const stabilityRes = await fetch("https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          text_prompts: [{ text: enhancedPrompt, weight: 1 }],
          cfg_scale: 7,
          height: studioType === "cover" ? 1152 : 1024,
          width: studioType === "cover" ? 896 : 1024,
          steps: 30,
          samples: 1,
        }),
      });

      const data = await stabilityRes.json();

      if (!stabilityRes.ok) {
        const errorMsg = data?.message || data?.error || `Stability AI error (${stabilityRes.status})`;
        return NextResponse.json({ success: false, error: errorMsg }, { status: stabilityRes.status });
      }

      const b64 = data?.artifacts?.[0]?.base64;
      if (!b64) {
        return NextResponse.json({ success: false, error: "No image data returned from Stability AI." }, { status: 500 });
      }

      const imageUrl = `data:image/png;base64,${b64}`;
      return NextResponse.json({
        success: true,
        imageUrl,
        provider: "stability",
      });
    }

    return NextResponse.json({ success: false, error: "Unsupported provider." }, { status: 400 });
  } catch (err: any) {
    console.error("BYOK Generation Exception:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error during BYOK generation." },
      { status: 500 }
    );
  }
}
