"use client";

import { useEffect, useRef, useState } from "react";
import MentionText from "../common/MentionText";

interface ExpandableFeedTextProps {
  text: string;
  className: string;
  interactive?: boolean;
  showFullText?: boolean;
}

export default function ExpandableFeedText({
  text,
  className,
  interactive = true,
  showFullText = false,
}: ExpandableFeedTextProps) {
  const measurementRef = useRef<HTMLParagraphElement>(null);
  const [canExpand, setCanExpand] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (showFullText) return;
    const element = measurementRef.current;
    if (!element) return;

    const measure = () => {
      const lineHeight = Number.parseFloat(window.getComputedStyle(element).lineHeight);
      setCanExpand(element.getBoundingClientRect().height > lineHeight * 10 + 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [text, showFullText]);

  return (
    <div className="relative">
      <p className={`${className} ${showFullText || expanded ? "" : "line-clamp-10"}`}>
        <MentionText interactive={interactive} className="underline-offset-2">
          {text}
        </MentionText>
      </p>
      {!showFullText && (
        <p
          ref={measurementRef}
          aria-hidden="true"
          className={`invisible pointer-events-none absolute inset-x-0 top-0 ${className}`}
        >
          <MentionText interactive={false}>{text}</MentionText>
        </p>
      )}
      {!showFullText && canExpand && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="mt-1 text-sm font-medium text-primary-foreground hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {expanded ? "Tampilkan lebih sedikit" : "Baca selengkapnya"}
        </button>
      )}
    </div>
  );
}
