import type { Metadata } from "next";
import { SpecialBodyProfile } from "@/components/pages/SpecialBodyProfile";
import { specialBodyProfileMetadata } from "@/lib/special-body-profile";

interface BplProfileRouteProps {
  params: Promise<{ mention_name: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: BplProfileRouteProps): Promise<Metadata> {
  const { mention_name } = await params;
  return specialBodyProfileMetadata("bpl", mention_name);
}

export default async function BplProfile({
  params,
  searchParams,
}: BplProfileRouteProps) {
  const [{ mention_name }, query] = await Promise.all([params, searchParams]);
  return (
    <SpecialBodyProfile type="bpl" segment={mention_name} searchParams={query ?? {}} />
  );
}
