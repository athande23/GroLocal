import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { distanceKm } from "@/lib/distance";

const SYSTEM = `You extract plant-based ingredients from recipes for a community gardening app.
Respond with ONLY a JSON object, no markdown fences, no preamble, matching:
{
  "ingredients": [
    { "name": string, "normalised": string, "quantity": string }
  ]
}
"name" is the ingredient as written in the recipe.
"normalised" is a lowercase common garden-plant name suitable for matching a
plant database, e.g. "coriander", "curry leaf", "tomato", "chilli", "lemongrass".
Only include ingredients that could be grown in a home garden: herbs, vegetables,
fruit, aromatics. Exclude meat, dairy, oils, salt, spices sold only dried,
water, rice and flour.`;

type ExtractedIngredient = { name: string; normalised: string; quantity: string };

const FALLBACK: { ingredients: ExtractedIngredient[] } = {
  ingredients: [
    { name: "Fresh curry leaves", normalised: "curry leaf", quantity: "2 sprigs" },
    { name: "Green chillies", normalised: "chilli", quantity: "3, slit" },
    { name: "Ripe tomatoes", normalised: "tomato", quantity: "400 g" },
    { name: "Fresh coriander", normalised: "coriander", quantity: "1 bunch" },
    { name: "Ginger", normalised: "ginger", quantity: "thumb-sized piece" },
    { name: "Fresh turmeric", normalised: "turmeric", quantity: "1 small knob" },
  ],
};

// Loose aliases so common recipe words land on the seeded plants.
const aliases: Record<string, string> = {
  tomato: "san marzano tomato",
  tomatoes: "san marzano tomato",
  "kaffir lime": "makrut lime",
  "kaffir lime leaves": "makrut lime",
  "lime leaves": "makrut lime",
  chillies: "bird's eye chilli",
  chilli: "bird's eye chilli",
  chili: "bird's eye chilli",
  "green chilli": "bird's eye chilli",
  basil: "sweet basil",
  shiso: "perilla",
  kkaennip: "perilla",
  "rau ram": "vietnamese mint",
  moringa: "drumstick tree",
  "vine leaves": "grape vine",
  "grape leaves": "grape vine",
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function extractIngredients(recipeText: string): Promise<ExtractedIngredient[]> {
  if (process.env.DEMO_MODE === "true" || !process.env.ANTHROPIC_API_KEY) {
    await delay(900);
    return FALLBACK.ingredients;
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
          content: `Extract the plant-based ingredients from this recipe:\n\n${recipeText}`,
        },
      ],
    });
    const text = msg.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("")
      .replace(/```json|```/g, "")
      .trim();
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed.ingredients) && parsed.ingredients.length > 0) {
      return parsed.ingredients;
    }
    return FALLBACK.ingredients;
  } catch (err) {
    console.error(err);
    return FALLBACK.ingredients;
  }
}

export async function POST(req: Request) {
  const { recipeText } = await req.json();
  const me = await getCurrentUser();
  const ingredients = await extractIngredients(recipeText ?? "");

  const plants = await db.plant.findMany({
    include: {
      gardenPlants: { include: { user: true } },
      listings: { where: { claimed: false }, include: { user: true } },
    },
  });

  const results = ingredients.map((ing) => {
    const raw = ing.normalised.toLowerCase().trim();
    const target = aliases[raw] ?? raw;

    const plant = plants.find((p) => {
      const common = p.commonName.toLowerCase();
      return (
        common === target ||
        common.includes(target) ||
        target.includes(common)
      );
    });

    if (!plant) {
      return { ingredient: ing.name, quantity: ing.quantity, match: null };
    }

    // Nearest gardener growing it, excluding the current user.
    const growers = plant.gardenPlants
      .filter((gp) => gp.user.id !== me.id)
      .map((gp) => ({
        gardener: gp.user,
        distance: distanceKm(me.lat, me.lng, gp.user.lat, gp.user.lng),
      }))
      .sort((a, b) => a.distance - b.distance);

    const nearest = growers[0];
    if (!nearest) {
      return {
        ingredient: ing.name,
        quantity: ing.quantity,
        match: { plantName: plant.commonName, gardener: null },
      };
    }

    const listing = plant.listings.find(
      (l) => l.user.id === nearest.gardener.id
    ) ?? plant.listings[0];

    return {
      ingredient: ing.name,
      quantity: ing.quantity,
      match: {
        plantName: plant.commonName,
        gardener: {
          id: nearest.gardener.id,
          name: nearest.gardener.name,
          suburb: nearest.gardener.suburb,
          distance: nearest.distance,
        },
        availability: listing
          ? { type: listing.type, price: listing.price, title: listing.title }
          : null,
      },
    };
  });

  return NextResponse.json({ results });
}
