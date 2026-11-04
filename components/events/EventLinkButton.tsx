"use client";

import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import Button from "../buttons/Button";

// Button only renders a <button>, so navigation goes through its onClick.
export default function EventLinkButton({
  href,
  newTab = false,
  ...buttonProps
}: Omit<ComponentProps<typeof Button>, "onClick"> & {
  href: string;
  newTab?: boolean;
}) {
  const router = useRouter();
  return (
    <Button
      {...buttonProps}
      onClick={() => {
        if (newTab) window.open(href, "_blank", "noopener,noreferrer");
        else router.push(href);
      }}
    />
  );
}
