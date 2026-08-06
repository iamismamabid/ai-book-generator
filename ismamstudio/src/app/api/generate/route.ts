import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { auth } from "@clerk/nextjs/server";
import { checkPremiumStatus, getUserUsage } from "../../actions";
import { getPostHogClient } from "@/lib/posthog-server";
import { AI_FEATURES_ENABLED } from "@/lib/features";

// 🚨 Next.js-কে নির্দেশ দেওয়া যেন সে ডাটা আটকে (Buffer) না রাখে
export const dynamic = 'force-dynamic'; 
export const maxDuration = 60; // এআইয়ের ভাবার সময় বাড়িয়ে দেওয়া

export async function POST(req: Request) {
  // ১. AI ফিচার বন্ধ থাকলে এখানেই থামা — UI লুকানো থাকলেও এন্ডপয়েন্টটি
  // সরাসরি কল করা যেত, তাই সার্ভার-সাইডেও বন্ধ রাখা হয়েছে।
  if (!AI_FEATURES_ENABLED) {
    return new Response("Not Found", { status: 404 });
  }

  // ২. ইউজার লগ-ইন করা আছে কি না চেক করা
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  // ৩. প্ল্যান এবং ইউজ লিমিট চেক করা
  const premium = await checkPremiumStatus();
  const usage = await getUserUsage();

  if (premium.plan === "free" && usage.outlinesCount >= 1) {
    return new Response("Monthly outline limit reached (1/mo). Please upgrade to Starter or Pro to generate more outlines.", { status: 403 });
  }
  if (premium.plan === "starter" && usage.outlinesCount >= 5) {
    return new Response("Monthly outline limit reached (5/mo). Please upgrade to Pro to generate more outlines.", { status: 403 });
  }

  // ৪. ফ্রন্টএন্ড থেকে আসা প্রম্পট এবং প্যারামিটার রিসিভ করা
  const { prompt, genre, tone, audience } = await req.json();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response("GROQ_API_KEY is missing", { status: 500 });
  }

  // ১. Groq-কে OpenAI এর ফরম্যাটে কনফিগার করা
  const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey,
  });

  // ৫. এআই-এর ইনস্ট্রাকশন (সিস্টেম প্রম্পট)
  const systemPrompt = `Generate a book outline based on this idea: "${prompt}".
  Target Genre: ${genre || 'General Fiction'}
  Narrative Tone: ${tone || 'Engaging'}
  Target Audience: ${audience || 'General Readers'}
  Provide the output in this exact format:
  **Book Title:** "Title Name"
  **Book Blurb:** A short description.
  **Chapter Outline:**
  **Chapter 1:** Brief description.
  **Chapter 2:** Brief description.
  **Chapter 3:** Brief description.`;

  // ৬. Vercel AI SDK দিয়ে স্ট্রিমিং শুরু করা

  // Track the outline generation server-side
  const posthogClient = getPostHogClient();
  posthogClient.capture({
    distinctId: userId,
    event: 'server_book_outline_requested',
    properties: {
      genre: genre || 'General Fiction',
      tone: tone || 'Engaging',
      audience: audience || 'General Readers',
      plan: premium.plan,
    },
  });
  await posthogClient.flush();

  const result = await streamText({
    model: groq('llama-3.3-70b-versatile'),
    prompt: systemPrompt,
  });

  // ৭. ডাটাগুলোকে পাইপলাইনের মাধ্যমে (Stream) ফ্রন্টএন্ডে পাঠানো
  return result.toTextStreamResponse();
}
