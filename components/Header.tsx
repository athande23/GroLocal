import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/session";
import NavLinks from "./NavLinks";

export default async function Header() {
  const currentUserId = await getCurrentUserId();

  const user = await db.user.findUnique({
    where: { id: currentUserId },
    select: {
      id: true,
      name: true,
      avatarData: true,
    },
  });

  return (
    <header className="sticky top-0 z-[1000] border-b border-line bg-paper">
      <div className="mx-auto flex h-14 max-w-[1080px] items-center justify-between gap-4 px-5">
        <div className="flex min-w-0 items-center gap-8">
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-[20px] font-semibold text-ink"
          >
            GroLocal
          </Link>

          <NavLinks />
        </div>

        <Link
          href="/profile"
          className="flex shrink-0 items-center gap-2 rounded-md border border-line bg-fill px-3 py-1.5 text-[14px] font-medium text-ink transition-colors duration-150 hover:border-green hover:bg-green-soft"
        >
          <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-paper text-[12px] font-semibold text-green">
            {user?.avatarData ? (
              <img
                src={user.avatarData}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              user?.name?.charAt(0).toUpperCase() ?? "T"
            )}
          </span>

          <span>Profile</span>
        </Link>
      </div>
    </header>
  );
}