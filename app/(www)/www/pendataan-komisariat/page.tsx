import type { Metadata } from "next";
import { listPublicBranches } from "@/apis/branches";
import { listPublicCoordinatingBodies } from "@/apis/coordinating-bodies";
import ChapterCensusPage from "@/components/pages/ChapterCensusPage";

export const metadata: Metadata = {
  title: "Pendataan Komisariat",
  description: "Formulir pendataan Komisariat HMI per Cabang.",
  robots: { index: false, follow: false },
};

// Public form: reads Badko and Cabang with the client secret, so no session is needed.
export default async function ChapterCensusRoute() {
  const [coordinatingBodies, branches] = await Promise.all([
    listPublicCoordinatingBodies(),
    listPublicBranches(),
  ]);

  return (
    <ChapterCensusPage
      coordinatingBodies={coordinatingBodies}
      branches={branches}
    />
  );
}
