export type TimelineEntry = {
  id: string;
  day: number;
  note: string;
  plantName: string;
};

export default function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="relative ml-2 border-l border-line pl-6">
      {entries.map((e) => (
        <li key={e.id} className="relative pb-6 last:pb-0">
          <span
            aria-hidden
            className="absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-paper bg-green"
          />
          <p className="text-[13px] font-medium text-graphite">
            Day {e.day} · {e.plantName}
          </p>
          <p className="mt-1 text-[15px] text-ink">{e.note}</p>
        </li>
      ))}
    </ol>
  );
}
