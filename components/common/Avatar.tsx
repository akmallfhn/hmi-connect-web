import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
  ring?: boolean;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({
  src,
  name,
  size = 40,
  className,
  ring,
}: AvatarProps) {
  const shared = [
    "shrink-0 overflow-hidden rounded-full",
    ring ? "ring-4 ring-primary-soft" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className={`${shared} object-cover`}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`${shared} flex items-center justify-center bg-primary-soft font-semibold text-primary`}
    >
      {getInitials(name)}
    </div>
  );
}
