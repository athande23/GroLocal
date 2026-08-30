import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

type MessageRequest = {
  toId?: unknown;
  body?: unknown;
};

export async function POST(
  req: Request
): Promise<Response> {
  try {
    const me = await getCurrentUser();

    const data =
      (await req.json()) as MessageRequest;

    if (
      typeof data.toId !== "string" ||
      data.toId.trim().length === 0
    ) {
      return NextResponse.json(
        {
          error: "Recipient is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof data.body !== "string" ||
      data.body.trim().length === 0
    ) {
      return NextResponse.json(
        {
          error: "Message body is required.",
        },
        {
          status: 400,
        }
      );
    }

    const toId = data.toId.trim();
    const body = data.body.trim();

    if (toId === me.id) {
      return NextResponse.json(
        {
          error: "You cannot message yourself.",
        },
        {
          status: 400,
        }
      );
    }

    const recipient = await db.user.findUnique({
      where: {
        id: toId,
      },
    });

    if (!recipient) {
      return NextResponse.json(
        {
          error: "Recipient not found.",
        },
        {
          status: 404,
        }
      );
    }

    const message = await db.message.create({
      data: {
        fromId: me.id,
        toId,
        body,
      },
    });

    return NextResponse.json(
      {
        message: {
          id: message.id,
          fromId: message.fromId,
          toId: message.toId,
          body: message.body,
          createdAt: message.createdAt,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Message API error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to send message.",
      },
      {
        status: 500,
      }
    );
  }
}