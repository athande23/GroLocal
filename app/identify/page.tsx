import type { Metadata } from "next";
import IdentifyTool from "@/components/IdentifyTool";

export const metadata: Metadata = {
  title: "Identify a plant",
  description:
    "Upload a photo to identify a plant, learn its cultural context, and find neighbours growing it.",
};

export default function IdentifyPage() {
  return (
    <div className="mx-auto max-w-[1080px] px-5 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-[36px] font-semibold leading-[44px] text-ink">
        What is this plant?
      </h1>
      <p className="mt-2 max-w-[640px] text-[15px] text-graphite">
        Upload a photo of a plant from a garden, a footpath or a market. We
        will identify it, explain where it comes from and how it is used, and
        show you the neighbours already growing it.
      </p>
      <IdentifyTool />
    </div>
  );
}
