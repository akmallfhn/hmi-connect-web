import type { ReactNode } from "react";
import type { UserListEntry } from "@/apis/users";
import { Eye } from "lucide-react";
import Link from "next/link";
import Avatar from "../common/Avatar";
import UserRoleLabel from "../labels/UserRoleLabel";
import UserStatusLabel from "../labels/UserStatusLabel";
import UserVerifiedLabel from "../labels/UserVerifiedLabel";

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium leading-5 text-heading">
        {value}
      </dd>
    </div>
  );
}

export default function MemberMobileCard({
  user,
  detailHref,
  showRole = false,
  actions,
}: {
  user: UserListEntry;
  detailHref: string;
  showRole?: boolean;
  actions?: ReactNode;
}) {
  return (
    <li className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="p-4">
        <Link
          href={detailHref}
          className="group flex min-w-0 items-center gap-3"
        >
          <Avatar src={user.avatar} name={user.full_name} size={44} />
          <div className="min-w-0">
            <p className="break-words text-[15px] font-semibold leading-5 text-heading group-hover:text-primary-foreground">
              {user.full_name}
            </p>
            <p className="mt-0.5 break-all text-[13px] text-muted-foreground">
              @{user.username}
            </p>
          </div>
        </Link>
        <div className="mt-3 flex flex-wrap gap-2">
          <UserStatusLabel status={user.status} />
          <UserVerifiedLabel status={user.verification_status} />
          {showRole && (
            <UserRoleLabel roleId={user.role_id} roleName={user.role_name} />
          )}
        </div>
      </div>

      <dl className="mx-4 border-t border-border py-4">
        <DetailItem
          label="Email"
          value={<span className="break-all">{user.email || "—"}</span>}
        />
      </dl>

      {/* mt-auto pins the footer down so two cards sharing a row line up. */}
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border px-3 py-2">
        <Link
          href={detailHref}
          className="inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <Eye className="size-4" /> Lihat Detail
        </Link>
        {actions}
      </div>
    </li>
  );
}
