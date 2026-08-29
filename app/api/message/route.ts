import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/session";

export async function POST(req: Request) {
  const { toId, body } = await req.json();
  const fromId = await getCurrentUserId();

  if (!toId || toId === fromId || !body?.trim()) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  const message = await db.message.create({
    data: { fromId, toId, body: body.trim() },
  });

  return NextResponse.json({ ok: true, message });
}
