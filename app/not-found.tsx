import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[1080px] px-5 py-24 text-center">
      <p className="font-[family-name:var(--font-display)] text-[36px] font-semibold text-ink">
        Nothing growing here
      </p>
      <p className="mx-auto mt-3 max-w-[420px] text-[15px] text-graphite">
        This page does not exist, or it has been dug up and moved. The map is
        the best place to start again.
      </p>
      <Link
        href="/map"
        className="mt-7 inline-block rounded-md bg-ink px-4 py-2.5 text-[15px] font-medium text-paper transition-colors duration-150 hover:bg-ink/85"
      >
        Open the map
      </Link>
    </div>
  );
}
