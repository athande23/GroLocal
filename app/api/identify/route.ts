import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { distanceKm } from "@/lib/distance";

const SYSTEM = `You identify plants from photographs for a community gardening app.
Respond with ONLY a JSON object, no markdown fences, no preamble, matching:
{
  "commonName": string,
  "botanicalName": string,
  "confidence": "high" | "medium" | "low",
  "origin": string,
  "culturalUses": string[],
  "growingNotes": { "sunlight": string, "water": string, "season": string },
  "notes": string
}
Describe how the plant is used in the cuisines and traditions where it is
commonly grown. Do not invent a personal or family story about anyone.`;

const FALLBACK = {
  commonName: "Curry Leaf",
  botanicalName: "Murraya koenigii",
  confidence: "high",
  origin: "Indian subcontinent",
  culturalUses: [
    "Tempered in hot oil at the start of South Indian curries and dals",
    "Ground fresh into chutneys and spice pastes",
    "Used in Sri Lankan and Malaysian cooking",
  ],
  growingNotes: {
    sunlight: "Full sun",
    water: "Moderate, weekly",
    season: "Spring to autumn",
  },
  notes: "Frost sensitive. Thrives in Sydney's warm months.",
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Identification = typeof FALLBACK;

async function identify(
  imageBase64: string,
  mediaType: string
): Promise<Identification> {
  if (process.env.DEMO_MODE === "true" || !process.env.ANTHROPIC_API_KEY) {
    await delay(900);
    return FALLBACK;
  }
  try {
    const client = new Anthropic();
    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as "image/jpeg",
                data: imageBase64,
              },
            },
            { type: "text", text: "Identify this plant." },
          ],
        },
      ],
    });
    const text = msg.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("")
      .replace(/```json|```/g, "")
      .trim();
    return JSON.parse(text);
  } catch (err) {
    console.error(err);
    return FALLBACK;
  }
}

export async function POST(req: Request) {
  const { imageBase64, mediaType } = await req.json();
  const result = await identify(imageBase64, mediaType);

  // The AI answer alone is a party trick; the neighbours who grow it
  // are the product. Find gardeners within 5 km growing this plant.
  const me = await getCurrentUser();
  const name = result.commonName?.toLowerCase() ?? "";
  const plant = await db.plant.findFirst({
    where: { commonName: { contains: name.split(" ")[0] } },
    include: { gardenPlants: { include: { user: true } } },
  });

  const growers = (plant?.gardenPlants ?? [])
    .filter((gp) => gp.user.id !== me.id)
    .map((gp) => ({
      id: gp.user.id,
      name: gp.user.name,
      suburb: gp.user.suburb,
      heritage: gp.user.heritage,
      avatarSeed: gp.user.avatarSeed,
      quantity: gp.quantity,
      distance: distanceKm(me.lat, me.lng, gp.user.lat, gp.user.lng),
    }))
    .filter((g) => g.distance <= 5)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);

  return NextResponse.json({ ...result, growers, matchedPlantName: plant?.commonName ?? null });
}
