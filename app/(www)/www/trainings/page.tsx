import type { Metadata } from "next";
import { getSession } from "@/apis/session";
import { listTrainings } from "@/apis/trainings";
import TrainingCatalogPage from "@/components/pages/TrainingCatalogPage";
import type {
  TrainingOrganizerTypeEnum,
  TrainingStatusEnum,
} from "@/lib/types";

export const metadata: Metadata = {
  title: "Training HMI",
  description: "Daftar agenda Latihan Kader HMI dari berbagai penyelenggara.",
  alternates: { canonical: "/trainings" },
  openGraph: {
    title: "Training HMI | HMI Connect",
    description: "Daftar agenda Latihan Kader HMI dari berbagai penyelenggara.",
    url: "/trainings",
  },
};

interface TrainingsRouteProps {
  searchParams: Promise<{
    search?: string;
    level?: string;
    organizer_type?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 12;

function parseLevel(value?: string): TrainingStatusEnum | undefined {
  if (value === "LK1" || value === "LK2" || value === "LK3") return value;
  return undefined;
}

function parseOrganizerType(
  value?: string
): TrainingOrganizerTypeEnum | undefined {
  if (
    value === "chapter" ||
    value === "branch" ||
    value === "coordinating_body" ||
    value === "organization"
  ) {
    return value;
  }
  return undefined;
}

export default async function TrainingsRoute({
  searchParams,
}: TrainingsRouteProps) {
  const query = await searchParams;
  const search = query.search?.trim() ?? "";
  const level = parseLevel(query.level);
  const organizerType = parseOrganizerType(query.organizer_type);
  const page = Math.max(1, Number(query.page ?? "1") || 1);

  const [result, { user }] = await Promise.all([
    listTrainings({
      search: search || undefined,
      level,
      organizerType,
      page,
      pageSize: PAGE_SIZE,
    }),
    getSession(),
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
      initialOrganizerType={organizerType}
      pageSize={PAGE_SIZE}
    />
  );
}
