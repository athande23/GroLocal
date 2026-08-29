"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChefHat, MessageCircle, Sprout } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { HeritageTag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

type PostRow = {
  id: string;
  kind: string;
  title: string;
  body: string;
  culture: string | null;
  authorId: string;
  authorName: string;
  authorSuburb: string;
  authorAvatarSeed: string;
  authorAvatarData: string | null;
  mine: boolean;
  date: string;
};

const filters = [
  { value: "", label: "All posts" },
  { value: "recipe", label: "Recipes" },
  { value: "advice", label: "Advice" },
];

export default function DiscussionsView({ posts }: { posts: PostRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [kind, setKind] = useState("recipe");
  const [title, setTitle] = useState("");
  const [culture, setCulture] = useState("");
  const [body, setBody] = useState("");

  const visible = posts.filter((p) => !filter || p.kind === filter);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, title, body, culture }),
      });
      if (res.ok) {
        setOpen(false);
        setTitle("");
        setBody("");
        setCulture("");
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1080px] px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-[36px] font-semibold leading-[44px] text-ink">
            Discussions
          </h1>
          <p className="mt-2 max-w-[640px] text-[15px] text-graphite">
            Recipes worth passing on and advice worth taking, from the people
            actually growing the ingredients.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>Share a recipe or tip</Button>
      </div>

      <div className="mt-8 flex gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            aria-pressed={filter === f.value}
            className={`rounded-md px-3 py-1.5 text-[15px] transition-colors duration-150 ${
              filter === f.value
                ? "bg-green-soft font-medium text-green"
                : "text-graphite hover:text-ink"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-5">
        {visible.map((p) => {
          const paragraphs = p.body.split("\n").filter((x) => x.trim());
          const isLong = paragraphs.length > 1;
          const isOpen = expanded === p.id;
          return (
            <article
              key={p.id}
              className="rounded-lg border border-line bg-fill p-6"
            >
              <div className="flex items-center gap-2 text-[13px] font-medium text-graphite">
                {p.kind === "recipe" ? (
                  <ChefHat size={16} strokeWidth={1.5} />
                ) : (
                  <Sprout size={16} strokeWidth={1.5} />
                )}
                <span className="capitalize">{p.kind}</span>
                {p.culture && <HeritageTag heritage={p.culture} />}
                <span className="ml-auto">{p.date}</span>
              </div>

              <h2 className="mt-3 font-[family-name:var(--font-display)] text-[24px] font-semibold leading-8 text-ink">
                {p.title}
              </h2>

              <div className="mt-3 max-w-[640px] space-y-4">
                {(isOpen ? paragraphs : paragraphs.slice(0, 1)).map((para, i) => (
                  <p
                    key={i}
                    className="font-[family-name:var(--font-display)] text-[17px] leading-[1.7] text-ink"
                  >
                    {para}
                  </p>
                ))}
              </div>
              {isLong && (
                <button
                  onClick={() => setExpanded(isOpen ? null : p.id)}
                  className="mt-3 text-[15px] font-medium text-green hover:underline"
                >
                  {isOpen ? "Show less" : "Read the whole thing"}
                </button>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-4">
                <Link
                  href={`/gardener/${p.authorId}`}
                  className="flex items-center gap-2.5"
                >
                  <Avatar
                    seed={p.authorAvatarSeed}
                    src={p.authorAvatarData}
                    name={p.authorName}
                    size="sm"
                  />
                  <span>
                    <span className="block text-[13px] font-medium text-ink">
                      {p.authorName}
                    </span>
                    <span className="block text-[13px] text-graphite">
                      {p.authorSuburb}
                    </span>
                  </span>
                </Link>
                {!p.mine && (
                  <Link
                    href={`/messages?to=${p.authorId}`}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-ink px-3 py-1.5 text-[13px] font-medium text-ink transition-colors duration-150 hover:bg-ink hover:text-paper"
                  >
                    <MessageCircle size={14} strokeWidth={1.5} />
                    Reply by message
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Share a recipe or tip">
        <form onSubmit={submit} className="space-y-4">
          <div className="flex gap-2">
            {["recipe", "advice"].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                aria-pressed={kind === k}
                className={`rounded-md px-3 py-1.5 text-[15px] capitalize transition-colors duration-150 ${
                  kind === k
                    ? "bg-green-soft font-medium text-green"
                    : "border border-line text-graphite hover:text-ink"
                }`}
              >
                {k}
              </button>
            ))}
          </div>
          <label className="block">
            <span className="text-[13px] font-medium text-graphite">Title</span>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-[15px] focus:border-green focus:outline-none focus:ring-2 focus:ring-green-soft"
            />
          </label>
          <label className="block">
            <span className="text-[13px] font-medium text-graphite">
              Culture (optional)
            </span>
            <input
              value={culture}
              onChange={(e) => setCulture(e.target.value)}
              placeholder="e.g. Punjabi Indian"
              className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-[15px] placeholder:text-graphite focus:border-green focus:outline-none focus:ring-2 focus:ring-green-soft"
            />
          </label>
          <label className="block">
            <span className="text-[13px] font-medium text-graphite">
              The recipe or advice itself
            </span>
            <textarea
              required
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-[15px] focus:border-green focus:outline-none focus:ring-2 focus:ring-green-soft"
            />
          </label>
          <Button type="submit" disabled={busy} className="w-full justify-center">
            {busy ? "Posting…" : "Post it"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
