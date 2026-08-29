import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/session";

export async function POST(req: Request) {
  const { followingId } = await req.json();
  const followerId = await getCurrentUserId();

  if (!followingId || followingId === followerId) {
    return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  }

  const existing = await db.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });

  if (existing) {
    await db.follow.delete({ where: { id: existing.id } });
  } else {
    await db.follow.create({ data: { followerId, followingId } });
  }

  const followers = await db.follow.count({ where: { followingId } });
  return NextResponse.json({ following: !existing, followers });
}
