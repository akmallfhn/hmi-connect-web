import {
  IconBook2,
  IconBuildingCommunity,
  IconGitBranch,
  IconHierarchy2,
  IconLayoutDashboard,
  IconRoute,
  IconSchool,
  IconSettings,
  IconShieldCheck,
  IconSitemap,
  IconUsers,
  type TablerIcon,
} from "@tabler/icons-react";

// One icon per concept, shared by MasterSidebar and EntitySidebar so a menu never changes icon between dashboards.
export const ADMIN_NAV_ICON = {
  dashboard: IconLayoutDashboard,
  organization: IconBuildingCommunity,
  coordinatingBody: IconSitemap,
  branch: IconGitBranch,
  coordinatingChapter: IconRoute,
  chapter: IconSchool,
  members: IconUsers,
  structural: IconHierarchy2,
  verification: IconShieldCheck,
  adArt: IconBook2,
  settings: IconSettings,
} satisfies Record<string, TablerIcon>;
