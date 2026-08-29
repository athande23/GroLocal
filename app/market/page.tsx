import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { distanceKm } from "@/lib/distance";
import MarketView, { type MarketListing } from "@/components/MarketView";

export const metadata: Metadata = {
  title: "Market",
  description:
    "Vegetables, herbs, fruit and tools shared by neighbours, with a map of where everything is.",
};

export const dynamic = "force-dynamic";

export default async function MarketPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; culture?: string }>;
}) {
  const params = await searchParams;
  const me = await getCurrentUser();

  const listings = await db.listing.findMany({
    include: { plant: true, user: true },
    orderBy: { createdAt: "desc" },
  });

  const items: MarketListing[] = listings.map((l, i) => ({
    id: l.id,
    title: l.title,
    type: l.type,
    category: l.category,
    culture: l.culture,
    address: l.address,
    price: l.price,
    swapFor: l.swapFor,
    quantity: l.quantity,
    imageData: l.imageData,
    claimed: l.claimed,
    plantName: l.plant?.commonName ?? null,
    gardenerId: l.user.id,
    gardenerName: l.user.name,
    suburb: l.user.suburb,
    // Jitter stacked listings from the same address so every pin is visible.
    lat: l.user.lat + ((i % 5) - 2) * 0.0006,
    lng: l.user.lng + ((Math.floor(i / 5) % 5) - 2) * 0.0006,
    distance: distanceKm(me.lat, me.lng, l.user.lat, l.user.lng),
    isMine: l.userId === me.id,
  }));

  const cultures = [...new Set(items.map((l) => l.culture))].sort();
  const categories = [...new Set(items.map((l) => l.category))].sort();

  return (
    <MarketView
      items={items}
      cultures={cultures}
      categories={categories}
      initialQuery={params.q ?? ""}
      initialCulture={params.culture ?? ""}
    />
  );
}
