import { type ComponentPropsWithoutRef } from "react";

export function Card({
  className = "",
  hover = false,
  ...props
}: ComponentPropsWithoutRef<"div"> & { hover?: boolean }) {
  return (
    <div
      className={`bg-fill border border-line rounded-lg p-5 sm:p-6 ${
        hover ? "transition-all duration-200 hover:border-green hover:shadow-md hover:bg-green-soft/30" : ""
      } ${className}`}
      {...props}
    />
  );
}
