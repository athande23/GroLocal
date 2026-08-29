"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistance } from "@/lib/distance";
import { HeritageTag, ListingTag } from "@/components/ui/Tag";
import { PlantTile } from "@/components/PlantTile";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/Button";

type GardenPlant = {
  id: string;
  plantId: string;
  plantName: string;
  botanicalName: string;
  quantity: string;
  notes: string | null;
  daysToHarvest: number;
};
type StoryRow = {
  id: string;
  title: string;
  plantName: string;
  origin: string;
  excerpt: string;
};
type FollowingRow = {
  id: string;
  name: string;
  suburb: string;
  heritage: string;
  avatarSeed: string;
  distance: number;
};
type MyListing = {
  id: string;
  title: string;
  type: string;
  price: number | null;
  quantity: string;
  claimed: boolean;
  plantName: string;
};
type ClaimedListing = {
  id: string;
  title: string;
  gardenerName: string;
  suburb: string;
  plantName: string;
};
type GrowLogRow = {
  id: string;
  day: number;
  note: string;
  plantId: string;
  plantName: string;
  daysToHarvest: number;
};

const tabs = [
  "Growing journey",
  "My garden",
  "My stories",
  "Following",
  "My exchanges",
  "Cultures discovered",
] as const;

export default function MyRootsTabs({
  gardenPlants,
  stories,
  following,
  myListings,
  claimedListings,
  growLogs,
  cultures,
  allPlants,
}: {
  me: { id: string; lat: number; lng: number };
  gardenPlants: GardenPlant[];
  stories: StoryRow[];
  following: FollowingRow[];
  myListings: MyListing[];
  claimedListings: ClaimedListing[];
  growLogs: GrowLogRow[];
  cultures: string[];
  allPlants: { id: string; name: string }[];
}) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Growing journey");

  const journeys = useMemo(() => {
    const byPlant = new Map<string, GrowLogRow[]>();
    for (const log of growLogs) {
      const list = byPlant.get(log.plantId) ?? [];
      list.push(log);
      byPlant.set(log.plantId, list);
    }
    return [...byPlant.values()].map((logs) => ({
      plantId: logs[0].plantId,
      plantName: logs[0].plantName,
      daysToHarvest: logs[0].daysToHarvest,
      latestDay: Math.max(...logs.map((l) => l.day)),
      logs: [...logs].sort((a, b) => a.day - b.day),
    }));
  }, [growLogs]);

  return (
    <div className="mt-10">
      <div
        role="tablist"
        aria-label="My Roots sections"
        className="scroll-row flex gap-1 overflow-x-auto border-b border-line"
      >
        {tabs.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-[15px] transition-colors duration-150 ${
              tab === t
                ? "border-green font-medium text-green"
                : "border-transparent text-graphite hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="pt-8">
        {tab === "Growing journey" && (
          <GrowingJourney journeys={journeys} allPlants={allPlants} />
        )}

        {tab === "My garden" &&
          (gardenPlants.length === 0 ? (
            <EmptyState
              title="Nothing planted yet"
              body="Claim a seedling on the exchange, plant it, and your garden starts here."
              cta={{ href: "/exchange", label: "Browse the exchange" }}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gardenPlants.map((gp) => (
                <div key={gp.id} className="flex items-start gap-4 rounded-lg border border-line bg-fill p-5">
                  <PlantTile name={gp.plantName} size="md" />
                  <div>
                    <p className="text-[16px] font-semibold leading-[22px] text-ink">
                      {gp.plantName}
                    </p>
                    <p className="text-[13px] italic text-graphite">
                      {gp.botanicalName}
                    </p>
                    <p className="mt-1 text-[13px] text-graphite">
                      {gp.quantity}
                      {gp.notes ? ` · ${gp.notes}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))}

        {tab === "My stories" &&
          (stories.length === 0 ? (
            <EmptyState
              title="No stories yet"
              body="Every plant in your garden came from somewhere. When you are ready, write down where."
            />
          ) : (
            <ul className="space-y-4">
              {stories.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/story/${s.id}`}
                    className="block rounded-lg border border-line bg-fill p-5 transition-colors duration-150 hover:border-green"
                  >
                    <p className="font-[family-name:var(--font-display)] text-[18px] font-semibold text-ink">
                      {s.title}
                    </p>
                    <p className="mt-1 text-[13px] text-graphite">
                      {s.plantName} · {s.origin.replace("->", "→")}
                    </p>
                    <p className="mt-2 line-clamp-2 text-[15px] text-graphite">
                      {s.excerpt}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ))}

        {tab === "Following" &&
          (following.length === 0 ? (
            <EmptyState
              title="Not following anyone yet"
              body="Find a gardener on the map whose plants you would like to watch."
              cta={{ href: "/map", label: "Open the map" }}
            />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {following.map((f) => (
                <li key={f.id}>
                  <Link
                    href={`/gardener/${f.id}`}
                    className="flex items-center gap-4 rounded-lg border border-line bg-fill p-4 transition-colors duration-150 hover:border-green"
                  >
                    <Avatar seed={f.avatarSeed} name={f.name} size="md" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-medium text-ink">
                        {f.name}
                      </span>
                      <span className="block text-[13px] text-graphite">
                        {f.suburb} · {formatDistance(f.distance)} away
                      </span>
                    </span>
                    <HeritageTag heritage={f.heritage} />
                  </Link>
                </li>
              ))}
            </ul>
          ))}

        {tab === "My exchanges" && (
          <div className="space-y-10">
            <div>
              <h3 className="text-[16px] font-semibold text-ink">
                My listings
              </h3>
              {myListings.length === 0 ? (
                <p className="mt-3 text-[15px] text-graphite">
                  Nothing listed yet. Surplus seedlings or produce? Neighbours
                  are looking.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-line rounded-lg border border-line bg-fill">
                  {myListings.map((l) => (
                    <li key={l.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
                      <span className="flex-1 text-[15px] text-ink">
                        {l.title}
                        <span className="text-graphite"> · {l.quantity}</span>
                      </span>
                      <ListingTag type={l.type} price={l.price} />
                      <span className="text-[13px] text-graphite">
                        {l.claimed ? "Claimed" : "Open"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-ink">
                Recently claimed nearby
              </h3>
              {claimedListings.length === 0 ? (
                <p className="mt-3 text-[15px] text-graphite">
                  Nothing claimed nearby yet.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-line rounded-lg border border-line bg-fill">
                  {claimedListings.map((l) => (
                    <li key={l.id} className="px-4 py-3 text-[15px] text-graphite">
                      <span className="text-ink">{l.title}</span> from{" "}
                      {l.gardenerName}, {l.suburb}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {tab === "Cultures discovered" && (
          <div>
            <p className="max-w-[640px] text-[15px] text-graphite">
              Every gardener you follow or exchange with shares a little of
              where their food comes from. So far you have connected with{" "}
              <span className="font-medium text-ink">
                {cultures.length} culture{cultures.length === 1 ? "" : "s"}
              </span>
              .
            </p>
            {cultures.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {cultures.map((c) => (
                  <HeritageTag key={c} heritage={c} />
                ))}
              </div>
            )}
            <p className="mt-6 text-[15px] text-graphite">
              <Link href="/map" className="font-medium text-green hover:underline">
                Open the map
              </Link>{" "}
              to discover more.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function GrowingJourney({
  journeys,
  allPlants,
}: {
  journeys: {
    plantId: string;
    plantName: string;
    daysToHarvest: number;
    latestDay: number;
    logs: GrowLogRow[];
  }[];
  allPlants: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [plantId, setPlantId] = useState(allPlants[0]?.id ?? "");
  const [day, setDay] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function addEntry(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/growlog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plantId, day: Number(day), note }),
      });
      if (res.ok) {
        setDay("");
        setNote("");
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-[720px] space-y-10">
      {journeys.length === 0 ? (
        <EmptyState
          title="No journey yet"
          body="Plant something, then log Day 1. The story of a garden is mostly small entries like that."
        />
      ) : (
        journeys.map((j) => {
          const progress = Math.min(
            100,
            Math.round((j.latestDay / j.daysToHarvest) * 100)
          );
          return (
            <div key={j.plantId}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-[16px] font-semibold text-ink">
                  {j.plantName}
                </h3>
                <span className="text-[13px] text-graphite">
                  Day {j.latestDay} of about {j.daysToHarvest} to harvest
                </span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${j.plantName} progress toward harvest`}
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-fill"
              >
                <div
                  className="h-full rounded-full bg-green"
                  style={{ width: `${Math.max(progress, 2)}%` }}
                />
              </div>
              <ol className="relative ml-2 mt-5 border-l border-line pl-6">
                {j.logs.map((l) => (
                  <li key={l.id} className="relative pb-5 last:pb-0">
                    <span
                      aria-hidden
                      className="absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-paper bg-green"
                    />
                    <p className="text-[13px] font-medium text-graphite">
                      Day {l.day}
                    </p>
                    <p className="mt-0.5 text-[15px] text-ink">{l.note}</p>
                  </li>
                ))}
              </ol>
            </div>
          );
        })
      )}

      <form onSubmit={addEntry} className="rounded-lg border border-line bg-fill p-5">
        <h3 className="text-[16px] font-semibold text-ink">Add an entry</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <label className="flex-1">
            <span className="block text-[13px] font-medium text-graphite">
              Plant
            </span>
            <select
              value={plantId}
              onChange={(e) => setPlantId(e.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-[15px] focus:border-green focus:outline-none focus:ring-2 focus:ring-green-soft"
            >
              {allPlants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="w-28">
            <span className="block text-[13px] font-medium text-graphite">
              Day
            </span>
            <input
              type="number"
              min={0}
              required
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-[15px] focus:border-green focus:outline-none focus:ring-2 focus:ring-green-soft"
            />
          </label>
        </div>
        <label className="mt-3 block">
          <span className="block text-[13px] font-medium text-graphite">
            Note
          </span>
          <textarea
            required
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="What happened in the garden today?"
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-[15px] placeholder:text-graphite focus:border-green focus:outline-none focus:ring-2 focus:ring-green-soft"
          />
        </label>
        <div className="mt-4">
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Add entry"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function EmptyState({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="rounded-lg border border-line bg-fill px-6 py-12 text-center">
      <p className="text-[16px] font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-1 max-w-[420px] text-[15px] text-graphite">
        {body}
      </p>
      {cta && (
        <Link
          href={cta.href}
          className="mt-5 inline-block rounded-md bg-ink px-4 py-2.5 text-[15px] font-medium text-paper transition-colors duration-150 hover:bg-ink/85"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}
