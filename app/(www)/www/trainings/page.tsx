import type { Metadata } from "next";
import { getSession } from "@/apis/session";
import { listTrainings } from "@/apis/trainings";
import { getUserByUsername } from "@/apis/users";
import TrainingCatalogPage from "@/components/pages/TrainingCatalogPage";
import type { TrainingStatusEnum } from "@/lib/types";

export const metadata: Metadata = {
  title: "Training Center",
  description: "Daftar agenda Latihan Kader HMI dari berbagai penyelenggara.",
  alternates: { canonical: "/trainings" },
  openGraph: {
    title: "Training Center | HMI Connect",
    description: "Daftar agenda Latihan Kader HMI dari berbagai penyelenggara.",
    url: "/trainings",
  },
};

interface TrainingsRouteProps {
  searchParams: Promise<{
    search?: string;
    level?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 12;

function parseLevel(value?: string): TrainingStatusEnum | undefined {
  if (value === "LK1" || value === "LK2" || value === "LK3" || value === "SC" || value === "LKK" || value === "LKSG") return value;
  return undefined;
}

export default async function TrainingsRoute({
  searchParams,
}: TrainingsRouteProps) {
  const query = await searchParams;
  const search = query.search?.trim() ?? "";
  const level = parseLevel(query.level);
  const page = Math.max(1, Number(query.page ?? "1") || 1);

  const [result, { user }, akmal, anida] = await Promise.all([
    listTrainings({
      search: search || undefined,
      level,
      page,
      pageSize: PAGE_SIZE,
    }),
    getSession(),
    getUserByUsername("akmallfhn"),
    getUserByUsername("anida"),
  ]);

  return (
    <TrainingCatalogPage
      viewer={{
        fullName: user?.full_name,
        avatar: user?.avatar,
        userId: user?.id,
        username: user?.username,
        branchName: user?.branch_name,
        verificationStatus: user?.verification_status,
      }}
      result={result}
      initialSearch={search}
      initialLevel={level}
      guideContacts={{ akmal, anida }}
      canChatWithGuideContacts={Boolean(user && user.status !== "pending")}
    />
  );
}
