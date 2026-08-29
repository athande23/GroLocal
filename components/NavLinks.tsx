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
      <nav aria-label="Main" className="hidden items-center gap-6 sm:gap-8 lg:flex">
        {links.map((l) => {
          const active =
            pathname === l.href || pathname.startsWith(l.href + "/");

          return (
            <Link
              key={l.href}
              href={l.href}
              className={`text-base transition-all duration-200 ${
                active
                  ? "font-medium text-green border-b-2 border-green pb-1"
                  : "text-graphite hover:text-ink hover:border-b-2 hover:border-line pb-1"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        className="rounded-md p-2 text-graphite transition-all duration-200 hover:text-ink hover:bg-fill focus:outline-none focus-visible:ring-2 focus-visible:ring-green lg:hidden"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <X size={20} strokeWidth={1.5} />
        ) : (
          <Menu size={20} strokeWidth={1.5} />
        )}
      </button>

      {open && (
        <nav
          aria-label="Main mobile"
          className="absolute inset-x-0 top-14 sm:top-16 z-[1001] border-b border-line bg-paper px-4 sm:px-6 py-3 lg:hidden shadow-md"
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
                    className={`block rounded-md px-3 py-2.5 text-base transition-all duration-200 ${
                      active
                        ? "bg-green-soft font-medium text-green"
                        : "text-ink hover:bg-fill hover:text-green"
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