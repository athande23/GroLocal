import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { distanceKm } from "@/lib/distance";
import ProfileEditor from "@/components/ProfileEditor";
import MyRootsTabs from "@/components/MyRootsTabs";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your garden, listings, stories and growing journey.",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const me = await getCurrentUser();

  const [gardenPlants, stories, following, myListings, claimedFromOthers, growLogs, plants] =
    await Promise.all([
      db.gardenPlant.findMany({
        where: { userId: me.id },
        include: { plant: true },
      }),
      db.story.findMany({
        where: { userId: me.id },
        include: { plant: true },
        orderBy: { createdAt: "desc" },
      }),
      db.follow.findMany({
        where: { followerId: me.id },
        include: { following: true },
      }),
      db.listing.findMany({
        where: { userId: me.id },
        include: { plant: true },
        orderBy: { createdAt: "desc" },
      }),
      db.listing.findMany({
        where: {
          claimed: true,
          claimedById: me.id,
        },
        include: {
          plant: true,
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      db.growLog.findMany({
        where: { userId: me.id },
        include: { plant: true },
        orderBy: { day: "asc" },
      }),
      db.plant.findMany({ orderBy: { commonName: "asc" } }),
    ]);

  const cultures = [...new Set(following.map((f) => f.following.heritage))].sort();

  return (
    <div className="mx-auto max-w-[1080px] px-5 py-12">
      <ProfileEditor
        user={{
          name: me.name,
          suburb: me.suburb,
          heritage: me.heritage,
          bio: me.bio,
          avatarSeed: me.avatarSeed,
          avatarData: me.avatarData,
        }}
      />

      <MyRootsTabs
        me={{ id: me.id, lat: me.lat, lng: me.lng }}
        gardenPlants={gardenPlants.map((gp) => ({
          id: gp.id,
          plantId: gp.plantId,
          plantName: gp.plant.commonName,
          botanicalName: gp.plant.botanicalName,
          quantity: gp.quantity,
          notes: gp.notes,
          daysToHarvest: gp.plant.daysToHarvest,
        }))}
        stories={stories.map((s) => ({
          id: s.id,
          title: s.title,
          plantName: s.plant.commonName,
          origin: s.origin,
          excerpt: s.body.split("\n")[0],
        }))}
        following={following.map((f) => ({
          id: f.following.id,
          name: f.following.name,
          suburb: f.following.suburb,
          heritage: f.following.heritage,
          avatarSeed: f.following.avatarSeed,
          distance: distanceKm(me.lat, me.lng, f.following.lat, f.following.lng),
        }))}
        myListings={myListings.map((l) => ({
          id: l.id,
          title: l.title,
          type: l.type,
          price: l.price,
          quantity: l.quantity,
          claimed: l.claimed,
          plantName: l.plant?.commonName ?? l.category,
        }))}
        claimedListings={claimedFromOthers.map((l) => ({
          id: l.id,
          title: l.title,
          gardenerName: l.user.name,
          suburb: l.user.suburb,
          plantName: l.plant?.commonName ?? l.category,
        }))}
        growLogs={growLogs.map((gl) => ({
          id: gl.id,
          day: gl.day,
          note: gl.note,
          plantId: gl.plantId,
          plantName: gl.plant.commonName,
          daysToHarvest: gl.plant.daysToHarvest,
        }))}
        cultures={cultures}
        allPlants={plants.map((p) => ({ id: p.id, name: p.commonName }))}
      />
    </div>
  );
}
