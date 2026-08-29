import { redirect } from "next/navigation";

export default async function MapRedirect({
  searchParams,
}: {
  searchParams: Promise<{ plant?: string; heritage?: string }>;
}) {
  const params = await searchParams;
  const q = new URLSearchParams();
  if (params.plant) q.set("q", params.plant);
  if (params.heritage) q.set("culture", params.heritage);
  redirect(`/market${q.size ? `?${q}` : ""}`);
}
