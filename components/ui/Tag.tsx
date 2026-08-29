// Dot-and-label tags per the design system: a filled green dot for GIVE,
// a hollow ringed dot for SWAP, a bare price for SELL, soft fill for heritage.

export function ListingTag({
  type,
  price,
}: {
  type: string;
  price?: number | null;
}) {
  if (type === "SELL") {
    return (
      <span className="text-sm font-medium text-ink">
        {price != null ? `$${price % 1 === 0 ? price : price.toFixed(2)}` : "For sale"}
      </span>
    );
  }
  if (type === "SWAP") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-graphite">
        <span
          aria-hidden
          className="h-2 w-2 rounded-full border-2 border-green bg-transparent"
        />
        Swap
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-graphite">
      <span aria-hidden className="h-2 w-2 rounded-full bg-green" />
      Free
    </span>
  );
}

export function HeritageTag({ heritage }: { heritage: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-green-soft px-3 py-1 text-sm font-medium text-green transition-all duration-200">
      {heritage}
    </span>
  );
}

export function CategoryTag({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-graphite capitalize">
      <span aria-hidden className="h-2 w-2 rounded-full bg-green" />
      {category}
    </span>
  );
}
