import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { distanceKm, formatDistance } from "@/lib/distance";
import { ButtonLink } from "@/components/ui/Button";
import { HeritageTag } from "@/components/ui/Tag";
import { PlantTile } from "@/components/PlantTile";
import { Avatar } from "@/components/Avatar";
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
      db.user.findMany({ select: { heritage: true }, distinct: ["heritage"] }),
    ]);

  const plantsNearYou = await db.plant.findMany({
    include: { _count: { select: { gardenPlants: true } } },
    orderBy: { gardenPlants: { _count: "desc" } },
    take: 10,
  });

  const storiesNearYou = await db.story.findMany({
    include: { user: true, plant: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  const chips = cultureChips.filter((c) =>
    heritages.some((h) => h.heritage.includes(c.match))
  );

  return (
    <div className="mx-auto max-w-[1080px] px-5">
      {/* Search, front and centre */}
      <section className="pt-10">
        <HomeSearch />
      </section>

      {/* Hero */}
      <section className="pt-10 pb-12">
        <h1 className="max-w-[640px] font-[family-name:var(--font-display)] text-[36px] font-semibold leading-[44px] text-ink">
          Discover the people, plants and stories growing around you.
        </h1>
        <p className="mt-4 max-w-[640px] text-[16px] text-graphite">
          Backyard produce, cultural knowledge and seedlings, shared across
          your suburb.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <ButtonLink href="/market">
            Open the market
            <ArrowRight size={16} strokeWidth={1.5} />
          </ButtonLink>
          <UploadListing defaultAddress={`${me.suburb}`} />
        </div>
        <p className="mt-10 text-[15px] text-graphite">
          <span className="font-medium text-ink">{gardenerCount}</span> gardeners
          {" · "}
          <span className="font-medium text-ink">{plantCount}</span> plants
          {" · "}
          <span className="font-medium text-ink">{storyCount}</span> stories
          {" · "}
          <span className="font-medium text-ink">{listingCount}</span> things on
          the market
        </p>
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
              <p className="mt-0.5 text-[13px] text-graphite">{p.origin}</p>
              <p className="mt-2 text-[13px] text-graphite">
                {p._count.gardenPlants} gardener
                {p._count.gardenPlants === 1 ? "" : "s"} nearby
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Stories near you */}
      <section className="border-t border-line py-12">
        <h2 className="font-[family-name:var(--font-display)] text-[24px] font-semibold leading-8 text-ink">
          Stories near you
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {storiesNearYou.map((s) => (
            <Link
              key={s.id}
              href={`/story/${s.id}`}
              className="rounded-lg border border-line bg-fill p-5 transition-colors duration-150 hover:border-green"
            >
              <p className="font-[family-name:var(--font-display)] text-[18px] font-semibold leading-6 text-ink">
                {s.title}
              </p>
              <div className="mt-3 flex items-center gap-2.5">
                <Avatar
                  seed={s.user.avatarSeed}
                  src={s.user.avatarData}
                  name={s.user.name}
                  size="sm"
                />
                <div>
                  <p className="text-[13px] font-medium text-ink">
                    {s.user.name}
                  </p>
                  <p className="text-[13px] text-graphite">
                    {formatDistance(distanceKm(me.lat, me.lng, s.user.lat, s.user.lng))} away
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <HeritageTag heritage={s.user.heritage} />
              </div>
              <p className="mt-3 line-clamp-2 text-[15px] text-graphite">
                {s.body.split("\n")[0]}
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
            const heritage = heritages.find((h) => h.heritage.includes(c.match));
            return (
              <Link
                key={c.label}
                href={`/market?culture=${encodeURIComponent(heritage?.heritage ?? "")}`}
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
