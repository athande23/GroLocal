import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { listingId } = await req.json();
  if (!listingId) {
    return NextResponse.json({ error: "Missing listingId" }, { status: 400 });
  }

  const listing = await db.listing.update({
    where: { id: listingId },
    data: { claimed: true },
    include: { user: true, plant: true },
  });

  return NextResponse.json({
    ok: true,
    pickup: {
      gardener: listing.user.name,
      suburb: listing.user.suburb,
      note: `${listing.user.name.split(" ")[0]} will leave it by the front gate. Suggested pickup: Saturday morning, 9 to 11 am.`,
    },
  });
}
