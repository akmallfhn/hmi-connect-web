import { formatEntityAuthorName, stripEntityNamePrefix } from "@/lib/feed-author";
import type { AccessEntityTypeEnum } from "@/lib/types";

// The name as feeds and profiles will render it, so a typed prefix never shows up doubled.
export default function EntityNamePreview({
  entityType,
  name,
}: {
  entityType: AccessEntityTypeEnum;
  name: string;
}) {
  const bareName = stripEntityNamePrefix(entityType, name);
  const displayName = formatEntityAuthorName(entityType, bareName);
  // An organization is named outright, so the preview would only echo the field.
  if (!bareName || displayName === bareName) return null;

  return (
    <p className="pl-1 text-xs text-muted-foreground">
      Tampil sebagai{" "}
      <span className="font-medium text-primary">
        {displayName}
      </span>
    </p>
  );
}
