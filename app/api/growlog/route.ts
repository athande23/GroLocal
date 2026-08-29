import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/session";

export async function POST(req: Request) {
  const { plantId, day, note } = await req.json();
  const userId = await getCurrentUserId();

  if (!plantId || typeof day !== "number" || !note?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const log = await db.growLog.create({
    data: { userId, plantId, day, note: note.trim() },
  });

  return NextResponse.json({ ok: true, log });
}
