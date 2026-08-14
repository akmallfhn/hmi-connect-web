import type { UserProfile } from "@/apis/users";
import AdminMemberDetailPage from "./AdminMemberDetailPage";

interface BranchMemberDetailPageProps {
  branchId: string;
  user: UserProfile;
}

export default function BranchMemberDetailPage({
  branchId,
  user,
}: BranchMemberDetailPageProps) {
  return (
    <AdminMemberDetailPage basePath={`/branches/${branchId}`} user={user} />
  );
}
