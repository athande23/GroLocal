import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUserId, SWITCHABLE_USER_IDS } from "@/lib/session";
import UserSwitcher from "./UserSwitcher";
import NavLinks from "./NavLinks";

export default async function Header() {
  const currentUserId = await getCurrentUserId();
  const users = await db.user.findMany({
    where: { id: { in: SWITCHABLE_USER_IDS } },
    select: { id: true, name: true, suburb: true, avatarSeed: true, avatarData: true },
  });
  const ordered = SWITCHABLE_USER_IDS.map((id) =>
    users.find((u) => u.id === id)
  ).filter((u): u is NonNullable<typeof u> => Boolean(u));

  return (
    <header className="sticky top-0 z-[1000] border-b border-line bg-paper">
      <div className="mx-auto flex h-14 max-w-[1080px] items-center justify-between gap-4 px-5">
        <div className="flex items-center gap-8 min-w-0">
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-[20px] font-semibold text-ink"
          >
            GroLocal
          </Link>
          <NavLinks />
        </div>
        <UserSwitcher users={ordered} currentUserId={currentUserId} />
      </div>
    </header>
  );
}
