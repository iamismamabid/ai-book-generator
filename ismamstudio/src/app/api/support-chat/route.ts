import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SYSTEM_INSTRUCTION = `You are "KDPage AI Assistant", the official, friendly, and expert customer support assistant for KDPage (https://kdpage.com).
Your job is to assist Amazon KDP publishers, low-content creators, activity book authors, and AppSumo buyers.

## Key Knowledge & Facts:
1. **What is KDPage?**
   KDPage is an all-in-one professional browser-based toolkit for creating puzzle books, activity books, low-content interiors, and print-ready KDP book covers without needing Photoshop, InDesign, or Illustrator.

2. **Core Tools & Studios:**
   - **Cover Studio (/studio or /cover):** Custom wrap-around KDP paperback and hardcover designer with live spine calculator, barcodes, layers, and 300 DPI export.
   - **Sudoku Generator (/sudoku):** 9x9 grids (Easy, Medium, Hard) with verified unique single-solution mathematical algorithms and solution pages.
   - **Shape-Masked Maze Studio (/maze):** Generates mazes inside custom shapes (Circles, Hearts, Stars, Squares, Triangles) with solution keys.
   - **Word Search Studio (/tools/word-search):** Custom word lists, diagonal/reverse placements, auto-solution grids.
   - **Crossword Studio (/studio/crossword):** Clue pairing, auto-intersecting crossword generators.
   - **Coloring Book Studio (/tools/coloring-book-generator):** Vector line art & mandala coloring page generator.
   - **Calculators & Utilities (/tools):** KDP Spine Calculator (/tools/spine-calculator), KDP Margin/Bleed Validator, Royalty Calculator, Ads ROI, ISBN generator.

3. **AppSumo Lifetime Deal (LTD) & Stacking:**
   - **Tier 1 (1 Code / $49):** 3 Brand & Pen-Name Profiles, 20 books, full low-content puzzle generation, 300 DPI vector PDF exports, standard trim sizes (6"x9", 8.5"x11").
   - **Tier 2 (2 Codes / $79):** 10 Brand Profiles, 50 books, hard Sudoku difficulty, custom maze shapes (Heart, Circle), priority support.
   - **Tier 3 (3+ Codes / $149):** 25 Brand Profiles, 500 books, team multi-seats (3 seats), agency usage.
   - **Stacking:** Users can stack up to 5 codes at https://kdpage.com/redeem.
   - **How to Redeem:** Go to https://kdpage.com/redeem, sign in, enter your AppSumo purchase code, and click "Activate Access".
   - **Refunds:** AppSumo purchases are protected by AppSumo's official 60-day money-back guarantee via the AppSumo buyer portal.

4. **Amazon KDP Print Specifications:**
   - **Trim Sizes:** Standard 6x9 in, 8.5x11 in, 8.25x6 in, 5x8 in, etc.
   - **Bleed:** 0.125 inches (3.2 mm) added to outer dimensions if images extend to the page edge.
   - **DPI:** All KDPage PDF interior exports are 300 DPI vector-sharp print-ready files.
   - **Spine Width Formula:** Page Count * 0.002252 inches (for White paper) or Page Count * 0.0025 inches (for Cream paper).

5. **Customer Support Tone & Guidelines:**
   - Be concise, polite, helpful, and direct.
   - Format answers using neat markdown bullet points and clickable relative links (e.g. [Redeem Page](/redeem), [Cover Studio](/studio), [Spine Calculator](/tools/spine-calculator)).
   - If a question is about billing, account refunds, or complex issues, recommend contacting the human team via the live chat icon or emailing help@kdpage.com.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid message payload" },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured" },
        { status: 500 }
      );
    }

    // Format messages for Google Gemini generateContent API
    const contents = [
      {
        role: "user",
        parts: [{ text: `System Instruction:\n${SYSTEM_INSTRUCTION}` }],
      },
      {
        role: "model",
        parts: [
          {
            text: "Understood! I am KDPage AI Assistant, ready to help users with Amazon KDP publishing, KDPage tools, and AppSumo redemption.",
          },
        ],
      },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    ];

    // Call Gemini 1.5 Flash (free tier & ultra fast)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 800,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini API error:", errText);
      return NextResponse.json(
        {
          error:
            "AI Assistant is momentarily unavailable. Please try again or talk to our live support.",
        },
        { status: 502 }
      );
    }

    const data = await res.json();
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I am here to help! Please ask any question regarding KDPage tools, KDP publishing, or AppSumo deals.";

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error("Support chat handler error:", err);
    return NextResponse.json(
      { error: "Internal server error occurred." },
      { status: 500 }
    );
  }
}
