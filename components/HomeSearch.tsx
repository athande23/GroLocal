"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export default function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();

    router.push(
      `/market${
        query.trim()
          ? `?q=${encodeURIComponent(query.trim())}`
          : ""
      }`
    );
  }

  return (
    <form
      onSubmit={submit}
      role="search"
      className="mx-auto flex w-full max-w-[1050px] items-center gap-4"
    >
      <label className="relative flex flex-1 items-center">
        <Search
          size={26}
          strokeWidth={1.5}
          className="pointer-events-none absolute left-6 text-graphite"
        />

        <span className="sr-only">Search for a product</span>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for tomatoes, curry leaves, tools…"
          className="h-[72px] w-full rounded-xl border border-line bg-paper pl-16 pr-6 text-[19px] placeholder:text-graphite focus:border-green focus:outline-none focus:ring-4 focus:ring-green-soft"
        />
      </label>

      <button
        type="submit"
        className="h-[72px] rounded-xl bg-ink px-9 text-[18px] font-medium text-paper transition-colors duration-150 hover:bg-ink/85"
      >
        Search
      </button>
    </form>
  );
}