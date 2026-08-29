"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/market", label: "Market" },
  { href: "/messages", label: "Messages" },
  { href: "/discussions", label: "Discussions" },
];

export default function NavLinks() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav aria-label="Main" className="hidden items-center gap-5 md:flex">
        {links.map((l) => {
          const active =
            pathname === l.href || pathname.startsWith(l.href + "/");

          return (
            <Link
              key={l.href}
              href={l.href}
              className={`text-[15px] transition-colors duration-150 ${
                active
                  ? "font-medium text-green"
                  : "text-graphite hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        className="rounded-md p-1.5 text-graphite transition-colors duration-150 hover:text-ink md:hidden"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <X size={18} strokeWidth={1.5} />
        ) : (
          <Menu size={18} strokeWidth={1.5} />
        )}
      </button>

      {open && (
        <nav
          aria-label="Main mobile"
          className="absolute inset-x-0 top-14 z-[1001] border-b border-line bg-paper px-5 py-3 md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {links.map((l) => {
              const active =
                pathname === l.href || pathname.startsWith(l.href + "/");

              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-md px-2 py-2 text-[15px] transition-colors duration-150 ${
                      active
                        ? "bg-green-soft font-medium text-green"
                        : "text-ink hover:bg-fill"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </>
  );
}