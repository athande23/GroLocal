import type { Metadata } from "next";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import MessagesView, {
  type Thread,
} from "@/components/MessagesView";

export const metadata: Metadata = {
  title: "Messages",
  description:
    "Talk to neighbours about pickups, swaps and advice.",
};

export const dynamic = "force-dynamic";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string }>;
}): Promise<React.ReactElement> {
  const params = await searchParams;
  const me = await getCurrentUser();

  const messages = await db.message.findMany({
    where: {
      OR: [
        { fromId: me.id },
        { toId: me.id },
      ],
    },
    include: {
      from: true,
      to: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  type ThreadMessage = Thread["messages"][number];

  const threadMap = new Map<string, Thread>();

  for (const message of messages) {
    const other =
      message.fromId === me.id
        ? message.to
        : message.from;

    let thread = threadMap.get(other.id);

    if (!thread) {
      thread = {
        otherId: other.id,
        otherName: other.name,
        otherSuburb: other.suburb,
        otherAvatarSeed: other.avatarSeed,
        otherAvatarData: other.avatarData,
        messages: [],
      };

      threadMap.set(other.id, thread);
    }

    const threadMessage: ThreadMessage = {
      id: message.id,
      mine: message.fromId === me.id,
      body: message.body,
      at: message.createdAt.toLocaleString(
        "en-AU",
        {
          weekday: "short",
          hour: "numeric",
          minute: "2-digit",
        }
      ),
    };

    thread.messages.push(threadMessage);
  }

  if (
    params.to &&
    params.to !== me.id &&
    !threadMap.has(params.to)
  ) {
    const other = await db.user.findUnique({
      where: {
        id: params.to,
      },
    });

    if (other) {
      const newThread: Thread = {
        otherId: other.id,
        otherName: other.name,
        otherSuburb: other.suburb,
        otherAvatarSeed: other.avatarSeed,
        otherAvatarData: other.avatarData,
        messages: [],
      };

      threadMap.set(
        other.id,
        newThread
      );
    }
  }

  const threads: Thread[] = Array.from(
    threadMap.values()
  ).sort((a, b) => {
    const lastA =
      a.messages[
        a.messages.length - 1
      ]?.id ?? "";

    const lastB =
      b.messages[
        b.messages.length - 1
      ]?.id ?? "";

    return lastB.localeCompare(lastA);
  });

  return (
    <MessagesView
      threads={threads}
      initialOpenId={params.to ?? null}
    />
  );
}