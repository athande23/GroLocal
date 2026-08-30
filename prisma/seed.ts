import { PrismaClient } from "../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { plants } from "./data/plants";
import { gardeners } from "./data/gardeners";
import { stories } from "./data/stories";

const adapter = new PrismaBetterSqlite3({
  url: "file:./prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });

// gardenerKey -> list of [plantKey, quantity, notes?]
const gardenAssignments: Record<string, [string, string, string?][]> = {
  priya: [
    ["curry-leaf", "1 tree", "Grown from my grandmother's 1974 cutting"],
    ["coriander", "2 beds", "Sown fresh every autumn"],
    ["turmeric", "6 pots"],
    ["chilli", "3 bushes"],
    ["okra", "1 bed", "Summer only"],
  ],
  tom: [
    ["basil", "2 pots", "First attempt, going surprisingly well"],
    ["rocket", "1 trough"],
  ],
  raj: [
    ["bitter-melon", "1 trellis", "Karela for the whole street"],
    ["okra", "2 beds"],
    ["drumstick-tree", "1 tree", "Taller than the house"],
    ["coriander", "1 bed"],
    ["chilli", "4 bushes"],
  ],
  sarah: [
    ["vietnamese-mint", "1 large tub", "The Cabramatta cutting, four decades on"],
    ["perilla", "1 bed"],
    ["betel-leaf", "1 shaded corner"],
    ["thai-basil", "3 pots"],
  ],
  giuseppe: [
    ["san-marzano", "2 long beds", "Seed line saved since 1983"],
    ["basil", "1 bed", "Planted beside the tomatoes, as required"],
    ["chilli", "2 bushes"],
  ],
  lucia: [
    ["radicchio", "1 bed", "Treviso type, sweetens after the first cold snap"],
    ["fig", "1 tree"],
    ["grape-vine", "1 pergola", "Leaves picked young for dolma"],
    ["rocket", "1 bed"],
  ],
  mei: [
    ["loquat", "1 tree", "Sucker of my father's market garden tree"],
    ["gai-lan", "2 beds"],
    ["bok-choy", "2 beds"],
    ["garlic-chives", "1 clump"],
  ],
  amal: [
    ["molokhia", "1 fence line", "Picked young and often"],
    ["zaatar", "1 dry bed", "The 1988 shoe cutting"],
    ["coriander", "1 bed"],
  ],
  hassan: [
    ["fig", "1 tree"],
    ["olive", "2 trees", "Brined in the garage every autumn"],
    ["pomegranate", "1 tree"],
    ["grape-vine", "1 fence"],
  ],
  linh: [
    ["lemongrass", "1 huge clump", "Division of Ba Ngoai's original"],
    ["vietnamese-mint", "1 tub"],
    ["kaffir-lime", "1 tree"],
    ["pandan", "1 sheltered tub"],
  ],
  duc: [
    ["taro", "1 wet bed", "The boggy corner behind the shed"],
    ["lemongrass", "1 clump"],
    ["bitter-melon", "1 trellis"],
  ],
  elena: [
    ["olive", "1 tree", "Arrived on the Patris in 1963"],
    ["rocket", "2 beds", "Wild rocket, self-sown"],
    ["basil", "1 bed"],
  ],
  yiannis: [
    ["rocket", "2 beds"],
    ["radicchio", "1 bed"],
    ["quince", "1 tree"],
  ],
  fatima: [
    ["pomegranate", "1 tree", "Planted the week we got the keys"],
    ["sumac", "1 tree"],
    ["coriander", "1 bed"],
  ],
  omar: [
    ["grape-vine", "1 fence line", "Leaves bagged up for dolma every October"],
    ["quince", "1 tree"],
    ["pomegranate", "1 tree"],
  ],
  kim: [
    ["perilla", "2 beds", "From the film canister seeds, thirty-three years on"],
    ["garlic-chives", "1 clump"],
    ["chilli", "2 bushes"],
  ],
  james: [
    ["okra", "3 beds", "Quantities described as alarming"],
    ["chilli", "6 bushes", "Serious heat only"],
    ["bitter-melon", "1 trellis"],
  ],
  rosa: [
    ["guava", "1 tree", "The smell of Batangas every April"],
    ["taro", "1 wet bed"],
    ["okra", "1 bed"],
  ],
  wei: [
    ["garlic-chives", "1 old clump", "Divided thirty times and counting"],
    ["bok-choy", "2 beds"],
    ["perilla", "1 bed"],
  ],
  anh: [
    ["thai-basil", "4 trays", "Seedlings for the library exchange"],
    ["holy-basil", "2 trays"],
    ["lemongrass", "1 clump"],
    ["vietnamese-mint", "1 tub"],
  ],
  nadia: [
    ["molokhia", "1 side fence", "Rated out of ten by my mother, never a ten"],
    ["okra", "1 bed"],
    ["coriander", "2 beds"],
  ],
  marco: [
    ["fig", "1 tree", "The 1968 Catania cutting"],
    ["basil", "2 beds"],
    ["san-marzano", "1 bed", "Seed from Giuseppe"],
  ],
  sunita: [
    ["turmeric", "1 long bed", "Dug every July, trampoline-dried"],
    ["ginger", "4 pots"],
    ["chilli", "3 bushes"],
    ["coriander", "2 beds"],
  ],
  leilani: [
    ["taro", "1 large wet bed", "Aunty Sina's 2003 planting"],
    ["ginger", "2 pots"],
  ],
};

// Believable pickup addresses, one per gardener.
const addresses: Record<string, string> = {
  priya: "14 Marion St, Harris Park",
  tom: "8 Enid Ave, Granville",
  raj: "27 Station St East, Harris Park",
  sarah: "52 Blaxcell St, Granville",
  giuseppe: "31 Chetwynd Rd, Merrylands",
  lucia: "9 Myee St, Merrylands",
  mei: "18 Lakeside Rd, Eastwood",
  amal: "44 Haldon St, Lakemba",
  hassan: "12 Quigg St, Lakemba",
  linh: "63 John St, Cabramatta",
  duc: "21 Longfield St, Cabramatta",
  elena: "35 Livingstone Rd, Marrickville",
  yiannis: "7 Petersham Rd, Marrickville",
  fatima: "29 Auburn Rd, Auburn",
  omar: "16 Mary St, Auburn",
  kim: "40 Rowe St, Eastwood",
  james: "5 Sheffield St, Merrylands",
  rosa: "23 Restwell St, Bankstown",
  wei: "11 Burleigh St, Burwood",
  anh: "38 Chapel Rd, Bankstown",
  nadia: "26 Elizabeth St, Ashfield",
  marco: "19 Orpington St, Ashfield",
  sunita: "33 Queens Rd, Hurstville",
  leilani: "48 Park Rd, Hurstville",
};

// [gardenerKey, plantKey|null, type, category, title, quantity, price?, swapFor?, claimed?]
const listingSeeds: [
  string,
  string | null,
  string,
  string,
  string,
  string,
  number?,
  string?,
  boolean?
][] = [
  ["priya", "curry-leaf", "GIVE", "herb", "10 curry leaf seedlings", "10 seedlings"],
  ["priya", "turmeric", "SWAP", "herb", "Fresh turmeric rhizomes", "1 kg", undefined, "Any leafy Asian greens"],
  ["priya", "chilli", "GIVE", "vegetable", "Surplus green chillies", "2 bags"],
  ["raj", "bitter-melon", "GIVE", "vegetable", "Karela, picked this morning", "3 kg"],
  ["raj", "okra", "SELL", "vegetable", "Fresh okra, tender pods", "per kg", 4],
  ["raj", "drumstick-tree", "GIVE", "vegetable", "Moringa pods and leaves", "big bunch"],
  ["sarah", "vietnamese-mint", "GIVE", "herb", "Rau ram rooted cuttings", "8 pots"],
  ["sarah", "perilla", "SWAP", "herb", "Perilla seedlings", "6 pots", undefined, "Kaffir lime leaves"],
  ["giuseppe", "san-marzano", "GIVE", "vegetable", "San Marzano seedlings, 1983 line", "12 seedlings"],
  ["giuseppe", "chilli", "SELL", "vegetable", "Dried chilli strings", "per string", 5],
  ["giuseppe", null, "SELL", "tool", "Hand-cranked passata machine, spare", "1 machine", 60],
  ["lucia", "grape-vine", "GIVE", "herb", "Young vine leaves for dolma", "200 leaves"],
  ["lucia", "fig", "SELL", "fruit", "Black figs, tree ripened", "per dozen", 8],
  ["mei", "gai-lan", "SELL", "vegetable", "Gai lan bunches", "per bunch", 3],
  ["mei", "loquat", "GIVE", "fruit", "Loquat seedlings from the family tree", "5 seedlings"],
  ["amal", "molokhia", "GIVE", "vegetable", "Molokhia, young leaves", "2 kg"],
  ["amal", "zaatar", "SWAP", "herb", "Za'atar cuttings", "4 pots", undefined, "Sumac berries or seeds"],
  ["hassan", "olive", "SWAP", "fruit", "Home-brined olives", "2 jars", undefined, "Anything from your garden"],
  ["hassan", null, "GIVE", "tool", "Olive rake and two tarps", "1 set"],
  ["linh", "lemongrass", "GIVE", "herb", "Lemongrass stalks, ready to root", "20 stalks"],
  ["linh", "pandan", "SELL", "herb", "Pandan leaves, cut fresh", "per bunch", 4],
  ["duc", "taro", "SWAP", "vegetable", "Taro shoots", "6 shoots", undefined, "Herb seedlings"],
  ["elena", "olive", "GIVE", "fruit", "Cured Kalamata-style olives", "3 jars"],
  ["yiannis", "rocket", "GIVE", "vegetable", "Wild rocket, endless supply", "4 bags"],
  ["yiannis", null, "SELL", "tool", "Tomato stakes, hardwood", "bundle of 20", 10],
  ["fatima", "pomegranate", "SELL", "fruit", "Pomegranates from the courtyard tree", "per fruit", 2],
  ["omar", "grape-vine", "GIVE", "herb", "Fresh vine leaves, palm sized", "150 leaves"],
  ["kim", "perilla", "GIVE", "herb", "Kkaennip, forty-leaf bundles", "3 bundles"],
  ["james", "chilli", "SELL", "vegetable", "Scotch bonnets, not for beginners", "per bag", 6],
  ["anh", "thai-basil", "GIVE", "herb", "Thai basil seedlings", "20 pots"],
  ["wei", null, "GIVE", "tool", "Hori hori garden knife, barely used", "1 knife"],
  ["rosa", "guava", "GIVE", "fruit", "Guavas, eat them green with salt", "1 box", undefined, undefined, true],
];

// follower -> following
const followPairs: [string, string][] = [
  ["tom", "priya"], ["tom", "giuseppe"], ["tom", "sarah"], ["tom", "raj"],
  ["priya", "raj"], ["priya", "amal"], ["priya", "sunita"], ["priya", "linh"],
  ["raj", "priya"], ["raj", "james"], ["sarah", "linh"], ["sarah", "anh"],
  ["sarah", "kim"], ["linh", "sarah"], ["linh", "duc"], ["linh", "anh"],
  ["duc", "linh"], ["duc", "leilani"], ["giuseppe", "lucia"], ["giuseppe", "marco"],
  ["lucia", "amal"], ["lucia", "elena"], ["marco", "giuseppe"], ["marco", "elena"],
  ["elena", "yiannis"], ["elena", "hassan"], ["yiannis", "elena"], ["amal", "nadia"],
  ["amal", "hassan"], ["nadia", "amal"], ["hassan", "omar"], ["omar", "fatima"],
  ["fatima", "amal"], ["kim", "mei"], ["mei", "wei"], ["wei", "mei"],
  ["james", "raj"], ["rosa", "leilani"], ["leilani", "rosa"], ["anh", "sarah"],
];

// Grow logs for Tom, the demo account.
const tomGrowLogs: [string, number, string][] = [
  ["curry-leaf", 1, "Planted one of Priya's seedlings in the big terracotta pot, sunniest corner of the yard. She said it needs watching, so I am watching."],
  ["curry-leaf", 5, "No visible change. Apparently this is normal. Watered deeply, resisted the urge to dig it up and check the roots."],
  ["curry-leaf", 12, "Two new leaves at the tip, brighter green than the rest. Smelled one. Instantly understood what all the fuss is about."],
  ["curry-leaf", 20, "Priya walked past and inspected it over the fence. Verdict: needs more water in this heat. Adjusted."],
  ["curry-leaf", 31, "First full new stem. Made Nan's chicken curry and tempered six of my own leaves in the oil. The whole kitchen changed."],
  ["curry-leaf", 45, "Growth has doubled since planting. Moved the pot a metre left to dodge the shade from next door's new pergola."],
  ["basil", 1, "Sowed two pots of sweet basil from a punnet. If I can keep supermarket basil alive for a fortnight this will be a personal record."],
  ["basil", 10, "Both pots up and thriving. Pinched the tops like the internet said. Felt like a proper gardener for the first time."],
  ["basil", 24, "Harvested enough for a small batch of pesto. Gave a jar to Priya as interest on the curry leaf loan."],
  ["rocket", 1, "Scattered rocket seed in the trough by the back door. Yiannis says it is unkillable. We will test that claim."],
  ["rocket", 18, "First picking, peppery beyond expectation. Yiannis was right, and he knows he was right."],
  ["rocket", 35, "The trough is now a jungle. I understand now why Yiannis begs people to take his."],
];

// Dummy message threads. [fromKey, toKey, body], in chronological order.
const messageSeeds: [string, string, string][] = [
  ["tom", "priya", "Hi Priya, I saw your curry leaf seedlings on the market. Are any still available?"],
  ["priya", "tom", "Hi Tom! Yes, six left. They are from my grandmother's tree so I am fussy about where they go. Do you have a sunny spot?"],
  ["tom", "priya", "Sunniest corner of a concrete yard in Granville. I am growing my way through my Nan's recipe book and her curry needs the real thing."],
  ["priya", "tom", "That is exactly the right answer. Come by Saturday morning, 14 Marion St. I will talk you through the watering."],
  ["tom", "priya", "Perfect, see you Saturday. Thank you!"],
  ["tom", "giuseppe", "Giuseppe, are the San Marzano seedlings from the 1983 seed line still going?"],
  ["giuseppe", "tom", "Always. Twelve left. If you take one you take on the responsibility, you understand. No hardware store tomatoes next to it."],
  ["tom", "giuseppe", "Understood. One seedling and the full lecture please."],
  ["priya", "amal", "Amal, I have fresh turmeric coming out of my ears. Still keen to swap for molokhia?"],
  ["amal", "priya", "Yes! My mother will finally award the harvest a seven out of ten if it comes with your turmeric. Sunday pickup?"],
  ["priya", "amal", "Sunday works. I will bring a full kilo."],
  ["sarah", "tom", "Hi Tom, you claimed the rau ram cuttings. They root in a week in water, then straight into a big pot. It spreads, so do not plant it in the ground unless you mean it."],
  ["tom", "sarah", "Noted, thanks Sarah. Pot it is."],
  ["marco", "giuseppe", "Zio, saving seed this weekend. Do you want the best six from my bed for the tin as usual?"],
  ["giuseppe", "marco", "Of course. Paper towel, pencil, the year. You know the system."],
];

// Dummy discussion posts.
const postSeeds: {
  key: string;
  kind: string;
  title: string;
  culture?: string;
  body: string;
}[] = [
  {
    key: "priya",
    kind: "recipe",
    title: "Nan's Sunday chicken curry, as she dictated it",
    culture: "Punjabi Indian",
    body: `Heat ghee in the big pot. Add mustard seeds and wait for them to pop. Add two sprigs of fresh curry leaves and stand back, they spit.

Fry one sliced onion until deep gold, then ginger, garlic, three slit green chillies and a small knob of grated fresh turmeric. Add the chicken and brown it properly, no shortcuts. Add 400g of ripe tomatoes crushed by hand, and salt.

Cover and simmer until the oil comes back to the top. Finish with a big handful of fresh coriander. Serve with rice, and always more than you think you need.

Every ingredient in this is growing within a couple of kilometres of Harris Park right now. That is the whole point of this app.`,
  },
  {
    key: "giuseppe",
    kind: "advice",
    title: "Passata day checklist for first timers",
    culture: "Calabrian Italian",
    body: `You need: ripe San Marzanos (not salad tomatoes), a machine or a mouli, bottles washed and dried in the sun, basil, one leaf per bottle, and more people than you think.

Start at 7am before the heat. Bottle hot, seal immediately, boil the bottles in the drum for 30 minutes, then leave them in the water overnight.

The most important ingredient is the argument about whether this year's batch is better than last year's. Do not skip the argument.`,
  },
  {
    key: "linh",
    kind: "advice",
    title: "Striking lemongrass from market stalks",
    culture: "Vietnamese Australian",
    body: `Buy the freshest stalks you can find, with the base intact. Stand them in a glass of water on the windowsill and change the water every two days.

Roots appear in about a week. Pot them up for a month before they go in the ground. Full sun, generous water in summer, and cut low, it always comes back.

My grandmother started her clump this way in 1981 and half of Cabramatta's lemongrass descends from it.`,
  },
  {
    key: "kim",
    kind: "recipe",
    title: "Kkaennip jangajji, my mother's perilla pickle",
    culture: "Korean Australian",
    body: `Pick forty perilla leaves, wash and dry them completely. Mix soy sauce, a little water, garlic, gochugaru, sugar and sesame seeds.

Layer the leaves in a flat container, painting every single leaf with the sauce. Do not pour it over the top and hope. Weight it, fridge it, eat from tomorrow.

One leaf over hot rice, peeled off the stack at midnight, is the correct serving size.`,
  },
  {
    key: "amal",
    kind: "advice",
    title: "Molokhia in Sydney: sow in November, not September",
    culture: "Lebanese Australian",
    body: `Everyone sows too early and blames the seed. Molokhia wants real heat. Wait until November, sow direct into a bed with compost, and keep it damp until it is up.

Pick young and often. If it flowers you waited too long, and my mother will be able to tell just by walking past your fence.`,
  },
  {
    key: "elena",
    kind: "recipe",
    title: "Curing olives in a garage, the Kytherian way",
    culture: "Greek Australian",
    body: `Slit each olive or crack it, your choice, and cover with water. Change the water every day for two weeks. Yes, every day. The bitterness leaves slowly and there are no shortcuts.

Then brine: one part salt to ten parts water, a splash of red wine vinegar, lemon, oregano. Into the crock, weight them under the surface, wait two months.

They are ready when your father in law stops complaining about them. Ours took until March.`,
  },
  {
    key: "leilani",
    kind: "advice",
    title: "Taro will grow where your lawn keeps dying",
    culture: "Samoan Australian",
    body: `Find the corner where the stormwater pools and the grass gives up. That is not a problem corner, that is a taro bed.

Plant shoots in spring, feed them well, and keep the water up. Harvest in autumn by rocking the whole plant loose. Everyone within splashing distance gets muddy, this is traditional and cannot be avoided.

Cook every part properly, always. Young leaves for palusami, corm boiled or roasted.`,
  },
  {
    key: "tom",
    kind: "advice",
    title: "Total beginner: what I wish I knew a month ago",
    body: `I started with two pots of basil and a trough of rocket a month ago. Things nobody told me: water in the morning not at night, pinch basil from the top and it doubles, and rocket goes from seed to salad in five weeks with zero skill required.

Also: ask the person you got the plant from. Priya has corrected my curry leaf watering twice over the fence and it is doing better than anything else I own.`,
  },
];

async function main() {
  // Wipe in dependency order
  await prisma.message.deleteMany();
  await prisma.post.deleteMany();
  await prisma.growLog.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.story.deleteMany();
  await prisma.gardenPlant.deleteMany();
  await prisma.plant.deleteMany();
  await prisma.user.deleteMany();

  const plantIds: Record<string, string> = {};
  for (const p of plants) {
    const created = await prisma.plant.create({
      data: {
        commonName: p.commonName,
        botanicalName: p.botanicalName,
        origin: p.origin,
        category: p.category,
        sunlight: p.sunlight,
        water: p.water,
        season: p.season,
        daysToHarvest: p.daysToHarvest,
        description: p.description,
        imageUrl: p.imageUrl,
      },
    });
    plantIds[p.key] = created.id;
  }

  const userIds: Record<string, string> = {};
  const userHeritage: Record<string, string> = {};
  for (const g of gardeners) {
    const created = await prisma.user.create({
      data: {
        id:
          g.key === "tom"
            ? "user-tom"
            : g.key === "priya"
              ? "user-priya"
              : g.key === "giuseppe"
                ? "user-giuseppe"
                : undefined,
        name: g.name,
        heritage: g.heritage,
        suburb: g.suburb,
        lat: g.lat,
        lng: g.lng,
        bio: g.bio,
        avatarSeed: g.avatarSeed,
      },
    });
    userIds[g.key] = created.id;
    userHeritage[g.key] = g.heritage;
  }

  let gardenPlantCount = 0;
  for (const [gardenerKey, assignments] of Object.entries(gardenAssignments)) {
    for (const [plantKey, quantity, notes] of assignments) {
      await prisma.gardenPlant.create({
        data: {
          userId: userIds[gardenerKey],
          plantId: plantIds[plantKey],
          quantity,
          notes: notes ?? null,
        },
      });
      gardenPlantCount++;
    }
  }

  for (const s of stories) {
    await prisma.story.create({
      data: {
        userId: userIds[s.gardenerKey],
        plantId: plantIds[s.plantKey],
        title: s.title,
        body: s.body,
        origin: s.origin,
      },
    });
  }

  for (const [gardenerKey, plantKey, type, category, title, quantity, price, swapFor, claimed] of listingSeeds) {
    await prisma.listing.create({
      data: {
        userId: userIds[gardenerKey],
        plantId: plantKey ? plantIds[plantKey] : null,
        type,
        category,
        title,
        culture: userHeritage[gardenerKey],
        address: addresses[gardenerKey],
        quantity,
        price: price ?? null,
        swapFor: swapFor ?? null,
        claimed: claimed ?? false,
      },
    });
  }

  for (const [follower, following] of followPairs) {
    await prisma.follow.create({
      data: {
        followerId: userIds[follower],
        followingId: userIds[following],
      },
    });
  }

  for (const [plantKey, day, note] of tomGrowLogs) {
    await prisma.growLog.create({
      data: {
        userId: userIds["tom"],
        plantId: plantIds[plantKey],
        day,
        note,
      },
    });
  }

  // Space message timestamps a few minutes apart so threads read naturally.
  const base = Date.now() - 1000 * 60 * 60 * 24 * 3;
  for (let i = 0; i < messageSeeds.length; i++) {
    const [fromKey, toKey, body] = messageSeeds[i];
    await prisma.message.create({
      data: {
        fromId: userIds[fromKey],
        toId: userIds[toKey],
        body,
        createdAt: new Date(base + i * 1000 * 60 * 47),
      },
    });
  }

  for (let i = 0; i < postSeeds.length; i++) {
    const p = postSeeds[i];
    await prisma.post.create({
      data: {
        userId: userIds[p.key],
        kind: p.kind,
        title: p.title,
        body: p.body,
        culture: p.culture ?? null,
        createdAt: new Date(base + i * 1000 * 60 * 60 * 7),
      },
    });
  }

  console.log(
    `Seeded ${plants.length} plants, ${gardeners.length} gardeners, ${gardenPlantCount} garden plants, ${stories.length} stories, ${listingSeeds.length} listings, ${followPairs.length} follows, ${tomGrowLogs.length} grow logs, ${messageSeeds.length} messages, ${postSeeds.length} posts.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
