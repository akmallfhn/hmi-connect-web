import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getInstitutions } from "@/apis/institutions";
import { searchProvinces } from "@/apis/locations";
import { getSession } from "@/apis/session";
import { getTrainingDetail } from "@/apis/trainings";
import {
  getUserByUsername,
  listEducationHistories,
  listTrainingHistories,
} from "@/apis/users";
import TrainingRegistrationPage from "@/components/pages/TrainingRegistrationPage";

export const metadata: Metadata = {
  title: "Pendaftaran Training",
  description: "Formulir pendaftaran training HMI.",
  robots: { index: false, follow: false },
};

interface TrainingRegistrationRouteProps {
  params: Promise<{ training_id: string }>;
}

export default async function TrainingRegistrationRoute({
  params,
}: TrainingRegistrationRouteProps) {
  const { training_id } = await params;
  const { sessionToken, user } = await getSession();

  if (!sessionToken || !user?.id) {
    redirect(
      `/auth/login?redirectTo=${encodeURIComponent(
        `/trainings/${training_id}/register`
      )}`
    );
  }

  const [
    training,
    profile,
    trainingHistoryResult,
    educationHistoryResult,
    institutions,
    provinceResult,
  ] = await Promise.all([
    getTrainingDetail(training_id),
    getUserByUsername(user.username, sessionToken),
    listTrainingHistories(user.username, { pageSize: 100 }),
    listEducationHistories(user.username, { pageSize: 100 }),
    getInstitutions({ pageSize: 20 }),
    searchProvinces({ pageSize: 20 }),
  ]);

  if (!training || !profile) notFound();

  return (
    <TrainingRegistrationPage
      training={training}
      registrant={{
        id: profile.id,
        fullName: profile.full_name,
        ktpFullName: profile.ktp_full_name,
        email: profile.email,
        phoneNumber: profile.phone_number,
        branchName: profile.branch_name,
        hasNik: profile.has_nik ?? false,
        dateOfBirth: profile.date_of_birth,
        gender: profile.gender,
        addressStreet: profile.address_street,
        districtId: profile.district_id,
        districtName: profile.district_name,
        cityId: profile.city_id,
        cityName: profile.city_name,
        provinceId: profile.province_id,
        provinceName: profile.province_name,
      }}
      educationHistories={educationHistoryResult.list}
      institutions={institutions}
      provinces={provinceResult.list}
      trainingHistories={trainingHistoryResult.list}
      viewer={{
        fullName: profile.full_name,
        avatar: profile.avatar,
        userId: profile.id,
        username: profile.username,
        branchName: profile.branch_name,
        verificationStatus: profile.verification_status,
      }}
    />
  );
}
