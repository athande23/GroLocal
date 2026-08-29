"use client";

/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
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
];

const cultureCategories = [
"vegetable",
"herb",
"fruit",
"legume",
"flower",
];

export default function UploadListing({
defaultAddress,
}: {
defaultAddress: string;
}) {
const router = useRouter();
const [open, setOpen] = useState(false);
const [busy, setBusy] = useState(false);
const [error, setError] = useState("");

const [title, setTitle] = useState("");
const [category, setCategory] = useState("vegetable");
const [culture, setCulture] = useState("");
const [address, setAddress] = useState(defaultAddress);
const [price, setPrice] = useState("");
const [quantity, setQuantity] = useState("");
const [imageData, setImageData] = useState<string | null>(null);

const fileRef = useRef<HTMLInputElement>(null);

const showCulture = cultureCategories.includes(category);

function readImage(file: File) {
if (!file.type.startsWith("image/")) return;

const reader = new FileReader();

reader.onload = () => {
  setImageData(reader.result as string);
};

reader.readAsDataURL(file);

}

async function submit(e: React.FormEvent) {
e.preventDefault();

if (busy) return;

setBusy(true);
setError("");

try {
  const res = await fetch("/api/listing", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      category,
      culture: showCulture ? culture : "",
      address,
      price: price || null,
      quantity,
      imageData,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    setError(data.error ?? "Something went wrong");
    return;
  }

  setOpen(false);

  router.push(
    `/market?q=${encodeURIComponent(title.trim())}`
  );

  router.refresh();
} finally {
  setBusy(false);
}

}

return (
<>
<Button
variant="primary"
onClick={() => setOpen(true)}
className="bg-green text-paper hover/85"
>
<Upload size={16} strokeWidth={1.5} />
Upload Item
</Button>

  <Modal
    open={open}
    onClose={() => setOpen(false)}
    title="Upload Item"
  >
    <form onSubmit={submit} className="space-y-4">
      {/* Name */}
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

      {/* Photo */}
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

      {/* Type + Culture */}
      <div
        className={
          showCulture
            ? "grid grid-cols-2 gap-3"
            : ""
        }
      >
        <label className="block">
          <span className="text-[13px] font-medium text-graphite">
            Type
          </span>

          <select
            value={category}
            onChange={(e) => {
              const newCategory = e.target.value;

              setCategory(newCategory);

              if (!cultureCategories.includes(newCategory)) {
                setCulture("");
              }
            }}
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-[15px] focus:border-green focus:outline-none focus:ring-2 focus:ring-green-soft"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </label>

        {showCulture && (
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
        )}
      </div>

      {/* Pickup Address */}
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

      {/* Price + Quantity */}
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-[13px] font-medium text-graphite">
            Price (leave empty to give away)
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
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g. 2 bags"
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-[15px] placeholder:text-graphite focus:border-green focus:outline-none focus:ring-2 focus:ring-green-soft"
          />
        </label>
      </div>

      {/* Error */}
      {error && (
        <p className="text-[13px] text-ink">
          {error}
        </p>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={busy}
        className="w-full justify-center bg-green text-paper hover:bg-green/85"
      >
        {busy ? "Uploading…" : "Upload Item"}
      </Button>
    </form>
  </Modal>
</>

);
}