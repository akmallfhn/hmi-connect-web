"use client";

import { Check, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { Institution } from "@/apis/institutions";
import type { SocialMediaPlatform } from "@/apis/social-media-platforms";
import type {
  EducationHistoryEntry,
  OrganizationExperienceEntry,
  ProfileCompletion,
  SocialMediaAccountEntry,
  TrainingHistoryEntry,
  WorkExperienceEntry,
} from "@/apis/users";
import type { ProfileCompletionStageEnum } from "@/lib/types";
import EditEducationForm from "../forms/EditEducationForm";
import EditOrganizationExperienceForm from "../forms/EditOrganizationExperienceForm";
import EditProfileForm from "../forms/EditProfileForm";
import EditTrainingForm from "../forms/EditTrainingForm";
import EditWorkExperienceForm from "../forms/EditWorkExperienceForm";

// Everything the stage forms need — the card opens them itself, since each profile card keeps its own modal state private.
export interface ProfileCompletionForms {
  userId?: string;
  username?: string;
  fullName?: string;
  headline?: string;
  phoneNumber?: string;
  bio?: string;
  institutions: Institution[];
  socialMediaPlatforms: SocialMediaPlatform[];
  socialMediaAccounts: SocialMediaAccountEntry[];
  educationHistories: EducationHistoryEntry[];
  trainingHistories: TrainingHistoryEntry[];
  organizationExperiences: OrganizationExperienceEntry[];
  workExperiences: WorkExperienceEntry[];
}

interface ProfileCompletionCardProps {
  completion: ProfileCompletion;
  forms: ProfileCompletionForms;
  // Mobile hides the stage list behind "Lihat Selengkapnya"; desktop shows all six outright.
  collapsible?: boolean;
}

// The backend's own `description` is English prose it reserves the right to reword, so branch on `name`.
const STAGE_LABEL: Record<ProfileCompletionStageEnum, string> = {
  basic_profile: "Headline & Nomor HP",
  education_histories: "Pendidikan",
  training_histories: "Riwayat Kaderisasi",
  organization_experiences: "Pengalaman Organisasi",
  work_experiences: "Pengalaman Kerja",
  social_media_accounts: "Media Sosial",
};

// Headline, phone and social links are all filled in through the one Edit Profil form.
const STAGE_FORM: Record<ProfileCompletionStageEnum, string> = {
  basic_profile: "profile",
  social_media_accounts: "profile",
  education_histories: "education",
  training_histories: "training",
  organization_experiences: "organization",
  work_experiences: "work",
};

const TRACK_COLOR = "#e2f0ff";
const BAR_COLOR = "#164ea6";
const BAR_SIZE = 10;

export default function ProfileCompletionCard({
  completion,
  forms,
  collapsible = false,
}: ProfileCompletionCardProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [openForm, setOpenForm] = useState<string | null>(null);

  const { completed_stages, total_stages, stages } = completion;
  const percent =
    total_stages > 0 ? Math.round((completed_stages / total_stages) * 100) : 0;
  const showStages = !collapsible || expanded;

  function closeForm() {
    setOpenForm(null);
  }

  function handleSaved() {
    setOpenForm(null);
    router.refresh();
  }

  return (
    <div className="border border-x-0 border-[#e2f0ff] bg-linear-to-br from-[#e2f0ff] to-35% to-white p-5 lg:rounded-2xl lg:border-x lg:shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-[#172033]">Lengkapi Profil</h2>
        <span className="shrink-0 text-sm font-medium text-[#5f6573]">
          {completed_stages}/{total_stages} Selesai
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="h-3 min-w-0 flex-1">
          <ResponsiveContainer width="100%" height={12}>
            <BarChart
              layout="vertical"
              data={[{ name: "progress", done: percent }]}
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            >
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis type="category" dataKey="name" hide />
              <Bar
                dataKey="done"
                fill={BAR_COLOR}
                barSize={BAR_SIZE}
                radius={BAR_SIZE / 2}
                background={{ fill: TRACK_COLOR, radius: BAR_SIZE / 2 }}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <span className="shrink-0 text-sm font-medium text-[#5f6573]">
          {percent}%
        </span>
      </div>

      {showStages && (
        <ul className="mt-3 flex flex-col gap-2.5">
          {stages.map((stage) => (
            <li key={stage.stage} className="flex items-center gap-2.5">
              <span
                className={[
                  "flex size-5 shrink-0 items-center justify-center rounded-full",
                  stage.is_completed
                    ? "bg-primary text-white"
                    : "border border-[#c7d0de] bg-white",
                ].join(" ")}
              >
                {stage.is_completed && <Check className="size-3" />}
              </span>

              <span
                className={
                  stage.is_completed
                    ? "min-w-0 flex-1 text-sm font-semibold text-primary line-through xl:text-[15px]"
                    : "min-w-0 flex-1 text-sm text-[#5f6573] xl:text-[15px]"
                }
              >
                {STAGE_LABEL[stage.name] ?? stage.description}
              </span>

              {!stage.is_completed && (
                <button
                  type="button"
                  onClick={() => setOpenForm(STAGE_FORM[stage.name])}
                  className="shrink-0 cursor-pointer text-sm font-semibold text-primary hover:underline"
                >
                  Lengkapi
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {collapsible && (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          className="mt-3 flex w-full cursor-pointer items-center justify-center gap-1 text-sm font-semibold text-primary"
        >
          {expanded ? "Sembunyikan" : "Lihat Selengkapnya"}
          <ChevronDown
            className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      )}

      <EditProfileForm
        open={openForm === "profile"}
        onClose={closeForm}
        onSaved={handleSaved}
        userId={forms.userId}
        username={forms.username}
        fullName={forms.fullName}
        headline={forms.headline}
        phoneNumber={forms.phoneNumber}
        bio={forms.bio}
        socialMediaAccounts={forms.socialMediaAccounts}
        socialMediaPlatforms={forms.socialMediaPlatforms}
      />
      <EditEducationForm
        open={openForm === "education"}
        onClose={closeForm}
        onSaved={handleSaved}
        userId={forms.userId}
        entries={forms.educationHistories}
        institutions={forms.institutions}
      />
      <EditTrainingForm
        open={openForm === "training"}
        onClose={closeForm}
        onSaved={handleSaved}
        userId={forms.userId}
        entries={forms.trainingHistories}
      />
      <EditOrganizationExperienceForm
        open={openForm === "organization"}
        onClose={closeForm}
        onSaved={handleSaved}
        userId={forms.userId}
        entries={forms.organizationExperiences}
      />
      <EditWorkExperienceForm
        open={openForm === "work"}
        onClose={closeForm}
        onSaved={handleSaved}
        userId={forms.userId}
        entries={forms.workExperiences}
      />
    </div>
  );
}
