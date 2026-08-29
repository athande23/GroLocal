"use client";

/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Camera, Check, Pencil } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { HeritageTag } from "@/components/ui/Tag";

export default function ProfileEditor({
  user,
}: {
  user: {
    name: string;
    suburb: string;
    heritage: string;
    bio: string;
    avatarSeed: string;
    avatarData: string | null;
  };
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(user.bio);
  const [busy, setBusy] = useState(false);

  async function save(payload: { bio?: string; avatarData?: string }) {
    setBusy(true);
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  function pickPhoto(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => save({ avatarData: reader.result as string });
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-wrap items-start gap-6">
      <div className="relative">
        <Avatar
          seed={user.avatarSeed}
          src={user.avatarData}
          name={user.name}
          size="xl"
        />
        <button
          onClick={() => fileRef.current?.click()}
          aria-label="Change profile picture"
          className="absolute -right-1 -bottom-1 rounded-full border border-line bg-paper p-2 text-graphite transition-colors duration-150 hover:text-ink"
        >
          <Camera size={16} strokeWidth={1.5} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-label="Upload a new profile picture"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) pickPhoto(f);
          }}
        />
      </div>

      <div className="min-w-0 flex-1">
        <h1 className="font-[family-name:var(--font-display)] text-[36px] font-semibold leading-[44px] text-ink">
          {user.name}
        </h1>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-[15px] text-graphite">
          {user.suburb}
          <HeritageTag heritage={user.heritage} />
        </p>

        {editing ? (
          <div className="mt-4 max-w-[640px]">
            <label className="block">
              <span className="sr-only">Your description</span>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-md border border-line bg-paper px-3 py-2 text-[15px] focus:border-green focus:outline-none focus:ring-2 focus:ring-green-soft"
              />
            </label>
            <button
              onClick={async () => {
                await save({ bio });
                setEditing(false);
              }}
              disabled={busy}
              className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-ink px-3.5 py-2 text-[15px] font-medium text-paper transition-colors duration-150 hover:bg-ink/85 disabled:opacity-50"
            >
              <Check size={15} strokeWidth={1.5} />
              {busy ? "Saving…" : "Save description"}
            </button>
          </div>
        ) : (
          <div className="mt-4 max-w-[640px]">
            <p className="text-[15px] leading-6 text-graphite">{user.bio}</p>
            <button
              onClick={() => setEditing(true)}
              className="mt-2 inline-flex items-center gap-1.5 text-[15px] font-medium text-green hover:underline"
            >
              <Pencil size={14} strokeWidth={1.5} />
              Edit description
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
