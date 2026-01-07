//POST localhost:3000/api/demo/blocking

import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { NextResponse } from "next/server";

export const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY
});

export async function POST() {
  const response = await generateText({
    model: google("gemini-2.5-flash"),
    prompt: "Hello, world!",
    
  });

  return Response.json({ response });
}
