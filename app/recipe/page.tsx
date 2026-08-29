import type { Metadata } from "next";
import RecipeMatcher from "@/components/RecipeMatcher";

export const metadata: Metadata = {
  title: "Recipe to Garden",
  description:
    "Paste a family recipe and find every ingredient growing near you.",
};

export default function RecipePage() {
  return (
    <div className="mx-auto max-w-[1080px] px-5 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-[36px] font-semibold leading-[44px] text-ink">
        Recipe to Garden
      </h1>
      <p className="mt-2 max-w-[640px] text-[15px] text-graphite">
        Paste a recipe that matters to your family. We will find every
        plant-based ingredient in it, then show you the neighbours already
        growing each one.
      </p>
      <RecipeMatcher />
    </div>
  );
}
