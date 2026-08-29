import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: Request) {
  const { title, category, culture, address, price, quantity, imageData } =
    await req.json();
  const me = await getCurrentUser();

  if (!title?.trim() || !culture?.trim() || !address?.trim()) {
    return NextResponse.json(
      { error: "Name, culture and pickup address are required" },
      { status: 400 }
    );
  }

  const parsedPrice =
    price !== undefined && price !== null && `${price}`.trim() !== ""
      ? Number(price)
      : null;

  // Try to link the listing to a known plant by name so it joins the
  // recipe-matching and identify flows automatically.
  const plant = await db.plant.findFirst({
    where: { commonName: { contains: title.trim().split(" ")[0] } },
  });

  const listing = await db.listing.create({
    data: {
      userId: me.id,
      plantId: plant?.id ?? null,
      type: parsedPrice != null && parsedPrice > 0 ? "SELL" : "GIVE",
      category: category?.trim() || "other",
      title: title.trim(),
      culture: culture.trim(),
      address: address.trim(),
      price: parsedPrice != null && parsedPrice > 0 ? parsedPrice : null,
      quantity: quantity?.trim() || "1",
      imageData: typeof imageData === "string" && imageData.startsWith("data:image/")
        ? imageData
        : null,
    },
  });

  return NextResponse.json({ ok: true, listing: { id: listing.id } });
}
