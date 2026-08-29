"use client";

/* eslint-disable @next/next/no-img-element */
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type SwitchableUser = {
  id: string;
  name: string;
  suburb: string;
  avatarSeed: string;
  avatarData: string | null;
};

function avatarUrl(u: SwitchableUser) {
  return u.avatarData ?? `https://api.dicebear.com/7.x/notionists/svg?seed=${u.avatarSeed}`;
}

export default function UserSwitcher({
  users,
  currentUserId,
}: {
  users: SwitchableUser[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const current = users.find((u) => u.id === currentUserId) ?? users[0];

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  function switchTo(id: string) {
    document.cookie = `grolocal-user=${id}; path=/; max-age=31536000`;
    setOpen(false);
    router.refresh();
  }

  if (!current) return null;

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Current user: ${current.name}. Switch user.`}
        className="flex items-center gap-2 rounded-md border border-line bg-fill py-1.5 pr-2 pl-1.5 transition-colors duration-150 hover:border-green"
      >
        <img
          src={avatarUrl(current)}
          alt=""
          className="h-6 w-6 rounded-full bg-paper object-cover"
        />
        <span className="hidden text-[13px] font-medium text-ink sm:block">
          {current.name.split(" ")[0]}
        </span>
        <ChevronDown size={16} strokeWidth={1.5} className="text-graphite" />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Switch user"
          className="absolute right-0 top-full z-[1001] mt-1 w-56 rounded-lg border border-line bg-paper py-1"
        >
          {users.map((u) => (
            <li key={u.id} role="option" aria-selected={u.id === currentUserId}>
              <button
                onClick={() => switchTo(u.id)}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors duration-150 hover:bg-fill ${
                  u.id === currentUserId ? "bg-green-soft" : ""
                }`}
              >
                <img
                  src={avatarUrl(u)}
                  alt=""
                  className="h-7 w-7 rounded-full border border-line bg-fill object-cover"
                />
                <span className="min-w-0">
                  <span className="block truncate text-[15px] text-ink">
                    {u.name}
                  </span>
                  <span className="block text-[13px] text-graphite">
                    {u.suburb}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
