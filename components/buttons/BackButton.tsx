"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import Button from "./Button";

interface BackButtonProps {
  // Used only when there is no in-app history to return to (e.g. the page was opened in a new tab).
  fallbackHref: string;
  children: ReactNode;
}

// Goes back through history so the list returns with its search, filters, and page intact.
export default function BackButton({ fallbackHref, children }: BackButtonProps) {
  const router = useRouter();

  function handleClick() {
    if (window.history.length > 1) router.back();
    else router.push(fallbackHref);
  }

  return (
    <Button variant="ghost" onClick={handleClick} className="w-fit">
      <ArrowLeft className="size-4" />
      {children}
    </Button>
  );
}
