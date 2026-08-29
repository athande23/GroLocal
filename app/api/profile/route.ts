import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/session";

export async function POST(req: Request) {
  const { bio, avatarData } = await req.json();
  const id = await getCurrentUserId();

  const data: { bio?: string; avatarData?: string | null } = {};
  if (typeof bio === "string" && bio.trim()) data.bio = bio.trim();
  if (avatarData === null) data.avatarData = null;
  if (typeof avatarData === "string" && avatarData.startsWith("data:image/")) {
    data.avatarData = avatarData;
  }

  const user = await db.user.update({ where: { id }, data });
  return NextResponse.json({ ok: true, user: { id: user.id } });
}
