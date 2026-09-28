import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/apis/session";
import TrainingCreatePage, {
  type TrainingOrganizerChoice,
} from "@/components/pages/TrainingCreatePage";
import PageState from "@/components/states/PageState";
import { ADMIN_ENTITY_ORDER, manageGrants } from "@/lib/access";
import {
  formatEntityAuthorName,
  stripEntityNamePrefix,
} from "@/lib/feed-author";
import type { TrainingOrganizerTypeEnum } from "@/lib/types";

export const metadata: Metadata = {
  title: "Buat Event",
  description: "Buat agenda Latihan Kader HMI.",
  robots: { index: false, follow: false },
};

const ORGANIZER_TYPES: TrainingOrganizerTypeEnum[] = [
  "organization",
  "coordinating_body",
  "branch",
  "chapter",
];

function isOrganizerType(value: string): value is TrainingOrganizerTypeEnum {
  return (ORGANIZER_TYPES as string[]).includes(value);
}

export default async function TrainingCreateRoute() {
  const { user } = await getSession();

  // /trainings is allowlisted in next.config.mts, so this route owns its own login bounce with redirectTo.
  if (!user?.id) {
    redirect(`/auth/login?redirectTo=${encodeURIComponent("/trainings/create")}`);
  }
  if (user.status === "pending") redirect("/activation");
  if (user.verification_status === "unverified") redirect("/verification");
  if (user.verification_status !== "verified") {
    return (
      <PageState
        variant="forbidden"
        backHref="/trainings"
        message="Akunmu sedang ditinjau admin. Kamu bisa membuat event setelah verifikasi disetujui."
      />
    );
  }

  // A Korkom never organizes training, so its grants can't be offered as an organizer.
  const organizers: TrainingOrganizerChoice[] = manageGrants(user)
    .filter((grant) => isOrganizerType(grant.entity_type) && grant.entity_name)
    .sort(
      (a, b) =>
        ADMIN_ENTITY_ORDER.indexOf(a.entity_type) -
        ADMIN_ENTITY_ORDER.indexOf(b.entity_type)
    )
    .map((grant) => ({
      type: grant.entity_type as TrainingOrganizerTypeEnum,
      id: grant.entity_id,
      name: stripEntityNamePrefix(grant.entity_type, grant.entity_name ?? ""),
      label: formatEntityAuthorName(grant.entity_type, grant.entity_name ?? ""),
    }));

  return (
    <TrainingCreatePage
      viewer={{
        fullName: user.full_name,
        avatar: user.avatar,
        userId: user.id,
        username: user.username,
        branchName: user.branch_name,
        verificationStatus: user.verification_status,
      }}
      organizers={organizers}
    />
  );
}
