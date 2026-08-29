import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `
You are the GroLocal website assistant.

GroLocal is a community gardening app where neighbours share plants,
recipes, gardening knowledge, seeds, produce and cultural food stories.

Your job is to answer questions about:
- Gardening
- Growing vegetables, herbs and fruit
- Plant care
- Ingredients
- Recipes
- Substituting ingredients
- Which ingredients can be grown at home

Keep answers simple, helpful and suitable for a prototype.

If the user asks for a recipe, provide:
1. Ingredients
2. Simple instructions

Do not claim that you have access to GroLocal's database unless the
information has actually been provided to you.

Keep responses relatively short and easy to read.
`;

export async function POST(request: Request) {
  try {
    const body: { message?: string } = await request.json();

    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing.");

      return NextResponse.json(
        { error: "Gemini API key is missing." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent(message);

    const reply = result.response.text();

    return NextResponse.json({
      reply,
    });
  } catch (error: unknown) {
    console.error("Gemini API error:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown Gemini error";

    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}