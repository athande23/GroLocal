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

  const [
    gardenPlants,
    stories,
    following,
    myListings,
    growLogs,
    plants,
  ] = await Promise.all([
    db.gardenPlant.findMany({
      where: {
        userId: me.id,
      },
      include: {
        plant: true,
      },
    }),

    db.story.findMany({
      where: {
        userId: me.id,
      },
      include: {
        plant: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    db.follow.findMany({
      where: {
        followerId: me.id,
      },
      include: {
        following: true,
      },
    }),

    db.listing.findMany({
      where: {
        userId: me.id,
      },
      include: {
        plant: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    db.growLog.findMany({
      where: {
        userId: me.id,
      },
      include: {
        plant: true,
      },
      orderBy: {
        day: "asc",
      },
    }),

    db.plant.findMany({
      orderBy: {
        commonName: "asc",
      },
    }),
  ]);

  const cultures: string[] = [
    ...new Set(
      following.map((follow: any) => follow.following.heritage)
    ),
  ].sort() as string[];

  return (
    <div className="mx-auto max-w-[1080px] px-5 py-12">
      <ProfileEditor
        user={{
          id: me.id,
          name: me.name,
          suburb: me.suburb,
          heritage: me.heritage,
          bio: me.bio,
          avatarSeed: me.avatarSeed,
          avatarData: me.avatarData,
        }}
      />

      <MyRootsTabs
        me={{
          id: me.id,
          lat: me.lat,
          lng: me.lng,
        }}

        gardenPlants={gardenPlants.map((gp: any) => ({
          id: gp.id,
          plantId: gp.plantId,
          plantName: gp.plant.commonName,
          botanicalName: gp.plant.botanicalName,
          quantity: gp.quantity,
          notes: gp.notes,
          daysToHarvest: gp.plant.daysToHarvest,
        }))}

        stories={stories.map((story: any) => ({
          id: story.id,
          title: story.title,
          plantName: story.plant.commonName,
          origin: story.origin,
          excerpt: story.body.split("\n")[0],
        }))}

        following={following.map((follow: any) => ({
          id: follow.following.id,
          name: follow.following.name,
          suburb: follow.following.suburb,
          heritage: follow.following.heritage,
          avatarSeed: follow.following.avatarSeed,
          distance: distanceKm(
            me.lat,
            me.lng,
            follow.following.lat,
            follow.following.lng
          ),
        }))}

        myListings={myListings.map((listing: any) => ({
          id: listing.id,
          title: listing.title,
          type: listing.type,
          price: listing.price,
          quantity: listing.quantity,
          claimed: listing.claimed,
          plantName:
            listing.plant?.commonName ?? listing.category,
        }))}

        claimedListings={[]}

        growLogs={growLogs.map((growLog: any) => ({
          id: growLog.id,
          day: growLog.day,
          note: growLog.note,
          plantId: growLog.plantId,
          plantName: growLog.plant.commonName,
          daysToHarvest: growLog.plant.daysToHarvest,
        }))}

        cultures={cultures}

        allPlants={plants.map((plant: any) => ({
          id: plant.id,
          name: plant.commonName,
        }))}
      />
    </div>
  );
}