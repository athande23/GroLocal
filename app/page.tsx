import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { PlantTile } from "@/components/PlantTile";
import HomeSearch from "@/components/HomeSearch";
import UploadListing from "@/components/UploadListing";

export const dynamic = "force-dynamic";

const cultureChips = [
  { label: "Indian gardens", match: "Indian" },
  { label: "Italian gardens", match: "Italian" },
  { label: "Lebanese gardens", match: "Lebanese" },
  { label: "Vietnamese gardens", match: "Vietnamese" },
  { label: "Chinese gardens", match: "Chinese" },
];

export default async function Home() {
  const me = await getCurrentUser();

  const [gardenerCount, plantCount, storyCount, listingCount, heritages] =
    await Promise.all([
      db.user.count(),
      db.plant.count(),
      db.story.count(),
      db.listing.count({ where: { claimed: false } }),
      db.user.findMany({
        select: { heritage: true },
        distinct: ["heritage"],
      }),
    ]);

  const plantsNearYou = await db.plant.findMany({
    include: {
      _count: {
        select: { gardenPlants: true },
      },
    },
    orderBy: {
      gardenPlants: {
        _count: "desc",
      },
    },
    take: 10,
  });

  const chips = cultureChips.filter((c) =>
    heritages.some((h) => h.heritage.includes(c.match))
  );

  return (
    <div className="mx-auto max-w-[1200px] px-5">

      {/* HERO + SEARCH */}
      <section className="flex flex-col items-center pt-20 pb-20">

        {/* Main heading */}
        <div className="w-full text-center">
          <h1 className="mx-auto max-w-[1000px] font-[family-name:var(--font-display)] text-[44px] font-semibold leading-[52px] text-ink md:text-[52px] md:leading-[60px]">
            Discover the people, plants and stories growing around you.
          </h1>

          <p className="mx-auto mt-5 max-w-[750px] text-[18px] leading-7 text-graphite">
            Backyard produce, cultural knowledge and seedlings, shared across
            your suburb.
          </p>
        </div>

        {/* Search */}
        <div className="mt-12 w-full">
          <HomeSearch />
        </div>

        {/* Upload Item */}
        <div className="mt-8 flex justify-center">
          <UploadListing
            defaultAddress={`${me.suburb}`}
            buttonLabel="Upload Item"
          />
        </div>

        {/* Stats */}
        <div className="mt-14 flex w-full flex-wrap items-center justify-center gap-x-12 gap-y-4 border-y border-line py-6 text-center text-[15px] text-graphite">
          <div>
            <span className="font-semibold text-ink">
              {gardenerCount}
            </span>{" "}
            gardeners
          </div>

          <div>
            <span className="font-semibold text-ink">
              {plantCount}
            </span>{" "}
            plants
          </div>

          <div>
            <span className="font-semibold text-ink">
              {storyCount}
            </span>{" "}
            stories
          </div>

          <div>
            <span className="font-semibold text-ink">
              {listingCount}
            </span>{" "}
            things on the market
          </div>
        </div>

      </section>

      {/* Growing near you */}
      <section className="border-t border-line py-12">
        <h2 className="font-[family-name:var(--font-display)] text-[24px] font-semibold leading-8 text-ink">
          Growing near you
        </h2>

        <div className="scroll-row -mx-1 mt-6 flex gap-4 overflow-x-auto px-1 pb-2">
          {plantsNearYou.map((p) => (
            <Link
              key={p.id}
              href={`/market?q=${encodeURIComponent(p.commonName)}`}
              className="w-44 shrink-0 rounded-lg border border-line bg-fill p-4 transition-colors duration-150 hover:border-green"
            >
              <PlantTile name={p.commonName} size="md" />

              <p className="mt-3 text-[16px] font-semibold leading-[22px] text-ink">
                {p.commonName}
              </p>

              <p className="mt-0.5 text-[13px] text-graphite">
                {p.origin}
              </p>

              <p className="mt-2 text-[13px] text-graphite">
                {p._count.gardenPlants} gardener
                {p._count.gardenPlants === 1 ? "" : "s"} nearby
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Discover a culture */}
      <section className="border-t border-line py-12">
        <h2 className="font-[family-name:var(--font-display)] text-[24px] font-semibold leading-8 text-ink">
          Discover a culture
        </h2>

        <p className="mt-2 max-w-[640px] text-[15px] text-graphite">
          Market finds from neighbours who describe their heritage this way.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          {chips.map((c) => {
            const heritage = heritages.find((h) =>
              h.heritage.includes(c.match)
            );

            return (
              <Link
                key={c.label}
                href={`/market?culture=${encodeURIComponent(
                  heritage?.heritage ?? ""
                )}`}
                className="rounded-md border border-line bg-fill px-4 py-2 text-[15px] text-ink transition-colors duration-150 hover:border-green"
              >
                {c.label}
              </Link>
            );
          })}
        </div>
      </section>

    </div>
  );
}