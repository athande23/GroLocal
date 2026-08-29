import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: Request) {
  const { listingId } = await req.json();

  if (!listingId) {
    return NextResponse.json(
      { error: "Missing listingId" },
      { status: 400 }
    );
  }

  const me = await getCurrentUser();

  const listing = await db.listing.findUnique({
    where: { id: listingId },
    include: {
      user: true,
      plant: true,
    },
  });

  if (!listing) {
    return NextResponse.json(
      { error: "Listing not found" },
      { status: 404 }
    );
  }

  if (listing.claimed) {
    return NextResponse.json(
      { error: "This item has already been purchased" },
      { status: 400 }
    );
  }

  const updatedListing = await db.listing.update({
    where: { id: listingId },
    data: {
      claimed: true,
      claimedById: me.id,
    },
    include: {
      user: true,
      plant: true,
    },
  });

  return NextResponse.json({
    ok: true,
    pickup: {
      gardener: updatedListing.user.name,
      suburb: updatedListing.user.suburb,
      note: `${updatedListing.user.name.split(" ")[0]} will leave it by the front gate. Suggested pickup: Saturday morning, 9 to 11 am.`,
    },
  });
}