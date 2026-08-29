import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      suburb,
      heritage,
      bio,
      avatarData,
    } = body as {
      name?: unknown;
      suburb?: unknown;
      heritage?: unknown;
      bio?: unknown;
      avatarData?: unknown;
    };

    const id = await getCurrentUserId();

    const data: {
      name?: string;
      suburb?: string;
      heritage?: string;
      bio?: string;
      avatarData?: string | null;
    } = {};

    if (typeof name === "string" && name.trim()) {
      data.name = name.trim();
    }

    if (typeof suburb === "string" && suburb.trim()) {
      data.suburb = suburb.trim();
    }

    if (typeof heritage === "string" && heritage.trim()) {
      data.heritage = heritage.trim();
    }

    if (typeof bio === "string") {
      data.bio = bio.trim();
    }

    if (avatarData === null) {
      data.avatarData = null;
    }

    if (
      typeof avatarData === "string" &&
      avatarData.startsWith("data:image/")
    ) {
      data.avatarData = avatarData;
    }

    const user = await db.user.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        suburb: user.suburb,
        heritage: user.heritage,
        bio: user.bio,
        avatarData: user.avatarData,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to update profile",
      },
      { status: 500 }
    );
  }
}