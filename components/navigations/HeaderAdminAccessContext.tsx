"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SessionGrant } from "@/apis/session";

// check-session's grant carries no logo, so the layout backfills one from access-grants/my/list.
export type HeaderAdminGrant = SessionGrant & {
  entity_image_url?: string | null;
};

export interface HeaderAdminAccess {
  adminOrigin: string;
  roleName?: string;
  grants: HeaderAdminGrant[];
}

const HeaderAdminAccessContext = createContext<HeaderAdminAccess | null>(null);

interface HeaderAdminAccessProviderProps {
  value: HeaderAdminAccess | null;
  children: ReactNode;
}

export function HeaderAdminAccessProvider({
  value,
  children,
}: HeaderAdminAccessProviderProps) {
  return (
    <HeaderAdminAccessContext.Provider value={value}>
      {children}
    </HeaderAdminAccessContext.Provider>
  );
}

export function useHeaderAdminAccess() {
  return useContext(HeaderAdminAccessContext);
}
