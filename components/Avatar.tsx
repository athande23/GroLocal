/* eslint-disable @next/next/no-img-element */
const sizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
};

export function Avatar({
  seed,
  name,
  size = "md",
  src,
  className = "",
}: {
  seed: string;
  name: string;
  size?: keyof typeof sizes;
  src?: string | null;
  className?: string;
}) {
  return (
    <img
      src={
        src ||
        `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}`
      }
      alt={`Avatar of ${name}`}
      className={`${sizes[size]} shrink-0 rounded-full border border-line bg-fill object-cover ${className}`}
    />
  );
}
