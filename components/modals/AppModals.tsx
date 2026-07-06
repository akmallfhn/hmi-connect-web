"use client";

import { useRouter } from "next/navigation";
import { createContext, ReactNode, useContext, useState } from "react";
import type { EducationHistoryEntry, TrainingHistoryEntry } from "@/apis/users";
import EditEducationForm from "../forms/EditEducationForm";
import EditHeaderForm from "../forms/EditHeaderForm";
import EditTrainingForm from "../forms/EditTrainingForm";

type ModalKind = "header" | "education" | "training";

interface ProfileEditContextValue {
  openModal: (modal: ModalKind) => void;
}

const ProfileEditContext = createContext<ProfileEditContextValue | null>(null);

export function useProfileEdit() {
  const ctx = useContext(ProfileEditContext);
  if (!ctx) {
    throw new Error("useProfileEdit must be used within <AppModals>");
  }
  return ctx;
}

interface AppModalsProps {
  userId?: string;
  fullName?: string;
  headline?: string;
  bio?: string;
  avatar?: string;
  educationHistories: EducationHistoryEntry[];
  trainingHistories: TrainingHistoryEntry[];
  children: ReactNode;
}

export default function AppModals({
  userId,
  fullName,
  headline,
  bio,
  avatar,
  educationHistories,
  trainingHistories,
  children,
}: AppModalsProps) {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<ModalKind | null>(null);

  function handleClose() {
    setActiveModal(null);
  }

  function handleSaved() {
    setActiveModal(null);
    router.refresh();
  }

  return (
    <ProfileEditContext.Provider value={{ openModal: setActiveModal }}>
      {children}

      <EditHeaderForm
        open={activeModal === "header"}
        onClose={handleClose}
        onSaved={handleSaved}
        userId={userId}
        fullName={fullName}
        headline={headline}
        bio={bio}
        avatar={avatar}
      />
      <EditEducationForm
        open={activeModal === "education"}
        onClose={handleClose}
        onSaved={handleSaved}
        userId={userId}
        entries={educationHistories}
      />
      <EditTrainingForm
        open={activeModal === "training"}
        onClose={handleClose}
        onSaved={handleSaved}
        userId={userId}
        entries={trainingHistories}
      />
    </ProfileEditContext.Provider>
  );
}
