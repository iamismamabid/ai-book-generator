// FILE: src/app/api/generate/route.ts
// PURPOSE: Backend API to talk to Groq AI

import { createGroq } from '@ai-sdk/groq';
import { streamText } from 'ai';
// import { auth } from "@clerk/nextjs/server"; // Auth temporarily disabled for testing

export const dynamic = 'force-dynamic'; 
export const maxDuration = 60; 

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  // const { userId } = await auth();
  // if (!userId) {
  //   return new Response("Unauthorized", { status: 401 });
  // }

  const { prompt } = await req.json();

  const systemPrompt = `Generate a book outline based on this idea: "${prompt}".
  Provide the output in this exact format:
  **Book Title:** "Title Name"
  **Book Blurb:** A short description.
  **Chapter Outline:**
  **Chapter 1:** Brief description.
  **Chapter 2:** Brief description.
  **Chapter 3:** Brief description.`;

  const result = await streamText({
    model: groq('llama-3.3-70b-versatile'),
    prompt: systemPrompt,
  });

  return result.toTextStreamResponse();
}