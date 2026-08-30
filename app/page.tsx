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

type Heritage = {
  heritage: string;
};

type PlantNearYou = {
  id: string;
  commonName: string;
  origin: string;
  imageUrl: string | null;
  _count: {
    gardenPlants: number;
  };
};

export default async function Home(): Promise<React.ReactElement> {
  const me = await getCurrentUser();

  const [
    gardenerCount,
    plantCount,
    storyCount,
    listingCount,
    heritages,
  ] = await Promise.all([
    db.user.count(),

    db.plant.count(),

    db.story.count(),

    db.listing.count({
      where: {
        claimed: false,
      },
    }),

    db.user.findMany({
      select: {
        heritage: true,
      },
      distinct: ["heritage"],
    }),
  ]);

  const plantsNearYou: PlantNearYou[] = await db.plant.findMany({
    select: {
      id: true,
      commonName: true,
      origin: true,
      imageUrl: true,
      _count: {
        select: {
          gardenPlants: true,
        },
      },
    },
    orderBy: {
      gardenPlants: {
        _count: "desc",
      },
    },
    take: 10,
  });

  const chips = cultureChips.filter((chip) =>
    heritages.some(
      (heritage: Heritage) =>
        heritage.heritage.includes(chip.match)
    )
  );

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
      <section className="flex flex-col items-center py-12 sm:py-16 md:py-20">
        <div className="w-full text-center">
          <h1 className="mx-auto max-w-[1000px] font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-ink sm:text-4xl md:text-5xl lg:text-6xl">
            Discover the people, plants and stories growing around you.
          </h1>

          <p className="mx-auto mt-4 max-w-[750px] text-base leading-relaxed text-graphite sm:mt-5 sm:text-lg">
            Backyard produce, cultural knowledge and seedlings, shared across
            your suburb.
          </p>
        </div>

        <div className="mt-8 w-full sm:mt-10 md:mt-12">
          <HomeSearch />
        </div>

        <div className="mt-6 flex justify-center sm:mt-8">
          <UploadListing defaultAddress={me.suburb} />
        </div>

        <div className="mt-10 flex w-full flex-wrap items-center justify-center gap-x-8 gap-y-4 border-y border-line py-6 text-center text-sm text-graphite sm:mt-12 sm:gap-x-12 sm:py-8 sm:text-base md:mt-14">
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

      <section className="border-t border-line py-12">
        <h2 className="font-[family-name:var(--font-display)] text-[24px] font-semibold leading-8 text-ink">
          Growing near you
        </h2>

        <div className="scroll-row -mx-1 mt-6 flex gap-4 overflow-x-auto px-1 pb-2">
          {plantsNearYou.map((plant: PlantNearYou) => (
            <Link
              key={plant.id}
              href={`/market?q=${encodeURIComponent(
                plant.commonName
              )}`}
              className="w-44 shrink-0 rounded-lg border border-line bg-fill p-4 transition-colors duration-150 hover:border-green"
            >
              {plant.imageUrl ? (
                <img
                  src={plant.imageUrl}
                  alt={plant.commonName}
                  className="h-14 w-14 rounded-lg border border-line object-cover"
                />
              ) : (
                <PlantTile
                  name={plant.commonName}
                  size="md"
                />
              )}

              <p className="mt-3 text-[16px] font-semibold leading-[22px] text-ink">
                {plant.commonName}
              </p>

              <p className="mt-0.5 text-[13px] text-graphite">
                {plant.origin}
              </p>

              <p className="mt-2 text-[13px] text-graphite">
                {plant._count.gardenPlants} gardener
                {plant._count.gardenPlants === 1 ? "" : "s"}{" "}
                nearby
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-line py-12 sm:py-14 md:py-16">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-ink sm:text-3xl">
          Discover a culture
        </h2>

        <p className="mt-3 max-w-[640px] text-sm leading-relaxed text-graphite sm:mt-4 sm:text-base">
          Market finds from neighbours who describe their heritage this way.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
          {chips.map((chip) => {
            const heritage = heritages.find(
              (item: Heritage) =>
                item.heritage.includes(chip.match)
            );

            return (
              <Link
                key={chip.label}
                href={`/market?culture=${encodeURIComponent(
                  heritage?.heritage ?? ""
                )}`}
                className="rounded-md border border-line bg-fill px-4 py-2.5 text-sm text-ink transition-all duration-200 hover:border-green hover:bg-green-soft/60 hover:shadow-sm sm:text-base"
              >
                {chip.label}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}