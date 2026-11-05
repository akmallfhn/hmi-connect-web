import type { Metadata } from "next";
import { SpecialBodyProfile } from "@/components/pages/SpecialBodyProfile";
import { specialBodyProfileMetadata } from "@/lib/special-body-profile";

interface KohatiProfileRouteProps {
  params: Promise<{ mention_name: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: KohatiProfileRouteProps): Promise<Metadata> {
  const { mention_name } = await params;
  return specialBodyProfileMetadata("kohati", mention_name);
}

export default async function KohatiProfile({
  params,
  searchParams,
}: KohatiProfileRouteProps) {
  const [{ mention_name }, query] = await Promise.all([params, searchParams]);
  return (
    <SpecialBodyProfile type="kohati" segment={mention_name} searchParams={query ?? {}} />
  );
}
