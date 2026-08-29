import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/session";

export async function POST(req: Request) {
  const { plantId, title, body, origin } = await req.json();
  const userId = await getCurrentUserId();

  if (!plantId || !title?.trim() || !body?.trim() || !origin?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const story = await db.story.create({
    data: {
      userId,
      plantId,
      title: title.trim(),
      body: body.trim(),
      origin: origin.trim(),
    },
  });

  return NextResponse.json({ ok: true, story });
}
