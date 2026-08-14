"use client";

import { useBranch } from "@/hooks/useBranch";
import AdminMemberListPage, {
  type AdminMemberListDataProps,
} from "./AdminMemberListPage";

interface BranchMemberListPageProps extends AdminMemberListDataProps {
  branchId: string;
}

export default function BranchMemberListPage({
  branchId,
  ...props
}: BranchMemberListPageProps) {
  const { branchName } = useBranch();

  return (
    <AdminMemberListPage
      {...props}
      basePath={`/branches/${branchId}`}
      scopeName={`HMI Cabang ${branchName}`}
      managementScope="branch"
    />
  );
}
