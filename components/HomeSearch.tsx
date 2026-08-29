"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export default function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/market${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`);
  }

  return (
    <form onSubmit={submit} role="search" className="flex w-full max-w-[560px] gap-2">
      <label className="relative flex flex-1 items-center">
        <Search
          size={18}
          strokeWidth={1.5}
          className="pointer-events-none absolute left-3.5 text-graphite"
        />
        <span className="sr-only">Search for a product</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for tomatoes, curry leaves, tools…"
          className="w-full rounded-md border border-line bg-paper py-2.5 pl-10 pr-3 text-[15px] placeholder:text-graphite focus:border-green focus:outline-none focus:ring-2 focus:ring-green-soft"
        />
      </label>
      <button
        type="submit"
        className="rounded-md bg-ink px-4 py-2.5 text-[15px] font-medium text-paper transition-colors duration-150 hover:bg-ink/85"
      >
        Search
      </button>
    </form>
  );
}
