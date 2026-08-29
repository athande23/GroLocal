import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, MapPin } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { distanceKm, formatDistance } from "@/lib/distance";
import { HeritageTag, ListingTag } from "@/components/ui/Tag";
import { PlantTile } from "@/components/PlantTile";
import { Avatar } from "@/components/Avatar";
import FollowButton from "@/components/FollowButton";
import Timeline from "@/components/Timeline";
import ClaimButton from "@/components/ClaimButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const user = await db.user.findUnique({ where: { id } });
  return {
    title: user ? `${user.name}'s garden` : "Gardener",
    description: user?.bio,
  };
}

export default async function GardenerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await getCurrentUser();

  const user = await db.user.findUnique({
    where: { id },
    include: {
      gardenPlants: { include: { plant: { include: { stories: true } } } },
      stories: { include: { plant: true }, orderBy: { createdAt: "desc" } },
      listings: {
        where: { claimed: false },
        include: { plant: true, user: true },
      },
      growLogs: { include: { plant: true }, orderBy: { day: "asc" } },
      followers: true,
    },
  });

  if (!user) notFound();

  const isMe = user.id === me.id;
  const iFollow = user.followers.some((f) => f.followerId === me.id);
  const dist = distanceKm(me.lat, me.lng, user.lat, user.lng);

  return (
    <div>
      {/* Header band */}
      <div className="bg-ink">
        <div className="mx-auto max-w-[1080px] px-5 py-10">
          <div className="flex flex-wrap items-center gap-6">
            <Avatar seed={user.avatarSeed} src={user.avatarData} name={user.name} size="xl" className="border-paper/20" />
            <div className="min-w-0">
              <h1 className="font-[family-name:var(--font-display)] text-[36px] font-semibold leading-[44px] text-paper">
                {user.name}
              </h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-paper/70">
                <span className="inline-flex items-center gap-1">
                  <MapPin size={16} strokeWidth={1.5} />
                  {user.suburb}
                </span>
                {!isMe && <span>{formatDistance(dist)} away</span>}
                <span className="inline-flex items-center rounded-md bg-paper/10 px-2 py-0.5 text-[13px] font-medium text-paper">
                  {user.heritage}
                </span>
              </p>
              <p className="mt-3 max-w-[640px] text-[15px] leading-6 text-paper/80">
                {user.bio}
              </p>
              <div className="mt-4">
                {isMe ? (
                  <span className="text-[13px] text-paper/70">
                    This is you · {user.followers.length} follower
                    {user.followers.length === 1 ? "" : "s"}
                  </span>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <FollowButton
                      followingId={user.id}
                      initialFollowing={iFollow}
                      initialFollowers={user.followers.length}
                    />
                    <Link
                      href={`/messages?to=${user.id}`}
                      className="rounded-md border border-paper/40 px-4 py-2 text-[15px] font-medium text-paper transition-colors duration-150 hover:border-paper"
                    >
                      Message
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1080px] px-5">
        {/* My garden */}
        <section className="py-12">
          <h2 className="font-[family-name:var(--font-display)] text-[24px] font-semibold leading-8 text-ink">
            {isMe ? "My garden" : "The garden"}
          </h2>
          {user.gardenPlants.length === 0 ? (
            <p className="mt-4 text-[15px] text-graphite">
              Nothing planted yet. Every garden starts somewhere.
            </p>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {user.gardenPlants.map((gp) => {
                const story = gp.plant.stories.find((s) => s.userId === user.id);
                const inner = (
                  <div className="flex items-start gap-4">
                    <PlantTile name={gp.plant.commonName} size="md" />
                    <div className="min-w-0">
                      <p className="text-[16px] font-semibold leading-[22px] text-ink">
                        {gp.plant.commonName}
                      </p>
                      <p className="text-[13px] italic text-graphite">
                        {gp.plant.botanicalName}
                      </p>
                      <p className="mt-1 text-[13px] text-graphite">
                        {gp.quantity}
                        {gp.notes ? ` · ${gp.notes}` : ""}
                      </p>
                      {story && (
                        <p className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-green">
                          <BookOpen size={14} strokeWidth={1.5} />
                          Read its story
                        </p>
                      )}
                    </div>
                  </div>
                );
                return story ? (
                  <Link
                    key={gp.id}
                    href={`/story/${story.id}`}
                    className="rounded-lg border border-line bg-fill p-5 transition-colors duration-150 hover:border-green"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div key={gp.id} className="rounded-lg border border-line bg-fill p-5">
                    {inner}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Stories */}
        {user.stories.length > 0 && (
          <section className="border-t border-line py-12">
            <h2 className="font-[family-name:var(--font-display)] text-[24px] font-semibold leading-8 text-ink">
              {isMe ? "My stories" : "Stories"}
            </h2>
            <ul className="mt-6 space-y-4">
              {user.stories.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/story/${s.id}`}
                    className="block rounded-lg border border-line bg-fill p-5 transition-colors duration-150 hover:border-green"
                  >
                    <p className="font-[family-name:var(--font-display)] text-[18px] font-semibold text-ink">
                      {s.title}
                    </p>
                    <p className="mt-1 text-[13px] text-graphite">
                      {s.plant.commonName} · {s.origin.replace("->", "→")}
                    </p>
                    <p className="mt-2 line-clamp-2 text-[15px] text-graphite">
                      {s.body.split("\n")[0]}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Available now */}
        {user.listings.length > 0 && (
          <section className="border-t border-line py-12">
            <h2 className="font-[family-name:var(--font-display)] text-[24px] font-semibold leading-8 text-ink">
              Available now
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {user.listings.map((l) => (
                <div key={l.id} className="flex flex-col rounded-lg border border-line bg-fill p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <PlantTile name={l.plant?.commonName ?? l.title} size="sm" />
                      <div>
                        <p className="text-[16px] font-semibold leading-[22px] text-ink">
                          {l.title}
                        </p>
                        <p className="text-[13px] text-graphite">{l.quantity}</p>
                      </div>
                    </div>
                    <ListingTag type={l.type} price={l.price} />
                  </div>
                  {l.swapFor && (
                    <p className="mt-2 text-[13px] text-graphite">
                      Wants: {l.swapFor}
                    </p>
                  )}
                  {!isMe && (
                    <div className="mt-4">
                      <ClaimButton
                        listingId={l.id}
                        listingTitle={l.title}
                        gardenerName={user.name}
                        suburb={user.suburb}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Growing journey */}
        {user.growLogs.length > 0 && (
          <section className="border-t border-line py-12">
            <h2 className="font-[family-name:var(--font-display)] text-[24px] font-semibold leading-8 text-ink">
              Growing journey
            </h2>
            <div className="mt-6 max-w-[640px]">
              <Timeline
                entries={user.growLogs.map((gl) => ({
                  id: gl.id,
                  day: gl.day,
                  note: gl.note,
                  plantName: gl.plant.commonName,
                }))}
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
