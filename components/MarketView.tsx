"use client";

/* eslint-disable @next/next/no-img-element */
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { formatDistance } from "@/lib/distance";
import { ListingTag } from "@/components/ui/Tag";
import { PlantTile } from "@/components/PlantTile";
import ClaimButton from "@/components/ClaimButton";

export type MarketListing = {
  id: string;
  title: string;
  type: string;
  category: string;
  culture: string;
  address: string;
  price: number | null;
  swapFor: string | null;
  quantity: string;
  imageData: string | null;
  claimed: boolean;
  plantName: string | null;
  gardenerId: string;
  gardenerName: string;
  suburb: string;
  lat: number;
  lng: number;
  distance: number;
  isMine: boolean;
};

const MarketMap = dynamic(() => import("@/components/MarketMap"), {
  ssr: false,
  loading: () => (
    <div
      className="h-full animate-pulse bg-fill"
      aria-label="Map loading"
    />
  ),
});

const sortOptions = [
  { value: "distance", label: "Sort: nearest first" },
  { value: "type-culture", label: "Sort: type, then culture" },
  { value: "culture", label: "Sort: culture" },
  { value: "price", label: "Sort: price, low to high" },
];

const cultureCategories = [
  "vegetable",
  "herb",
  "fruit",
  "legume",
  "flower",
];

export default function MarketView({
  items,
  cultures,
  categories,
  initialQuery,
  initialCulture,
}: {
  items: MarketListing[];
  cultures: string[];
  categories: string[];
  initialQuery: string;
  initialCulture: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("");
  const [culture, setCulture] = useState(initialCulture);
  const [sort, setSort] = useState("distance");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const showCulture =
    category !== "" &&
    cultureCategories.includes(category.toLowerCase());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = items.filter((l) => {
      if (
        q &&
        !l.title.toLowerCase().includes(q) &&
        !(l.plantName ?? "").toLowerCase().includes(q) &&
        !l.category.toLowerCase().includes(q) &&
        !l.culture.toLowerCase().includes(q)
      ) {
        return false;
      }

      if (category && l.category !== category) {
        return false;
      }

      if (culture && l.culture !== culture) {
        return false;
      }

      return true;
    });

    const byClaimed = (a: MarketListing, b: MarketListing) =>
      Number(a.claimed) - Number(b.claimed);

    switch (sort) {
      case "type-culture":
        return list.sort(
          (a, b) =>
            byClaimed(a, b) ||
            a.category.localeCompare(b.category) ||
            a.culture.localeCompare(b.culture) ||
            a.distance - b.distance
        );

      case "culture":
        return list.sort(
          (a, b) =>
            byClaimed(a, b) ||
            a.culture.localeCompare(b.culture) ||
            a.distance - b.distance
        );

      case "price":
        return list.sort(
          (a, b) =>
            byClaimed(a, b) ||
            (a.price ?? 0) - (b.price ?? 0)
        );

      default:
        return list.sort(
          (a, b) =>
            byClaimed(a, b) ||
            a.distance - b.distance
        );
    }
  }, [items, query, category, culture, sort]);

  function handleCategoryChange(value: string) {
    setCategory(value);

    if (
      value === "" ||
      !cultureCategories.includes(value.toLowerCase())
    ) {
      setCulture("");
    }
  }

  return (
    <div className="mx-auto max-w-[1080px] px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-[36px] font-semibold leading-[44px] text-ink">
            Market
          </h1>

          <p className="mt-2 max-w-[640px] text-[15px] text-graphite">
            Vegetables, herbs, fruit and tools from gardens near you. The map
            shows where everything is right now.
          </p>
        </div>

        <span className="text-[13px] text-graphite">
          {filtered.length} listing
          {filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-6 h-[340px] overflow-hidden rounded-lg border border-line">
        <MarketMap
          listings={filtered.filter((l) => !l.claimed)}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="relative flex min-w-[200px] flex-1 items-center sm:max-w-[280px]">
          <Search
            size={16}
            strokeWidth={1.5}
            className="pointer-events-none absolute left-3 text-graphite"
          />

          <span className="sr-only">
            Search the market
          </span>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the market"
            className="w-full rounded-md border border-line bg-paper py-2 pl-9 pr-3 text-[15px] placeholder:text-graphite focus:border-green focus:outline-none focus:ring-2 focus:ring-green-soft"
          />
        </label>

        <label>
          <span className="sr-only">
            Filter by type of item
          </span>

          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="rounded-md border border-line bg-paper px-3 py-2 text-[15px] text-ink focus:border-green focus:outline-none focus:ring-2 focus:ring-green-soft"
          >
            <option value="">All types</option>

            {categories.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </label>

        {showCulture && (
          <label>
            <span className="sr-only">
              Filter by culture
            </span>

            <select
              value={culture}
              onChange={(e) => setCulture(e.target.value)}
              className="rounded-md border border-line bg-paper px-3 py-2 text-[15px] text-ink focus:border-green focus:outline-none focus:ring-2 focus:ring-green-soft"
            >
              <option value="">All cultures</option>

              {cultures.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        )}

        <label>
          <span className="sr-only">
            Sort listings
          </span>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-md border border-line bg-paper px-3 py-2 text-[15px] text-ink focus:border-green focus:outline-none focus:ring-2 focus:ring-green-soft"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-lg border border-line bg-fill px-6 py-14 text-center">
          <p className="text-[16px] font-semibold text-ink">
            Nothing matches &ldquo;{query}&rdquo;
          </p>

          <p className="mx-auto mt-1 max-w-[400px] text-[15px] text-graphite">
            Try a different search, or clear a filter to browse everything
            nearby.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => (
            <div
              key={l.id}
              id={`listing-${l.id}`}
              className={`flex flex-col rounded-lg border bg-fill p-5 transition-colors duration-150 ${
                selectedId === l.id
                  ? "border-green"
                  : "border-line"
              } ${l.claimed ? "opacity-55" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                {l.imageData ? (
                  <img
                    src={l.imageData}
                    alt={l.title}
                    className="h-14 w-14 shrink-0 rounded-lg border border-line object-cover"
                  />
                ) : (
                  <PlantTile
                    name={l.plantName ?? l.title}
                    size="md"
                  />
                )}

                <ListingTag
                  type={l.type}
                  price={l.price}
                />
              </div>

              <p className="mt-3 text-[16px] font-semibold leading-[22px] text-ink">
                {l.title}
              </p>

              <p className="mt-0.5 text-[13px] text-graphite">
                {l.category.charAt(0).toUpperCase() +
                  l.category.slice(1)}{" "}
                · {l.quantity} · {l.culture}
              </p>

              {l.swapFor && (
                <p className="mt-2 text-[13px] text-graphite">
                  Wants:{" "}
                  <span className="text-ink">
                    {l.swapFor}
                  </span>
                </p>
              )}

              <p className="mt-3 flex items-start gap-1.5 text-[13px] text-graphite">
                <MapPin
                  size={14}
                  strokeWidth={1.5}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  {l.address} ·{" "}
                  {formatDistance(l.distance)} away
                </span>
              </p>

              <p className="mt-1.5 text-[13px] text-graphite">
                <Link
                  href={`/gardener/${l.gardenerId}`}
                  className="font-medium text-green hover:underline"
                >
                  {l.gardenerName}
                </Link>
              </p>

              <div className="mt-4 flex-1" />

              {l.claimed ? (
                <p className="rounded-md border border-line px-4 py-2 text-center text-[15px] text-graphite">
                  Purchased
                </p>
              ) : l.isMine ? (
                <p className="rounded-md border border-line px-4 py-2 text-center text-[15px] text-graphite">
                  Your listing
                </p>
              ) : (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <ClaimButton
                      listingId={l.id}
                      listingTitle={l.title}
                      gardenerName={l.gardenerName}
                      suburb={l.suburb}
                    />
                  </div>

                  <Link
                    href={`/messages?to=${l.gardenerId}`}
                    className="rounded-md border border-ink px-3 py-2 text-[15px] font-medium text-ink transition-colors duration-150 hover:bg-ink hover:text-paper"
                  >
                    Message
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}