import Label, { type LabelVariant } from "../common/Label";

// Keyed by role_id — see lib/constants.ts#USER_ROLE_OPTIONS for where these ids come from.
const ROLE_VARIANT: Record<number, LabelVariant> = {
  0: "purple", // Super Admin
  1: "blue", // Administrator
  2: "gray", // General User
};

interface UserRoleLabelProps {
  roleId?: number;
  roleName?: string;
}

export default function UserRoleLabel({ roleId, roleName }: UserRoleLabelProps) {
  const variant = (roleId !== undefined ? ROLE_VARIANT[roleId] : undefined) ?? "gray";

  return <Label variant={variant}>{roleName ?? "—"}</Label>;
}
