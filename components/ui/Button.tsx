import Link from "next/link";
import { type ComponentPropsWithoutRef } from "react";

type Variant = "primary" | "secondary" | "ghost";

const base =
"inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-base font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2";

const variants: Record<Variant, string> = {
primary: "bg-green text-white hover:bg-green/90 active:bg-green/95 shadow-sm hover:shadow-md",
secondary:
"border border-ink bg-transparent text-ink hover:bg-ink hover:text-paper active:bg-ink/90 focus:ring-ink",
ghost: "px-1 py-1 text-green hover:underline underline-offset-4 hover:text-green/80",
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
<Link
className={`${base} ${variants[variant]} ${className}`}
{...props}
/>
);
}
