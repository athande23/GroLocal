import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/session";

export async function POST(req: Request) {
  const { kind, title, body, culture } = await req.json();
  const userId = await getCurrentUserId();

  if (!title?.trim() || !body?.trim()) {
    return NextResponse.json(
      { error: "Title and body are required" },
      { status: 400 }
    );
  }

  const post = await db.post.create({
    data: {
      userId,
      kind: kind === "recipe" ? "recipe" : "advice",
      title: title.trim(),
      body: body.trim(),
      culture: culture?.trim() || null,
    },
  });

  return NextResponse.json({ ok: true, post });
}
