import { GoogleGenAI } from "@google/genai";
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

"normalised" is a lowercase common garden-plant name suitable for matching a plant database, e.g. "coriander", "curry leaf", "tomato", "chilli", "lemongrass".

Only include ingredients that could be grown in a home garden: herbs, vegetables, fruit, aromatics.

Exclude meat, dairy, oils, salt, spices sold only dried, water, rice and flour.`;

type ExtractedIngredient = {
  name: string;
  normalised: string;
  quantity: string;
};

type ExtractedResponse = {
  ingredients: ExtractedIngredient[];
};

const FALLBACK: ExtractedResponse = {
  ingredients: [
    {
      name: "Fresh curry leaves",
      normalised: "curry leaf",
      quantity: "2 sprigs",
    },
    {
      name: "Green chillies",
      normalised: "chilli",
      quantity: "3, slit",
    },
    {
      name: "Ripe tomatoes",
      normalised: "tomato",
      quantity: "400 g",
    },
    {
      name: "Fresh coriander",
      normalised: "coriander",
      quantity: "1 bunch",
    },
    {
      name: "Ginger",
      normalised: "ginger",
      quantity: "thumb-sized piece",
    },
    {
      name: "Fresh turmeric",
      normalised: "turmeric",
      quantity: "1 small knob",
    },
  ],
};

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

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function extractIngredients(
  recipeText: string
): Promise<ExtractedIngredient[]> {
  if (process.env.DEMO_MODE === "true") {
    await delay(900);
    return FALLBACK.ingredients;
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not configured.");
    return FALLBACK.ingredients;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `${SYSTEM}

Extract the plant-based ingredients from this recipe:

${recipeText}`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text?.trim();

    if (!text) {
      return FALLBACK.ingredients;
    }

    const parsed: unknown = JSON.parse(text);

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "ingredients" in parsed
    ) {
      const data = parsed as {
        ingredients?: unknown;
      };

      if (Array.isArray(data.ingredients)) {
        const validIngredients = data.ingredients.filter(
          (ingredient): ingredient is ExtractedIngredient => {
            if (
              typeof ingredient !== "object" ||
              ingredient === null
            ) {
              return false;
            }

            const item = ingredient as Record<string, unknown>;

            return (
              typeof item.name === "string" &&
              typeof item.normalised === "string" &&
              typeof item.quantity === "string"
            );
          }
        );

        if (validIngredients.length > 0) {
          return validIngredients;
        }
      }
    }

    return FALLBACK.ingredients;
  } catch (error) {
    console.error("Gemini API error:", error);
    return FALLBACK.ingredients;
  }
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body: unknown = await req.json();

    const recipeText =
      typeof body === "object" &&
      body !== null &&
      "recipeText" in body &&
      typeof (body as { recipeText?: unknown }).recipeText === "string"
        ? (body as { recipeText: string }).recipeText
        : "";

    const me = await getCurrentUser();

    const ingredients = await extractIngredients(recipeText);

    const plants = await db.plant.findMany({
      include: {
        gardenPlants: {
          include: {
            user: true,
          },
        },
        listings: {
          where: {
            claimed: false,
          },
          include: {
            user: true,
          },
        },
      },
    });

    const results = ingredients.map((ingredient) => {
      const raw = ingredient.normalised.toLowerCase().trim();
      const target = aliases[raw] ?? raw;

      const plant = plants.find((plantItem: (typeof plants)[number]) => {
        const common = plantItem.commonName.toLowerCase();

        return (
          common === target ||
          common.includes(target) ||
          target.includes(common)
        );
      });

      if (!plant) {
        return {
          ingredient: ingredient.name,
          quantity: ingredient.quantity,
          match: null,
        };
      }

      const growers = plant.gardenPlants
        .filter(
          (gardenPlant: (typeof plant.gardenPlants)[number]) =>
            gardenPlant.user.id !== me.id
        )
        .map((gardenPlant: (typeof plant.gardenPlants)[number]) => ({
          gardener: gardenPlant.user,
          distance: distanceKm(
            me.lat,
            me.lng,
            gardenPlant.user.lat,
            gardenPlant.user.lng
          ),
        }))
        .sort((a: { gardener: (typeof plant.gardenPlants)[number]['user']; distance: number }, b: { gardener: (typeof plant.gardenPlants)[number]['user']; distance: number }) => a.distance - b.distance);

      const nearest = growers[0];

      if (!nearest) {
        return {
          ingredient: ingredient.name,
          quantity: ingredient.quantity,
          match: {
            plantName: plant.commonName,
            gardener: null,
            availability: null,
          },
        };
      }

      const listing =
        plant.listings.find(
          (listingItem: typeof plant.listings[number]) =>
            listingItem.user.id === nearest.gardener.id
        ) ?? plant.listings[0];

      return {
        ingredient: ingredient.name,
        quantity: ingredient.quantity,
        match: {
          plantName: plant.commonName,
          gardener: {
            id: nearest.gardener.id,
            name: nearest.gardener.name,
            suburb: nearest.gardener.suburb,
            distance: nearest.distance,
          },
          availability: listing
            ? {
                type: listing.type,
                price: listing.price,
                title: listing.title,
              }
            : null,
        },
      };
    });

    return NextResponse.json({
      results,
    });
  } catch (error) {
    console.error("Recipe API error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong processing the recipe.",
      },
      {
        status: 500,
      }
    );
  }
}