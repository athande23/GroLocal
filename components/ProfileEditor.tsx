"use client";

/* eslint-disable @next/next/no-img-element */

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Camera, Check, Pencil, X } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { HeritageTag } from "@/components/ui/Tag";

type UserProfile = {
  name: string;
  suburb: string;
  heritage: string;
  bio: string;
  avatarSeed: string;
  avatarData: string | null;
};

export default function ProfileEditor({
  user,
}: {
  user: UserProfile;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [suburb, setSuburb] = useState(user.suburb);
  const [heritage, setHeritage] = useState(user.heritage);
  const [bio, setBio] = useState(user.bio);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (busy) return;

    setBusy(true);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          suburb,
          heritage,
          bio,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      setEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Profile update failed:", error);
    } finally {
      setBusy(false);
    }
  }

  async function saveAvatar(avatarData: string) {
    setBusy(true);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatarData,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile picture");
      }

      router.refresh();
    } catch (error) {
      console.error("Profile picture update failed:", error);
    } finally {
      setBusy(false);
    }
  }

  function pickPhoto(file: File) {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        saveAvatar(reader.result);
      }
    };

    reader.readAsDataURL(file);
  }

  function cancelEditing() {
    setName(user.name);
    setSuburb(user.suburb);
    setHeritage(user.heritage);
    setBio(user.bio);
    setEditing(false);
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
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          aria-label="Change profile picture"
          className="absolute -right-1 -bottom-1 rounded-full border border-line bg-paper p-2 text-graphite transition-colors duration-150 hover:text-ink disabled:opacity-50"
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
            const file = e.target.files?.[0];

            if (file) {
              pickPhoto(file);
            }

            e.target.value = "";
          }}
        />
      </div>

      <div className="min-w-0 flex-1">
        {!editing ? (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-[family-name:var(--font-display)] text-[36px] font-semibold leading-[44px] text-ink">
                {user.name}
              </h1>
            </div>

            <p className="mt-1 flex flex-wrap items-center gap-2 text-[15px] text-graphite">
              {user.suburb}
              <HeritageTag heritage={user.heritage} />
            </p>

            <div className="mt-4 max-w-[640px]">
              <p className="text-[15px] leading-6 text-graphite">
                {user.bio}
              </p>

              <button
                type="button"
                onClick={() => setEditing(true)}
                className="mt-2 inline-flex items-center gap-1.5 text-[15px] font-medium text-green hover:underline"
              >
                <Pencil size={14} strokeWidth={1.5} />
                Edit profile
              </button>
            </div>
          </>
        ) : (
          <div className="max-w-[640px]">
            <h1 className="font-[family-name:var(--font-display)] text-[30px] font-semibold text-ink">
              Edit profile
            </h1>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="block text-[13px] font-medium text-graphite">
                  Name
                </span>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-[15px] text-ink focus:border-green focus:outline-none focus:ring-2 focus:ring-green-soft"
                />
              </label>

              <label className="block">
                <span className="block text-[13px] font-medium text-graphite">
                  Location
                </span>

                <input
                  type="text"
                  value={suburb}
                  onChange={(e) => setSuburb(e.target.value)}
                  required
                  placeholder="Your suburb"
                  className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-[15px] text-ink focus:border-green focus:outline-none focus:ring-2 focus:ring-green-soft"
                />
              </label>

              <label className="block">
                <span className="block text-[13px] font-medium text-graphite">
                  Heritage / Culture
                </span>

                <input
                  type="text"
                  value={heritage}
                  onChange={(e) => setHeritage(e.target.value)}
                  required
                  placeholder="e.g. Indian, Italian, Vietnamese"
                  className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-[15px] text-ink focus:border-green focus:outline-none focus:ring-2 focus:ring-green-soft"
                />
              </label>

              <label className="block">
                <span className="block text-[13px] font-medium text-graphite">
                  Bio
                </span>

                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-[15px] text-ink focus:border-green focus:outline-none focus:ring-2 focus:ring-green-soft"
                />
              </label>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={save}
                  disabled={
                    busy ||
                    !name.trim() ||
                    !suburb.trim() ||
                    !heritage.trim()
                  }
                  className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3.5 py-2 text-[15px] font-medium text-paper transition-colors duration-150 hover:bg-ink/85 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Check size={15} strokeWidth={1.5} />
                  {busy ? "Saving…" : "Save profile"}
                </button>

                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 rounded-md border border-line bg-paper px-3.5 py-2 text-[15px] font-medium text-graphite transition-colors duration-150 hover:text-ink disabled:opacity-50"
                >
                  <X size={15} strokeWidth={1.5} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}