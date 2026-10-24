"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type Ref,
  type TextareaHTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import type { SearchPersonResult } from "@/apis/search";
import {
  activeMentionAt,
  replaceActiveMention,
  type ActiveMention,
} from "@/lib/mentions";
import Avatar from "../common/Avatar";

const SEARCH_DEBOUNCE_MS = 250;
const SUGGESTION_LIMIT = 6;
const MENU_WIDTH = 320;
const MENU_MAX_HEIGHT = 240;
const VIEWPORT_MARGIN = 12;

type CaretAnchor = { left: number; top: number };

interface MentionTextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange"> {
  value: string;
  onValueChange: (value: string) => void;
  inputRef?: Ref<HTMLTextAreaElement>;
  containerClassName?: string;
  autoResizeMaxHeight?: number;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

function caretAnchor(textarea: HTMLTextAreaElement): CaretAnchor {
  const caret = textarea.selectionStart ?? textarea.value.length;
  const textareaRect = textarea.getBoundingClientRect();
  const computed = window.getComputedStyle(textarea);
  const mirror = document.createElement("div");
  const marker = document.createElement("span");

  Object.assign(mirror.style, {
    position: "fixed",
    visibility: "hidden",
    pointerEvents: "none",
    whiteSpace: "pre-wrap",
    overflowWrap: "break-word",
    boxSizing: computed.boxSizing,
    left: `${textareaRect.left - textarea.scrollLeft}px`,
    top: `${textareaRect.top - textarea.scrollTop}px`,
    width: `${textareaRect.width}px`,
    borderTopWidth: computed.borderTopWidth,
    borderRightWidth: computed.borderRightWidth,
    borderBottomWidth: computed.borderBottomWidth,
    borderLeftWidth: computed.borderLeftWidth,
    borderStyle: "solid",
    paddingTop: computed.paddingTop,
    paddingRight: computed.paddingRight,
    paddingBottom: computed.paddingBottom,
    paddingLeft: computed.paddingLeft,
    fontFamily: computed.fontFamily,
    fontSize: computed.fontSize,
    fontStyle: computed.fontStyle,
    fontWeight: computed.fontWeight,
    lineHeight: computed.lineHeight,
    letterSpacing: computed.letterSpacing,
    textAlign: computed.textAlign,
    textIndent: computed.textIndent,
    textTransform: computed.textTransform,
    wordSpacing: computed.wordSpacing,
    tabSize: computed.tabSize,
  });

  mirror.textContent = textarea.value.slice(0, caret);
  marker.textContent = "\u200b";
  mirror.appendChild(marker);
  document.body.appendChild(mirror);

  const markerRect = marker.getBoundingClientRect();
  const lineHeight = Number.parseFloat(computed.lineHeight) ||
    Number.parseFloat(computed.fontSize) * 1.2;
  mirror.remove();

  return { left: markerRect.left, top: markerRect.top + lineHeight + 4 };
}

export default function MentionTextarea({
  value,
  onValueChange,
  inputRef,
  containerClassName,
  autoResizeMaxHeight,
  onKeyDown,
  onFocus,
  onBlur,
  onSelect,
  className,
  ...props
}: MentionTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);
  const [activeMention, setActiveMention] = useState<ActiveMention | null>(null);
  const [results, setResults] = useState<SearchPersonResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState<CaretAnchor | null>(null);
  const query = activeMention?.query ?? "";
  const menuOpen = activeMention !== null && query.length > 0;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || autoResizeMaxHeight === undefined) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, autoResizeMaxHeight)}px`;
  }, [autoResizeMaxHeight, value]);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    if (!menuOpen) return;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setLoading(true);
      setResults([]);
      try {
        const params = new URLSearchParams({
          q: query,
          page_size: String(SUGGESTION_LIMIT),
        });
        const response = await fetch(`/api/users/search?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`People search failed with ${response.status}`);
        const json = (await response.json()) as { data?: SearchPersonResult[] };
        if (requestId !== requestIdRef.current) return;
        setResults(json.data ?? []);
        setActiveIndex(0);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("[MentionTextarea] people search failed:", error);
        if (requestId === requestIdRef.current) setResults([]);
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [menuOpen, query]);

  useEffect(() => {
    if (!menuOpen) return;

    function reposition() {
      const textarea = textareaRef.current;
      if (textarea) setMenuAnchor(caretAnchor(textarea));
    }

    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [menuOpen]);

  function syncActiveMention(textarea: HTMLTextAreaElement) {
    const caret = textarea.selectionStart ?? textarea.value.length;
    const nextMention = activeMentionAt(textarea.value, caret);
    if ((nextMention?.query ?? "") !== query) {
      setResults([]);
      setLoading(Boolean(nextMention?.query));
    }
    setMenuAnchor(nextMention?.query ? caretAnchor(textarea) : null);
    setActiveMention(nextMention);
  }

  function selectPerson(person: SearchPersonResult) {
    if (!activeMention) return;
    const next = replaceActiveMention(value, activeMention, person.username);
    onValueChange(next.value);
    setActiveMention(null);
    setMenuAnchor(null);
    setResults([]);
    window.setTimeout(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(next.caret, next.caret);
    }, 0);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (menuOpen && results.length > 0) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const direction = event.key === "ArrowDown" ? 1 : -1;
        setActiveIndex((current) =>
          (current + direction + results.length) % results.length
        );
        return;
      }
      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        selectPerson(results[activeIndex]);
        return;
      }
    }
    if (menuOpen && event.key === "Escape") {
      event.preventDefault();
      setActiveMention(null);
      setMenuAnchor(null);
      return;
    }
    if (menuOpen && event.key === "Enter") {
      event.preventDefault();
      return;
    }
    onKeyDown?.(event);
  }

  return (
    <div
      ref={containerRef}
      role="combobox"
      aria-controls={listboxId}
      aria-expanded={menuOpen}
      aria-haspopup="listbox"
      className={`relative ${containerClassName ?? ""}`}
    >
      <textarea
        {...props}
        ref={(node) => {
          textareaRef.current = node;
          assignRef(inputRef, node);
        }}
        value={value}
        onChange={(event) => {
          onValueChange(event.target.value);
          syncActiveMention(event.target);
        }}
        onKeyDown={handleKeyDown}
        onFocus={(event) => {
          syncActiveMention(event.currentTarget);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          if (!containerRef.current?.contains(event.relatedTarget)) {
            setActiveMention(null);
            setMenuAnchor(null);
          }
          onBlur?.(event);
        }}
        onSelect={(event) => {
          syncActiveMention(event.currentTarget);
          onSelect?.(event);
        }}
        className={className}
        aria-autocomplete="list"
      />

      {menuOpen && menuAnchor && typeof document !== "undefined" && createPortal(
        <div
          id={listboxId}
          role="listbox"
          aria-label="Saran username"
          style={{
            left: Math.min(
              Math.max(menuAnchor.left, VIEWPORT_MARGIN),
              Math.max(VIEWPORT_MARGIN, window.innerWidth - MENU_WIDTH - VIEWPORT_MARGIN),
            ),
            top: menuAnchor.top,
            width: Math.min(MENU_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2),
            maxHeight: MENU_MAX_HEIGHT,
          }}
          className="font-google-sans fixed z-[120] overflow-y-auto rounded-xl border border-border bg-surface p-1.5 shadow-xl"
        >
          {loading ? (
            <p className="px-3 py-3 text-sm text-muted-foreground">Mencari pengguna...</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted-foreground">Username tidak ditemukan.</p>
          ) : (
            results.map((person, index) => (
              <button
                key={person.id}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => selectPerson(person)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
                  index === activeIndex ? "bg-primary-soft" : "hover:bg-surface-muted"
                }`}
              >
                <Avatar src={person.avatar} name={person.full_name} size={36} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-heading">
                    {person.full_name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    @{person.username}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>,
        document.body,
      )}
    </div>
  );
}
