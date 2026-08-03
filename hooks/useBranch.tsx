"use client";

import { createContext, useContext, type ReactNode } from "react";

interface BranchContextValue {
  branchId: string;
  branchName: string;
}

const BranchContext = createContext<BranchContextValue | null>(null);

interface BranchProviderProps extends BranchContextValue {
  children: ReactNode;
}

export function BranchProvider({
  branchId,
  branchName,
  children,
}: BranchProviderProps) {
  return (
    <BranchContext.Provider value={{ branchId, branchName }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch(): BranchContextValue {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error("useBranch must be used within BranchProvider");
  }
  return context;
}
