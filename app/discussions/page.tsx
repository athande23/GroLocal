import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/session";
import DiscussionsView from "@/components/DiscussionsView";

export const metadata: Metadata = {
  title: "Discussions",
  description: "Recipes and growing advice from gardeners near you.",
};

export const dynamic = "force-dynamic";

export default async function DiscussionsPage() {
  const meId = await getCurrentUserId();
  const posts = await db.post.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DiscussionsView
      posts={posts.map((p) => ({
        id: p.id,
        kind: p.kind,
        title: p.title,
        body: p.body,
        culture: p.culture,
        authorId: p.user.id,
        authorName: p.user.name,
        authorSuburb: p.user.suburb,
        authorAvatarSeed: p.user.avatarSeed,
        authorAvatarData: p.user.avatarData,
        mine: p.user.id === meId,
        date: p.createdAt.toLocaleDateString("en-AU", {
          day: "numeric",
          month: "short",
        }),
      }))}
    />
  );
}
