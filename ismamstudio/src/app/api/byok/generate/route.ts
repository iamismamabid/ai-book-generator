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

export async function POST(req: Request) {
  try {
    const body: ByokGenerateRequest = await req.json();
    const { provider, apiKey, prompt, studioType, size = "1024x1024", stylePreset } = body;

    if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid API key for the selected provider." },
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
      enhancedPrompt = `${prompt.trim()}, clean vector line art, coloring book page, bold black outline, pure white background, no shading, no grayscale, high contrast ink lines, printable coloring sheet`;
      if (stylePreset) {
        enhancedPrompt += `, style: ${stylePreset}`;
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

    // 2. GOOGLE GEMINI (IMAGEN 3)
    if (provider === "gemini") {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${encodeURIComponent(apiKey.trim())}`;
      
      const geminiRes = await fetch(geminiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instances: [{ prompt: enhancedPrompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: studioType === "cover" ? "3:4" : "1:1",
            outputOptions: { mimeType: "image/png" },
          },
        }),
      });

      const data = await geminiRes.json();

      if (!geminiRes.ok) {
        const errorMsg = data?.error?.message || `Google Gemini error (${geminiRes.status}): ${geminiRes.statusText}`;
        return NextResponse.json({ success: false, error: errorMsg }, { status: geminiRes.status });
      }

      const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
      if (!b64) {
        return NextResponse.json({ success: false, error: "No image data returned from Gemini Imagen 3." }, { status: 500 });
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
