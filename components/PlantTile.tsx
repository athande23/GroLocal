// Letterform tile giving each plant a consistent visual identity:
// the plant's initial in Source Serif on a fill background with a
// category dot in the corner. No emoji, no stock photos.

const sizes = {
  sm: "h-10 w-10 text-[18px]",
  md: "h-14 w-14 text-[24px]",
  lg: "h-20 w-20 text-[34px]",
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
      className={`relative flex shrink-0 items-center justify-center rounded-lg border border-line bg-fill font-[family-name:var(--font-display)] font-semibold text-ink ${sizes[size]}`}
    >
      {name.charAt(0)}
      <span className="absolute right-1 bottom-1 h-1.5 w-1.5 rounded-full bg-green" />
    </div>
  );
}
