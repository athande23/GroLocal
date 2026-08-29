"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Avatar } from "@/components/Avatar";

export type Thread = {
  otherId: string;
  otherName: string;
  otherSuburb: string;
  otherAvatarSeed: string;
  otherAvatarData: string | null;
  messages: { id: string; mine: boolean; body: string; at: string }[];
};

export default function MessagesView({
  threads,
  initialOpenId,
}: {
  threads: Thread[];
  initialOpenId: string | null;
}) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(
    initialOpenId ?? threads[0]?.otherId ?? null
  );
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const open = threads.find((t) => t.otherId === openId) ?? null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [openId, open?.messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !draft.trim() || !open) return;
    setBusy(true);
    try {
      const res = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toId: open.otherId, body: draft }),
      });
      if (res.ok) {
        setDraft("");
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  if (threads.length === 0) {
    return (
      <div className="mx-auto max-w-[1080px] px-5 py-12">
        <h1 className="font-[family-name:var(--font-display)] text-[36px] font-semibold leading-[44px] text-ink">
          Messages
        </h1>
        <div className="mt-8 rounded-lg border border-line bg-fill px-6 py-14 text-center">
          <p className="text-[16px] font-semibold text-ink">No messages yet</p>
          <p className="mx-auto mt-1 max-w-[420px] text-[15px] text-graphite">
            Find something on the market and press Message to start a
            conversation about pickup.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1080px] px-5 py-10">
      <h1 className="font-[family-name:var(--font-display)] text-[36px] font-semibold leading-[44px] text-ink">
        Messages
      </h1>

      <div className="mt-6 flex h-[560px] overflow-hidden rounded-lg border border-line">
        {/* Thread list */}
        <div
          className={`w-full shrink-0 overflow-y-auto border-line bg-paper md:w-[300px] md:border-r ${
            open ? "hidden md:block" : ""
          }`}
          aria-label="Conversations"
        >
          {threads.map((t) => {
            const last = t.messages[t.messages.length - 1];
            return (
              <button
                key={t.otherId}
                onClick={() => setOpenId(t.otherId)}
                aria-pressed={t.otherId === openId}
                className={`flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left transition-colors duration-150 hover:bg-fill ${
                  t.otherId === openId ? "bg-green-soft" : ""
                }`}
              >
                <Avatar
                  seed={t.otherAvatarSeed}
                  src={t.otherAvatarData}
                  name={t.otherName}
                  size="md"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium text-ink">
                    {t.otherName}
                  </span>
                  <span className="block truncate text-[13px] text-graphite">
                    {last ? `${last.mine ? "You: " : ""}${last.body}` : t.otherSuburb}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Chat */}
        {open ? (
          <div className="flex min-w-0 flex-1 flex-col bg-fill">
            <div className="flex items-center gap-3 border-b border-line bg-paper px-4 py-3">
              <button
                onClick={() => setOpenId(null)}
                className="text-[13px] font-medium text-green hover:underline md:hidden"
              >
                Back
              </button>
              <Avatar
                seed={open.otherAvatarSeed}
                src={open.otherAvatarData}
                name={open.otherName}
                size="sm"
              />
              <div>
                <p className="text-[15px] font-medium text-ink">{open.otherName}</p>
                <p className="text-[13px] text-graphite">{open.otherSuburb}</p>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {open.messages.length === 0 && (
                <p className="text-center text-[13px] text-graphite">
                  Say hello — ask about pickup, a swap, or their growing advice.
                </p>
              )}
              {open.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-3.5 py-2 text-[15px] leading-6 ${
                      m.mine
                        ? "bg-ink text-paper"
                        : "border border-line bg-paper text-ink"
                    }`}
                  >
                    <p>{m.body}</p>
                    <p
                      className={`mt-0.5 text-right text-[11px] ${
                        m.mine ? "text-paper/60" : "text-graphite"
                      }`}
                    >
                      {m.at}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={send}
              className="flex gap-2 border-t border-line bg-paper px-4 py-3"
            >
              <label className="flex-1">
                <span className="sr-only">Message {open.otherName}</span>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={`Message ${open.otherName.split(" ")[0]}`}
                  className="w-full rounded-md border border-line bg-paper px-3 py-2 text-[15px] placeholder:text-graphite focus:border-green focus:outline-none focus:ring-2 focus:ring-green-soft"
                />
              </label>
              <button
                type="submit"
                disabled={busy || !draft.trim()}
                aria-label="Send message"
                className="rounded-md bg-ink px-3.5 py-2 text-paper transition-colors duration-150 hover:bg-ink/85 disabled:opacity-50"
              >
                <Send size={16} strokeWidth={1.5} />
              </button>
            </form>
          </div>
        ) : (
          <div className="hidden flex-1 items-center justify-center bg-fill md:flex">
            <p className="text-[15px] text-graphite">
              Pick a conversation to read it.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
