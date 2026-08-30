"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUp, Upload } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

const categories = [
  "vegetable",
  "herb",
  "fruit",
  "legume",
  "flower",
  "tool",
  "other",
] as const;

type UploadListingProps = {
  defaultAddress: string;
};

type ListingResponse = {
  error?: string;
  ok?: boolean;
};

export default function UploadListing({
  defaultAddress,
}: UploadListingProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [title, setTitle] = useState<string>("");
  const [category, setCategory] =
    useState<(typeof categories)[number]>("vegetable");
  const [culture, setCulture] = useState<string>("");
  const [address, setAddress] = useState<string>(defaultAddress);
  const [price, setPrice] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [imageData, setImageData] = useState<string | null>(null);

  function readImage(file: File): void {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    setError("");

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageData(reader.result);
      }
    };

    reader.onerror = () => {
      setError("Could not read the image.");
    };

    reader.readAsDataURL(file);
  }

  async function submit(
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    e.preventDefault();

    if (busy) {
      return;
    }

    setBusy(true);
    setError("");

    const searchTitle = title.trim();

    try {
      const response = await fetch("/api/listing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: searchTitle,
          category,
          culture: culture.trim(),
          address: address.trim(),
          price: price ? Number(price) : null,
          quantity: quantity.trim(),
          imageData,
        }),
      });

      const data: ListingResponse = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setOpen(false);

      setTitle("");
      setCulture("");
      setPrice("");
      setQuantity("");
      setImageData(null);

      router.push(
        `/market?q=${encodeURIComponent(searchTitle)}`
      );

      router.refresh();
    } catch {
      setError(
        "Could not upload the item. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        variant="primary"
        onClick={() => setOpen(true)}
        className="px-8 py-4 text-[17px] font-semibold"
      >
        <Upload size={20} strokeWidth={1.8} />
        Upload Item
      </Button>

      <Modal
        open={open}
        onClose={() => {
          if (!busy) {
            setOpen(false);
          }
        }}
        title="Upload Item"
      >
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-[13px] font-medium text-graphite">
              Name
            </span>

            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lemongrass stalks, ready to root"
              className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-[15px] placeholder:text-graphite focus:border-green focus:outline-none focus:ring-2 focus:ring-green-soft"
            />
          </label>

          <div>
            <span className="text-[13px] font-medium text-graphite">
              Photo
            </span>

            <div className="mt-1 flex items-center gap-3">
              {imageData ? (
                <img
                  src={imageData}
                  alt="Preview of the product photo"
                  className="h-16 w-16 rounded-lg border border-line object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-line bg-fill">
                  <ImageUp
                    size={18}
                    strokeWidth={1.5}
                    className="text-graphite"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-md border border-ink px-3 py-1.5 text-[13px] font-medium text-ink transition-colors duration-150 hover:bg-ink hover:text-paper"
              >
                {imageData ? "Change photo" : "Add a photo"}
              </button>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                aria-label="Upload a product photo"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (file) {
                    readImage(file);
                  }
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[13px] font-medium text-graphite">
                Type
              </span>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value as (typeof categories)[number]
                  )
                }
                className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-[15px] focus:border-green focus:outline-none focus:ring-2 focus:ring-green-soft"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-[13px] font-medium text-graphite">
                Culture it comes from
              </span>

              <input
                required
                value={culture}
                onChange={(e) => setCulture(e.target.value)}
                placeholder="e.g. Vietnamese"
                className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-[15px] placeholder:text-graphite focus:border-green focus:outline-none focus:ring-2 focus:ring-green-soft"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-[13px] font-medium text-graphite">
              Pickup address
            </span>

            <input
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 8 Enid Ave, Granville"
              className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-[15px] placeholder:text-graphite focus:border-green focus:outline-none focus:ring-2 focus:ring-green-soft"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[13px] font-medium text-graphite">
                Price
              </span>

              <input
                type="number"
                min="0"
                step="0.5"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="$"
                className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-[15px] placeholder:text-graphite focus:border-green focus:outline-none focus:ring-2 focus:ring-green-soft"
              />
            </label>

            <label className="block">
              <span className="text-[13px] font-medium text-graphite">
                Quantity
              </span>

              <input
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 2 bags"
                className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-[15px] placeholder:text-graphite focus:border-green focus:outline-none focus:ring-2 focus:ring-green-soft"
              />
            </label>
          </div>

          {error && (
            <p className="text-[13px] text-red-700">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={busy}
            variant="primary"
            className="w-full justify-center py-3 text-[16px]"
          >
            {busy ? "Uploading..." : "Upload Item"}
          </Button>
        </form>
      </Modal>
    </>
  );
}