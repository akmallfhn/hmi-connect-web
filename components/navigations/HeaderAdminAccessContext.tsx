"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SessionGrant } from "@/apis/session";

export interface HeaderAdminAccess {
  adminOrigin: string;
  roleName?: string;
  // Accepted manage grants — a grant may point at any entity, and one person may hold several.
  grants: SessionGrant[];
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
