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
  "growingNotes": {
    "sunlight": string,
    "water": string,
    "season": string
  },
  "notes": string
}

Describe how the plant is used in the cuisines and traditions where it is commonly grown. Do not invent a personal or family story about anyone.`;

const FALLBACK = {
  commonName: "Curry Leaf",
  botanicalName: "Murraya koenigii",
  confidence: "high" as const,
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

type Identification = typeof FALLBACK;

type RequestBody = {
  imageBase64?: unknown;
  mediaType?: unknown;
};

type Grower = {
  id: string;
  name: string;
  suburb: string;
  heritage: string;
  avatarSeed: string;
  quantity: number;
  distance: number;
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isValidMediaType(
  mediaType: string
): mediaType is
  | "image/jpeg"
  | "image/png"
  | "image/gif"
  | "image/webp" {
  return (
    mediaType === "image/jpeg" ||
    mediaType === "image/png" ||
    mediaType === "image/gif" ||
    mediaType === "image/webp"
  );
}

async function identify(
  imageBase64: string,
  mediaType: string
): Promise<Identification> {
  if (
    process.env.DEMO_MODE === "true" ||
    !process.env.ANTHROPIC_API_KEY
  ) {
    await delay(900);
    return FALLBACK;
  }

  try {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const safeMediaType = isValidMediaType(mediaType)
      ? mediaType
      : "image/jpeg";

    const message = await client.messages.create({
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
                media_type: safeMediaType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: "Identify this plant.",
            },
          ],
        },
      ],
    });

    const text = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("")
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    if (!text) {
      return FALLBACK;
    }

    const parsed: unknown = JSON.parse(text);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("commonName" in parsed) ||
      !("botanicalName" in parsed)
    ) {
      return FALLBACK;
    }

    return parsed as Identification;
  } catch (error) {
    console.error(
      "Plant identification failed:",
      error
    );

    return FALLBACK;
  }
}

export async function POST(
  req: Request
): Promise<Response> {
  try {
    const body =
      (await req.json()) as RequestBody;

    if (
      typeof body.imageBase64 !== "string" ||
      body.imageBase64.length === 0
    ) {
      return NextResponse.json(
        {
          error: "Image data is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof body.mediaType !== "string" ||
      body.mediaType.length === 0
    ) {
      return NextResponse.json(
        {
          error: "Image media type is required.",
        },
        {
          status: 400,
        }
      );
    }

    const result = await identify(
      body.imageBase64,
      body.mediaType
    );

    const me = await getCurrentUser();

    const name = result.commonName
      .toLowerCase()
      .trim();

    const firstWord =
      name.split(/\s+/)[0];

    const plant = await db.plant.findFirst({
      where: {
        commonName: {
          contains: firstWord,
        },
      },
      include: {
        gardenPlants: {
          include: {
            user: true,
          },
        },
      },
    });

    // Prisma infers the type of gardenPlants
    // from the include above.
    const gardenPlants =
      plant?.gardenPlants ?? [];

    const growers: Grower[] = [];

    for (const gardenPlant of gardenPlants) {
      if (gardenPlant.user.id === me.id) {
        continue;
      }

      const distance: number = distanceKm(
        me.lat,
        me.lng,
        gardenPlant.user.lat,
        gardenPlant.user.lng
      );

      if (distance > 5) {
        continue;
      }

      growers.push({
        id: gardenPlant.user.id,
        name: gardenPlant.user.name,
        suburb: gardenPlant.user.suburb,
        heritage: gardenPlant.user.heritage,
        avatarSeed: gardenPlant.user.avatarSeed,
        quantity: Number(gardenPlant.quantity),
        distance,
      });
    }

    growers.sort(
      (a: Grower, b: Grower): number =>
        a.distance - b.distance
    );

    const nearestGrowers: Grower[] =
      growers.slice(0, 3);

    return NextResponse.json({
      ...result,
      growers: nearestGrowers,
      matchedPlantName:
        plant?.commonName ?? null,
    });
  } catch (error) {
    console.error(
      "Identify route error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to identify plant.",
      },
      {
        status: 500,
      }
    );
  }
}