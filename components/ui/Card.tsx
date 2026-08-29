import { type ComponentPropsWithoutRef } from "react";

export function Card({
  className = "",
  hover = false,
  ...props
}: ComponentPropsWithoutRef<"div"> & { hover?: boolean }) {
  return (
    <div
      className={`bg-fill border border-line rounded-lg p-5 ${
        hover ? "transition-colors duration-150 hover:border-green" : ""
      } ${className}`}
      {...props}
    />
  );
}
