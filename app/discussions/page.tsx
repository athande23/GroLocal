import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/session";
import DiscussionsView from "@/components/DiscussionsView";

export const metadata: Metadata = {
  title: "Discussions",
  description: "Recipes and growing advice from gardeners near you.",
};

export const dynamic = "force-dynamic";

export default async function DiscussionsPage(): Promise<React.ReactElement> {
  const meId = await getCurrentUserId();

  const posts = await db.post.findMany({
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const discussionPosts = posts.map((post: typeof posts[0]) => ({
    id: post.id,
    kind: post.kind,
    title: post.title,
    body: post.body,
    culture: post.culture,
    authorId: post.user.id,
    authorName: post.user.name,
    authorSuburb: post.user.suburb,
    authorAvatarSeed: post.user.avatarSeed,
    authorAvatarData: post.user.avatarData,
    mine: post.user.id === meId,
    date: post.createdAt.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
    }),
  }));

  return <DiscussionsView posts={discussionPosts} />;
}