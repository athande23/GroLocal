"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useRef, useState } from "react";
import { Droplets, ImageUp, Sun } from "lucide-react";
import { formatDistance } from "@/lib/distance";
import { HeritageTag } from "@/components/ui/Tag";
import { Avatar } from "@/components/Avatar";

type Grower = {
  id: string;
  name: string;
  suburb: string;
  heritage: string;
  avatarSeed: string;
  quantity: string;
  distance: number;
};

type IdentifyResult = {
  commonName: string;
  botanicalName: string;
  confidence: "high" | "medium" | "low";
  origin: string;
  culturalUses: string[];
  growingNotes: { sunlight: string; water: string; season: string };
  notes: string;
  growers: Grower[];
  matchedPlantName: string | null;
};

const confidenceCopy = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

export default function IdentifyTool() {
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<IdentifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      setResult(null);
      setLoading(true);
      try {
        const [, base64] = dataUrl.split(",");
        const res = await fetch("/api/identify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mediaType: file.type }),
        });
        setResult(await res.json());
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="mt-8 max-w-[720px]">
      {/* Upload zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        className={`rounded-lg border border-dashed px-6 py-10 text-center transition-colors duration-150 ${
          dragOver ? "border-green bg-green-soft" : "border-line bg-fill"
        }`}
      >
        {preview ? (
          <img
            src={preview}
            alt="The uploaded plant photo"
            className="mx-auto max-h-64 rounded-lg border border-line"
          />
        ) : (
          <ImageUp
            size={28}
            strokeWidth={1.5}
            className="mx-auto text-graphite"
            aria-hidden
          />
        )}
        <p className="mt-4 text-[15px] text-ink">
          {preview ? "Try another photo" : "Drag a photo here, or"}
        </p>
        <button
          onClick={() => inputRef.current?.click()}
          className="mt-2 rounded-md border border-ink px-4 py-2 text-[15px] font-medium text-ink transition-colors duration-150 hover:bg-ink hover:text-paper"
        >
          Choose a file
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-label="Upload a plant photo"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {loading && (
        <div className="mt-8 space-y-3" aria-label="Identifying plant">
          <div className="h-24 animate-pulse rounded-lg bg-fill" />
          <div className="h-14 animate-pulse rounded-lg bg-fill" />
        </div>
      )}

      {result && !loading && (
        <div className="mt-8">
          <div className="rounded-lg border border-line bg-fill p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-[family-name:var(--font-display)] text-[24px] font-semibold text-ink">
                {result.commonName}
              </h2>
              <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-graphite">
                <span
                  aria-hidden
                  className={`h-2 w-2 rounded-full ${
                    result.confidence === "high"
                      ? "bg-green"
                      : "border-2 border-green bg-transparent"
                  }`}
                />
                {confidenceCopy[result.confidence] ?? "Identified"}
              </span>
            </div>
            <p className="text-[15px] italic text-graphite">
              {result.botanicalName}
            </p>
            <p className="mt-1 text-[13px] text-graphite">
              Native to the {result.origin.charAt(0).toLowerCase() + result.origin.slice(1)}
            </p>

            {result.culturalUses?.length > 0 && (
              <div className="mt-4">
                <h3 className="text-[15px] font-medium text-ink">
                  How it is used
                </h3>
                <ul className="mt-2 space-y-1.5">
                  {result.culturalUses.map((u, i) => (
                    <li key={i} className="flex gap-2 text-[15px] text-graphite">
                      <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-green" />
                      {u}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-graphite">
              <span className="inline-flex items-center gap-1.5">
                <Sun size={14} strokeWidth={1.5} />
                {result.growingNotes?.sunlight}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Droplets size={14} strokeWidth={1.5} />
                {result.growingNotes?.water}
              </span>
              <span>{result.growingNotes?.season}</span>
            </div>
            {result.notes && (
              <p className="mt-3 text-[13px] text-graphite">{result.notes}</p>
            )}
          </div>

          <div className="mt-8">
            <h3 className="font-[family-name:var(--font-display)] text-[24px] font-semibold leading-8 text-ink">
              Growing it near you
            </h3>
            {result.growers.length > 0 ? (
              <ul className="mt-5 space-y-3">
                {result.growers.map((g) => (
                  <li key={g.id}>
                    <Link
                      href={`/gardener/${g.id}`}
                      className="flex items-center gap-4 rounded-lg border border-line bg-fill p-4 transition-colors duration-150 hover:border-green"
                    >
                      <Avatar seed={g.avatarSeed} name={g.name} size="md" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-medium text-ink">
                          {g.name}
                        </span>
                        <span className="block text-[13px] text-graphite">
                          {g.suburb} · {formatDistance(g.distance)} away ·{" "}
                          {g.quantity}
                        </span>
                      </span>
                      <HeritageTag heritage={g.heritage} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-5 rounded-lg border border-line bg-fill px-6 py-8">
                <p className="text-[15px] text-ink">
                  Nobody nearby is growing{" "}
                  {result.matchedPlantName ?? result.commonName} yet.
                </p>
                <p className="mt-1 text-[15px] text-graphite">
                  You could be the first. Plant it, log the journey in{" "}
                  <Link href="/me" className="font-medium text-green hover:underline">
                    My Roots
                  </Link>
                  , and your garden becomes the one neighbours discover.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
