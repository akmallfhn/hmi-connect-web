"use client";

import { createContext, useContext, type ReactNode } from "react";

export interface HeaderAdminAccess {
  adminOrigin: string;
  roleName?: string;
  organizationId?: string;
  organizationName?: string;
  canManageOrganization: boolean;
  coordinatingBodyId?: string;
  coordinatingBodyName?: string;
  canManageCoordinatingBody: boolean;
  branchId?: string;
  branchName?: string;
  canManageBranch: boolean;
  coordinatingChapterId?: string;
  coordinatingChapterName?: string;
  canManageCoordinatingChapter: boolean;
  chapterId?: string;
  chapterName?: string;
  canManageChapter: boolean;
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
