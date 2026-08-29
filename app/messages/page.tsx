import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import MessagesView, { type Thread } from "@/components/MessagesView";

export const metadata: Metadata = {
  title: "Messages",
  description: "Talk to neighbours about pickups, swaps and advice.",
};

export const dynamic = "force-dynamic";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string }>;
}) {
  const params = await searchParams;
  const me = await getCurrentUser();

  const messages = await db.message.findMany({
    where: { OR: [{ fromId: me.id }, { toId: me.id }] },
    include: { from: true, to: true },
    orderBy: { createdAt: "asc" },
  });

  const threadMap = new Map<string, Thread>();
  for (const m of messages) {
    const other = m.fromId === me.id ? m.to : m.from;
    const thread = threadMap.get(other.id) ?? {
      otherId: other.id,
      otherName: other.name,
      otherSuburb: other.suburb,
      otherAvatarSeed: other.avatarSeed,
      otherAvatarData: other.avatarData,
      messages: [],
    };
    thread.messages.push({
      id: m.id,
      mine: m.fromId === me.id,
      body: m.body,
      at: m.createdAt.toLocaleString("en-AU", {
        weekday: "short",
        hour: "numeric",
        minute: "2-digit",
      }),
    });
    threadMap.set(other.id, thread);
  }

  // If arriving via a "Message" button for someone new, open an empty thread.
  if (params.to && params.to !== me.id && !threadMap.has(params.to)) {
    const other = await db.user.findUnique({ where: { id: params.to } });
    if (other) {
      threadMap.set(other.id, {
        otherId: other.id,
        otherName: other.name,
        otherSuburb: other.suburb,
        otherAvatarSeed: other.avatarSeed,
        otherAvatarData: other.avatarData,
        messages: [],
      });
    }
  }

  const threads = [...threadMap.values()].sort((a, b) => {
    const lastA = a.messages[a.messages.length - 1]?.id ?? "";
    const lastB = b.messages[b.messages.length - 1]?.id ?? "";
    return lastB.localeCompare(lastA);
  });

  return <MessagesView threads={threads} initialOpenId={params.to ?? null} />;
}
