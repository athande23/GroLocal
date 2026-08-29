"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";

export default function ClaimButton({
  listingId,
  listingTitle,
  gardenerName,
  suburb,
}: {
  listingId: string;
  listingTitle: string;
  gardenerName: string;
  suburb: string;
}) {
  const router = useRouter();
  const [claimed, setClaimed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [pickupNote, setPickupNote] = useState("");

  async function claim() {
    if (busy || claimed) return;
    setBusy(true);
    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = await res.json();
      if (data.ok) {
        setClaimed(true);
        setPickupNote(data.pickup?.note ?? "");
        setOpen(true);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={claim}
        disabled={busy || claimed}
        className={`w-full rounded-md px-4 py-2 text-[15px] font-medium transition-colors duration-150 ${
          claimed
            ? "cursor-default border border-line bg-fill text-graphite"
            : "bg-ink text-paper hover:bg-ink/85"
        }`}
      >
        {claimed ? "Claimed" : busy ? "Claiming…" : "Claim"}
      </button>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          router.refresh();
        }}
        title="It's yours"
      >
        <p>
          You have claimed <span className="font-medium">{listingTitle}</span>{" "}
          from {gardenerName} in {suburb}.
        </p>
        <p className="mt-3 text-graphite">{pickupNote}</p>
        <p className="mt-3 text-[13px] text-graphite">
          GroLocal records the intent and the neighbours take it from there.
          Two people who live near each other are about to meet.
        </p>
      </Modal>
    </>
  );
}
