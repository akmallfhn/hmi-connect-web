"use client";

import { createContext, useCallback, useContext, type ReactNode } from "react";
import { withActingEntity } from "@/lib/access";
import type { ComposerAuthorEntity } from "@/components/forms/CreateFeedForms";

const ActingEntityContext = createContext<ComposerAuthorEntity | null>(null);

// Wraps a surface rendered as an official account, so its feed and profile links keep that point of view.
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
  const entity = useActingEntity();
  return useCallback(
    (href: string) =>
      withActingEntity(
        href,
        entity ? { entityType: entity.type, entityId: entity.id } : null
      ),
    [entity]
  );
}
