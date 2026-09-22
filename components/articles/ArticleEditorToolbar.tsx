"use client";

import { type Editor, useEditorState } from "@tiptap/react";
import {
  Bold,
  Code2,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Subscript,
  Superscript,
  Underline,
  Undo2,
} from "lucide-react";
import type { ReactNode } from "react";

interface ToolbarButtonProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}

function ToolbarButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`flex size-10 shrink-0 items-center justify-center rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-30 sm:size-9 ${
        active
          ? "bg-primary-soft text-primary-foreground"
          : "text-[#454b57] hover:bg-[#f3f5f7] hover:text-[#172033]"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return (
    <span
      aria-hidden="true"
      className="mx-0.5 h-7 w-px shrink-0 bg-[#e6e9ef] sm:mx-1"
    />
  );
}

interface ArticleEditorToolbarProps {
  editor: Editor | null;
  onInsertImage: () => void;
}

export default function ArticleEditorToolbar({
  editor,
  onInsertImage,
}: ArticleEditorToolbarProps) {
  const toolbarState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      canUndo: currentEditor?.can().undo() ?? false,
      canRedo: currentEditor?.can().redo() ?? false,
      bold: currentEditor?.isActive("bold") ?? false,
      italic: currentEditor?.isActive("italic") ?? false,
      underline: currentEditor?.isActive("underline") ?? false,
      superscript: currentEditor?.isActive("superscript") ?? false,
      subscript: currentEditor?.isActive("subscript") ?? false,
      blockquote: currentEditor?.isActive("blockquote") ?? false,
      codeBlock: currentEditor?.isActive("codeBlock") ?? false,
      bulletList: currentEditor?.isActive("bulletList") ?? false,
      orderedList: currentEditor?.isActive("orderedList") ?? false,
      heading1: currentEditor?.isActive("heading", { level: 1 }) ?? false,
      heading2: currentEditor?.isActive("heading", { level: 2 }) ?? false,
      heading3: currentEditor?.isActive("heading", { level: 3 }) ?? false,
      heading4: currentEditor?.isActive("heading", { level: 4 }) ?? false,
    }),
  });

  function setBlockStyle(value: string) {
    if (!editor) return;

    switch (value) {
      case "h1":
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case "h2":
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case "h3":
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      case "h4":
        editor.chain().focus().toggleHeading({ level: 4 }).run();
        break;
      default:
        editor.chain().focus().setParagraph().run();
    }
  }

  const currentBlock = toolbarState?.heading1
    ? "h1"
    : toolbarState?.heading2
      ? "h2"
      : toolbarState?.heading3
        ? "h3"
        : toolbarState?.heading4
          ? "h4"
          : "paragraph";

  return (
    <div className="sticky top-16 z-30 border-b border-[#e6e9ef] bg-white/95 backdrop-blur-md">
      {/* The right fade is the only cue that the row scrolls, since its scrollbar is hidden. */}
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white to-transparent sm:hidden" />
      <div className="mx-auto flex h-14 max-w-[900px] items-center overflow-x-auto px-3 [scrollbar-width:none] sm:px-8 [&::-webkit-scrollbar]:hidden">
        <ToolbarButton
          label="Urungkan"
          disabled={!toolbarState?.canUndo}
          onClick={() => editor?.chain().focus().undo().run()}
        >
          <Undo2 className="size-[19px]" strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          label="Ulangi"
          disabled={!toolbarState?.canRedo}
          onClick={() => editor?.chain().focus().redo().run()}
        >
          <Redo2 className="size-[19px]" strokeWidth={2} />
        </ToolbarButton>

        <Divider />

        <label className="relative mr-1 shrink-0">
          <span className="sr-only">Gaya teks</span>
          <select
            aria-label="Gaya teks"
            value={currentBlock}
            disabled={!editor}
            onChange={(event) => setBlockStyle(event.target.value)}
            className="h-10 cursor-pointer appearance-none rounded-lg bg-transparent py-0 pl-2 pr-7 text-[13px] font-medium text-[#343a46] outline-none hover:bg-[#f3f5f7] focus:ring-2 focus:ring-primary/30 sm:h-9 sm:pl-3 sm:pr-8 sm:text-sm"
          >
            <option value="paragraph">Paragraf</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#7b8190] sm:right-3">
            ▼
          </span>
        </label>

        <Divider />

        <ToolbarButton
          label="Bold"
          active={toolbarState?.bold}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold className="size-[19px]" strokeWidth={2.25} />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={toolbarState?.italic}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-[19px]" strokeWidth={2.25} />
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          active={toolbarState?.underline}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          <Underline className="size-[19px]" strokeWidth={2.25} />
        </ToolbarButton>
        <ToolbarButton
          label="Superscript"
          active={toolbarState?.superscript}
          onClick={() => editor?.chain().focus().toggleSuperscript().run()}
        >
          <Superscript className="size-[19px]" />
        </ToolbarButton>
        <ToolbarButton
          label="Subscript"
          active={toolbarState?.subscript}
          onClick={() => editor?.chain().focus().toggleSubscript().run()}
        >
          <Subscript className="size-[19px]" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton label="Insert Image" onClick={onInsertImage}>
          <ImagePlus className="size-[19px]" />
        </ToolbarButton>
        <ToolbarButton
          label="Quote"
          active={toolbarState?.blockquote}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="size-[19px]" />
        </ToolbarButton>
        <ToolbarButton
          label="Code"
          active={toolbarState?.codeBlock}
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        >
          <Code2 className="size-[19px]" />
        </ToolbarButton>
        <ToolbarButton
          label="Bullet List"
          active={toolbarState?.bulletList}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List className="size-[20px]" />
        </ToolbarButton>
        <ToolbarButton
          label="Ordered List"
          active={toolbarState?.orderedList}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-[20px]" />
        </ToolbarButton>
        <ToolbarButton
          label="Divider"
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="size-[20px]" />
        </ToolbarButton>
      </div>
    </div>
  );
}
