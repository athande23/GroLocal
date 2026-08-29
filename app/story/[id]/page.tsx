import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Droplets, MapPin, Sun } from "lucide-react";
import { db } from "@/lib/db";
import { Avatar } from "@/components/Avatar";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const story = await db.story.findUnique({ where: { id } });
  return {
    title: story?.title ?? "Story",
    description: story ? story.origin.replace("->", "to") : undefined,
  };
}

// Pick a resonant sentence from the middle of the story for the pull quote.
function pickPullQuote(body: string): string | null {
  const paragraphs = body.split("\n").filter((p) => p.trim());
  const middle = paragraphs.slice(1, -1).join(" ") || paragraphs[0] || "";
  const sentences = middle.match(/[^.!?]+[.!?]/g) ?? [];
  const candidates = sentences
    .map((s) => s.trim())
    .filter((s) => s.length >= 60 && s.length <= 170);
  return candidates[Math.floor(candidates.length / 2)] ?? null;
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const story = await db.story.findUnique({
    where: { id },
    include: { user: true, plant: true },
  });

  if (!story) notFound();

  const [from, to] = story.origin.split("->").map((s) => s.trim());
  const paragraphs = story.body.split("\n").filter((p) => p.trim());
  const pullQuote = pickPullQuote(story.body);
  // Place the pull quote after the second paragraph.
  const quoteAfter = Math.min(1, paragraphs.length - 2);

  return (
    <article>
      {/* Banner */}
      <div className="bg-ink">
        <div className="mx-auto max-w-[1080px] px-5 py-14">
          <p className="text-[13px] font-medium text-paper/60">
            {story.plant.commonName} ·{" "}
            <span className="italic">{story.plant.botanicalName}</span>
          </p>
          <h1 className="mt-3 max-w-[720px] font-[family-name:var(--font-display)] text-[32px] font-semibold leading-tight text-paper sm:text-[40px]">
            {story.title}
          </h1>
          <p className="mt-4 flex flex-wrap items-center gap-2 text-[15px] text-paper/80">
            <span>{from}</span>
            <ArrowRight size={16} strokeWidth={1.5} aria-label="to" />
            <span>{to}</span>
          </p>
          <Link
            href={`/gardener/${story.user.id}`}
            className="mt-6 inline-flex items-center gap-3 rounded-md py-1 pr-2 transition-colors duration-150 hover:bg-paper/10"
          >
            <Avatar seed={story.user.avatarSeed} src={story.user.avatarData} name={story.user.name} size="md" className="border-paper/20" />
            <span className="text-left">
              <span className="block text-[15px] font-medium text-paper">
                {story.user.name}
              </span>
              <span className="block text-[13px] text-paper/60">
                {story.user.heritage} · {story.user.suburb}
              </span>
            </span>
          </Link>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-[1080px] px-5 py-12">
        <div className="mx-auto max-w-[640px]">
          {paragraphs.map((p, i) => (
            <div key={i}>
              <p className="mb-6 font-[family-name:var(--font-display)] text-[18px] leading-[1.7] text-ink">
                {p}
              </p>
              {i === quoteAfter && pullQuote && (
                <blockquote className="my-10 border-l-2 border-green py-1 pl-6 md:-mx-16">
                  <p className="font-[family-name:var(--font-display)] text-[24px] font-semibold leading-snug text-ink">
                    {pullQuote}
                  </p>
                </blockquote>
              )}
            </div>
          ))}
        </div>

        {/* Footer strip */}
        <div className="mt-12 grid gap-4 border-t border-line pt-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-line bg-fill p-5">
            <h2 className="text-[16px] font-semibold text-ink">
              About this plant
            </h2>
            <p className="mt-2 text-[13px] italic text-graphite">
              {story.plant.botanicalName}
            </p>
            <p className="mt-2 text-[15px] leading-6 text-graphite">
              {story.plant.description}
            </p>
          </div>

          <div className="rounded-lg border border-line bg-fill p-5">
            <h2 className="text-[16px] font-semibold text-ink">How to grow it</h2>
            <ul className="mt-3 space-y-2 text-[15px] text-graphite">
              <li className="flex items-center gap-2">
                <Sun size={16} strokeWidth={1.5} className="shrink-0" />
                {story.plant.sunlight}
              </li>
              <li className="flex items-center gap-2">
                <Droplets size={16} strokeWidth={1.5} className="shrink-0" />
                {story.plant.water}
              </li>
              <li>{story.plant.season}</li>
              <li>
                About {story.plant.daysToHarvest >= 365
                  ? `${Math.round(story.plant.daysToHarvest / 365)} year${story.plant.daysToHarvest >= 730 ? "s" : ""}`
                  : `${story.plant.daysToHarvest} days`}{" "}
                to harvest
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-line bg-fill p-5">
            <h2 className="text-[16px] font-semibold text-ink">
              Where it comes from
            </h2>
            <p className="mt-2 text-[15px] leading-6 text-graphite">
              {story.plant.commonName} is native to the{" "}
              {story.plant.origin.charAt(0).toLowerCase() + story.plant.origin.slice(1)}.
              This one made its way to {story.user.suburb} with{" "}
              {story.user.name.split(" ")[0]}&apos;s family, and the story above
              is theirs, told in their own words.
            </p>
          </div>

          <Link
            href={`/market?q=${encodeURIComponent(story.plant.commonName)}`}
            className="group flex flex-col justify-between rounded-lg border border-line bg-fill p-5 transition-colors duration-150 hover:border-green"
          >
            <div>
              <h2 className="text-[16px] font-semibold text-ink">
                Find it near you
              </h2>
              <p className="mt-2 text-[15px] leading-6 text-graphite">
                See every neighbour growing {story.plant.commonName.toLowerCase()}{" "}
                on the map.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1.5 text-[15px] font-medium text-green">
              <MapPin size={16} strokeWidth={1.5} />
              Open the map
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
