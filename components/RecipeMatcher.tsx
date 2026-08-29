"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { formatDistance } from "@/lib/distance";
import { ListingTag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";

const placeholderRecipe = `Nan's Sunday chicken curry (as she dictated it, 1998)

Heat ghee in the big pot. Add mustard seeds and wait for them to pop.
Add 2 sprigs of fresh curry leaves and stand back.
Fry one sliced onion until deep gold, then ginger, garlic,
3 slit green chillies and a small knob of grated fresh turmeric.
Add the chicken pieces and brown them properly. No shortcuts.
Add 400g of ripe tomatoes, crushed by hand, and salt.
Cover and simmer until the oil comes back to the top.
Finish with a big handful of fresh coriander.
Serve with rice, and always more than you think you need.`;

type MatchRow = {
  ingredient: string;
  quantity: string;
  match: {
    plantName: string;
    gardener: {
      id: string;
      name: string;
      suburb: string;
      distance: number;
    } | null;
    availability?: { type: string; price: number | null; title: string } | null;
  } | null;
};

export default function RecipeMatcher() {
  const [text, setText] = useState(placeholderRecipe);
  const [rows, setRows] = useState<MatchRow[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function findIngredients() {
    setLoading(true);
    setRows(null);
    try {
      const res = await fetch("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeText: text }),
      });
      const data = await res.json();
      setRows(data.results ?? []);
    } finally {
      setLoading(false);
    }
  }

  const matched = rows?.filter((r) => r.match?.gardener) ?? [];
  // Lead with the close ones; a single far-flung match should not
  // water down the "growing right near you" line.
  const close = matched.filter((r) => r.match!.gardener!.distance <= 5);
  const matchedNearby = close.length > 0 ? close : matched;
  const maxDistance = matchedNearby.length
    ? Math.max(...matchedNearby.map((r) => r.match!.gardener!.distance))
    : 0;

  return (
    <div className="mt-8 max-w-[720px]">
      <label htmlFor="recipe-text" className="text-[15px] font-medium text-ink">
        Your recipe
      </label>
      <textarea
        id="recipe-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={12}
        className="mt-2 w-full rounded-md border border-line bg-paper px-3 py-2 font-[family-name:var(--font-display)] text-[16px] leading-relaxed text-ink focus:border-green focus:outline-none focus:ring-2 focus:ring-green-soft"
      />
      <div className="mt-4">
        <Button onClick={findIngredients} disabled={loading || !text.trim()}>
          {loading ? "Reading the recipe…" : "Find ingredients near me"}
        </Button>
      </div>

      {loading && (
        <div className="mt-8 space-y-3" aria-label="Matching ingredients">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-fill" />
          ))}
        </div>
      )}

      {rows && (
        <div className="mt-8">
          {matchedNearby.length > 0 && (
            <p className="mb-5 max-w-[640px] font-[family-name:var(--font-display)] text-[18px] leading-relaxed text-ink">
              {matchedNearby.length} of {rows.length} ingredients in this
              recipe are growing within{" "}
              <span className="font-semibold">
                {formatDistance(maxDistance)}
              </span>{" "}
              of you, right now.
            </p>
          )}
          <ul className="divide-y divide-line rounded-lg border border-line bg-fill">
            {rows.map((r, i) => (
              <li
                key={i}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3"
              >
                <span className="w-44 shrink-0 text-[15px] font-medium text-ink">
                  {r.ingredient}
                </span>
                {r.match?.gardener ? (
                  <>
                    <ArrowRight
                      size={16}
                      strokeWidth={1.5}
                      className="hidden shrink-0 text-graphite sm:block"
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 text-[15px] text-ink">
                      <Link
                        href={`/gardener/${r.match.gardener.id}`}
                        className="font-medium text-green hover:underline"
                      >
                        {r.match.gardener.name}
                      </Link>
                      <span className="text-graphite">
                        {" "}
                        · {r.match.gardener.suburb} ·{" "}
                        {formatDistance(r.match.gardener.distance)}
                      </span>
                    </span>
                    {r.match.availability && (
                      <ListingTag
                        type={r.match.availability.type}
                        price={r.match.availability.price}
                      />
                    )}
                  </>
                ) : (
                  <span className="flex-1 text-[15px] text-graphite">
                    not growing nearby yet
                  </span>
                )}
              </li>
            ))}
          </ul>
          {rows.length === 0 && (
            <p className="mt-4 text-[15px] text-graphite">
              We could not find any garden-growable ingredients in that text.
              Try pasting the full recipe, ingredients and all.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
