import Link from "next/link";
import { type ComponentPropsWithoutRef } from "react";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-[15px] font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:bg-ink/85",
  secondary:
    "border border-ink bg-transparent text-ink hover:bg-ink hover:text-paper",
  ghost: "px-1 py-1 text-green hover:underline underline-offset-4",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentPropsWithoutRef<"button"> & { variant?: Variant }) {
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentPropsWithoutRef<typeof Link> & { variant?: Variant }) {
  return (
    <Link className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}
