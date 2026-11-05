"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ComposerAuthorEntity } from "@/components/forms/CreateFeedForms";

const ActingEntityContext = createContext<ComposerAuthorEntity | null>(null);

// Provides the server-validated acting account to feed and profile controls.
export function ActingEntityProvider({
  entity,
  children,
}: {
  entity: ComposerAuthorEntity | null;
  children: ReactNode;
}) {
  return (
    <ActingEntityContext.Provider value={entity}>
      {children}
    </ActingEntityContext.Provider>
  );
}

export function useActingEntity() {
  return useContext(ActingEntityContext);
}

export function useActingHref() {
  return (href: string) => href;
}
