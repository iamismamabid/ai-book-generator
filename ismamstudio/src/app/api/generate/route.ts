import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { auth } from "@clerk/nextjs/server";


// 🚨 Next.js-কে নির্দেশ দেওয়া যেন সে ডাটা আটকে (Buffer) না রাখে
export const dynamic = 'force-dynamic'; 
export const maxDuration = 60; // এআইয়ের ভাবার সময় বাড়িয়ে দেওয়া



export async function POST(req: Request) {
  // ২. ইউজার লগ-ইন করা আছে কি না চেক করা
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  // ৩. ফ্রন্টএন্ড থেকে আসা প্রম্পটটি রিসিভ করা
  const { prompt } = await req.json();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response("GROQ_API_KEY is missing", { status: 500 });
  }

  // ১. Groq-কে OpenAI এর ফরম্যাটে কনফিগার করা
  const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey,
  });

  // ৪. এআই-এর ইনস্ট্রাকশন (সিস্টেম প্রম্পট)
  const systemPrompt = `Generate a book outline based on this idea: "${prompt}".
  Provide the output in this exact format:
  **Book Title:** "Title Name"
  **Book Blurb:** A short description.
  **Chapter Outline:**
  **Chapter 1:** Brief description.
  **Chapter 2:** Brief description.
  **Chapter 3:** Brief description.`;

  // ৫. Vercel AI SDK দিয়ে স্ট্রিমিং শুরু করা
  const result = await streamText({
    model: groq('llama-3.3-70b-versatile'),
    prompt: systemPrompt,
  });

  // ৬. ডাটাগুলোকে পাইপলাইনের মাধ্যমে (Stream) ফ্রন্টএন্ডে পাঠানো
  //return result.toDataStreamResponse();// ❌ ভুল (পুরনো ভার্সনের মেথড):
// return result.toDataStreamResponse();

// ✅ সঠিক (নতুন ভার্সনের মেথড):
return result.toTextStreamResponse();

}
