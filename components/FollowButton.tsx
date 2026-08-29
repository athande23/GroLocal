"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function FollowButton({
  followingId,
  initialFollowing,
  initialFollowers,
}: {
  followingId: string;
  initialFollowing: boolean;
  initialFollowers: number;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [followers, setFollowers] = useState(initialFollowers);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    // optimistic
    setFollowing(!following);
    setFollowers(followers + (following ? -1 : 1));
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followingId }),
      });
      const data = await res.json();
      if (typeof data.followers === "number") {
        setFollowing(data.following);
        setFollowers(data.followers);
      }
      router.refresh();
    } catch {
      // revert on failure
      setFollowing(following);
      setFollowers(followers);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={toggle}
        disabled={busy}
        className={`rounded-md px-4 py-2 text-[15px] font-medium transition-colors duration-150 ${
          following
            ? "border border-paper/40 text-paper hover:border-paper"
            : "bg-paper text-ink hover:bg-paper/85"
        }`}
      >
        {following ? "Following" : "Follow"}
      </button>
      <span className="text-[13px] text-paper/70">
        {followers} follower{followers === 1 ? "" : "s"}
      </span>
    </div>
  );
}
