// Letterform tile giving each plant a consistent visual identity:
// the plant's initial in Source Serif on a fill background with a
// category dot in the corner. No emoji, no stock photos.

const sizes = {
  sm: "h-10 w-10 text-lg",
  md: "h-14 w-14 text-2xl",
  lg: "h-20 w-20 text-3xl",
};

export function PlantTile({
  name,
  size = "md",
}: {
  name: string;
  size?: keyof typeof sizes;
}) {
  return (
    <div
      aria-hidden
      className={`relative flex shrink-0 items-center justify-center rounded-lg border border-line bg-fill font-[family-name:var(--font-display)] font-semibold text-ink transition-all duration-200 ${sizes[size]}`}
    >
      {name.charAt(0)}
      <span className="absolute right-1.5 bottom-1.5 h-2 w-2 rounded-full bg-green shadow-sm" />
    </div>
  );
}
