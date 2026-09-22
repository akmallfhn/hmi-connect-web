"use client";

import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import SubscriptExtension from "@tiptap/extension-subscript";
import SuperscriptExtension from "@tiptap/extension-superscript";
import {
  EditorContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
  useEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Check,
  ChevronLeft,
  FileImage,
  ImagePlus,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  DragEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import type { ArticleCategory } from "@/apis/articles";
import ArticleEditorToolbar from "@/components/articles/ArticleEditorToolbar";
import Button from "@/components/buttons/Button";
import Avatar from "@/components/common/Avatar";
import Input from "@/components/fields/Input";
import Select from "@/components/fields/Select";
import Modal from "@/components/modals/Modal";
import { createArticle, updateArticle } from "@/lib/actions";
import { compressImage } from "@/lib/compress-image";
import { supabase } from "@/lib/supabase";

const ARTICLE_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];
const ARTICLE_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif", "gif"];
const MAX_ARTICLE_IMAGE_RAW_BYTES = 20 * 1024 * 1024;
const MAX_ARTICLE_IMAGE_BYTES = 5 * 1024 * 1024;

type ArticleImageFolder = "covers" | "content";

// Same RLS-rejection signature every other bucket-folder upload in this app detects.
function isStoragePolicyError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.toLowerCase().includes("row-level security")
  );
}

async function uploadArticleImage(
  file: File,
  folder: ArticleImageFolder
): Promise<string> {
  if (!ARTICLE_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Format gambar harus JPG, PNG, WebP, AVIF, atau GIF.");
  }
  const pickedExtension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ARTICLE_IMAGE_EXTENSIONS.includes(pickedExtension)) {
    throw new Error("Ekstensi file tidak valid.");
  }
  if (file.size > MAX_ARTICLE_IMAGE_RAW_BYTES) {
    throw new Error("Ukuran gambar maksimal 20 MB.");
  }

  const compressed = await compressImage(file);
  if (compressed.size > MAX_ARTICLE_IMAGE_BYTES) {
    throw new Error("Gambar masih terlalu besar setelah dikompres.");
  }
  const extension =
    compressed.name.split(".").pop()?.toLowerCase() ?? pickedExtension;

  const filePath = `articles/${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from("hmi-connect")
    .upload(filePath, compressed, {
      cacheControl: "3600",
      contentType: compressed.type,
      upsert: false,
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("hmi-connect").getPublicUrl(filePath);
  if (!data?.publicUrl) throw new Error("missing public url");

  return data.publicUrl;
}

function ArticleBodyImage({
  node,
  selected,
  deleteNode,
  editor,
  getPos,
}: NodeViewProps) {
  const src = String(node.attrs.src ?? "");
  const alt = String(node.attrs.alt ?? "Gambar artikel");

  function selectImage() {
    const position = getPos();
    if (typeof position === "number") {
      editor.commands.setNodeSelection(position);
    }
  }

  return (
    <NodeViewWrapper
      className={`article-body-image-node group/body-image relative rounded-2xl transition ${
        selected
          ? "ring-2 ring-blue-500 ring-offset-4"
          : "hover:ring-1 hover:ring-blue-200 hover:ring-offset-2"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- author-picked local source needs its natural dimensions in Tiptap */}
      <img
        src={src}
        alt={alt}
        draggable="true"
        data-drag-handle
        onClick={selectImage}
      />
      <Button
        variant="destructive"
        size="icon"
        aria-label="Hapus gambar dari artikel"
        title="Hapus gambar"
        contentEditable={false}
        onMouseDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.stopPropagation();
          deleteNode();
        }}
        className={`absolute right-2 top-2 shadow-lg ${
          selected
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0 group-hover/body-image:pointer-events-auto group-hover/body-image:opacity-100"
        }`}
      >
        <Trash2 className="size-[18px]" />
      </Button>
    </NodeViewWrapper>
  );
}

// A textarea will not reflow on its own, so its height is driven off its own scrollHeight.
function autoGrow(element: HTMLTextAreaElement | null) {
  if (!element) return;
  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;
}

const ArticleImageExtension = ImageExtension.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ArticleBodyImage);
  },
});

export type ArticleAuthor = {
  id: string;
  fullName: string;
  avatar?: string;
};

// What edit mode seeds from; the body arrives already sanitized by lib/article-body.ts.
export type ArticleDraft = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  bodyHtml: string;
  categoryId: number | null;
  keywords: string[];
};

interface ArticleComposerPageProps {
  author: ArticleAuthor;
  categories: ArticleCategory[];
  draft?: ArticleDraft;
}

export default function ArticleComposerPage({
  author,
  categories,
  draft,
}: ArticleComposerPageProps) {
  const router = useRouter();
  const isEditing = Boolean(draft);
  // Alphabetical, since the endpoint's own order is by id and means nothing to the author.
  const categoryOptions = categories
    .map((item) => ({ label: item.name, value: item.id }))
    .sort((a, b) => a.label.localeCompare(b.label, "id"));
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const subtitleRef = useRef<HTMLTextAreaElement>(null);
  const bodyImageInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [title, setTitle] = useState(draft?.title ?? "");
  const [subtitle, setSubtitle] = useState(draft?.description ?? "");
  const [categoryId, setCategoryId] = useState<number | null>(
    draft?.categoryId ?? null
  );
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>(draft?.keywords ?? []);
  const [coverUrl, setCoverUrl] = useState(draft?.imageUrl ?? "");
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [isBodyImageUploading, setIsBodyImageUploading] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      SuperscriptExtension,
      SubscriptExtension,
      ArticleImageExtension.configure({
        allowBase64: false,
        HTMLAttributes: { class: "article-body-image" },
      }),
      Placeholder.configure({
        placeholder: "Mulai menulis artikelmu...",
      }),
    ],
    content: draft?.bodyHtml,
    editorProps: {
      attributes: {
        class: "article-editor min-h-[380px] focus:outline-none",
        "aria-label": "Isi artikel",
      },
    },
    onUpdate: markAsChanged,
  });

  function articleUploadMessage(error: unknown, fallback: string) {
    if (isStoragePolicyError(error)) {
      return "Upload ditolak Supabase. Izinkan folder articles di bucket hmi-connect.";
    }
    return error instanceof Error ? error.message : fallback;
  }

  function markAsChanged() {
    setIsSaved(false);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => setIsSaved(true), 650);
  }

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    function growBoth() {
      autoGrow(titleRef.current);
      autoGrow(subtitleRef.current);
    }

    growBoth();
    window.addEventListener("resize", growBoth);
    return () => window.removeEventListener("resize", growBoth);
  }, []);

  function updateTitle(event: ChangeEvent<HTMLTextAreaElement>) {
    const nextTitle = event.target.value.replace(/[\r\n]+/g, " ");
    setTitle(nextTitle);
    autoGrow(event.target);
    markAsChanged();
  }

  function updateSubtitle(event: ChangeEvent<HTMLTextAreaElement>) {
    const nextSubtitle = event.target.value.replace(/[\r\n]+/g, " ");
    setSubtitle(nextSubtitle);
    autoGrow(event.target);
    markAsChanged();
  }

  // Both stay one paragraph, so a newline would only add height the value cannot keep.
  function handleSingleLineKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter") event.preventDefault();
  }

  function addKeyword() {
    const normalized = keywordInput.trim().replace(/^#/, "");
    if (!normalized) return;
    if (
      keywords.some(
        (keyword) => keyword.toLowerCase() === normalized.toLowerCase()
      )
    ) {
      setKeywordInput("");
      return;
    }
    if (keywords.length >= 8) {
      toast.error("Maksimal 8 keyword per artikel.");
      return;
    }

    setKeywords((current) => [...current, normalized]);
    setKeywordInput("");
    markAsChanged();
  }

  function handleKeywordKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addKeyword();
    }
    if (event.key === "Backspace" && !keywordInput && keywords.length > 0) {
      setKeywords((current) => current.slice(0, -1));
      markAsChanged();
    }
  }

  function removeKeyword(keywordToRemove: string) {
    setKeywords((current) =>
      current.filter((keyword) => keyword !== keywordToRemove)
    );
    markAsChanged();
  }

  async function setCoverFile(file?: File) {
    if (!file) return;

    setIsCoverUploading(true);
    const toastId = toast.loading("Mengunggah cover...");
    try {
      const url = await uploadArticleImage(file, "covers");
      setCoverUrl(url);
      markAsChanged();
      toast.success("Cover berhasil diunggah.", { id: toastId });
    } catch (error) {
      console.error("[ArticleComposerPage] cover upload threw:", error);
      toast.error(articleUploadMessage(error, "Cover gagal diunggah."), {
        id: toastId,
      });
    } finally {
      setIsCoverUploading(false);
    }
  }

  function handleCoverDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    void setCoverFile(event.dataTransfer.files[0]);
  }

  async function insertBodyImage(file?: File) {
    if (!file || !editor) return;

    setIsBodyImageUploading(true);
    const toastId = toast.loading("Mengunggah gambar...");
    try {
      const url = await uploadArticleImage(file, "content");
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      toast.success("Gambar berhasil disisipkan.", { id: toastId });
    } catch (error) {
      console.error("[ArticleComposerPage] body image upload threw:", error);
      toast.error(articleUploadMessage(error, "Gambar gagal diunggah."), {
        id: toastId,
      });
    } finally {
      setIsBodyImageUploading(false);
    }
  }

  function openPublishModal() {
    if (isCoverUploading || isBodyImageUploading) {
      toast.error("Tunggu sampai semua gambar selesai diunggah.");
      return;
    }
    if (!title.trim()) {
      toast.error("Tambahkan judul artikel terlebih dahulu.");
      return;
    }
    if (editor?.isEmpty) {
      toast.error("Isi artikel belum boleh kosong.");
      return;
    }
    if (!coverUrl) {
      toast.error("Unggah cover artikel terlebih dahulu.");
      return;
    }

    setIsPublishModalOpen(true);
  }

  async function publishArticle() {
    if (!categoryId) {
      toast.error("Pilih kategori artikel terlebih dahulu.");
      return;
    }
    const bodyContent = editor?.getHTML().trim();
    if (!bodyContent) {
      toast.error("Isi artikel belum boleh kosong.");
      return;
    }

    setIsPublishing(true);
    const toastId = toast.loading(
      isEditing ? "Menyimpan artikel..." : "Menerbitkan artikel..."
    );
    const fields = {
      title: title.trim(),
      image_url: coverUrl,
      body_content: bodyContent,
      category_id: categoryId,
      description: subtitle.trim(),
      keywords: keywords.join(", "),
    };
    // Editing deliberately leaves `status` alone, so saving can't publish a draft by accident.
    const result = draft
      ? await updateArticle({ id: draft.id, ...fields })
      : await createArticle({
          ...fields,
          author_id: author.id,
          status: "published",
        });

    if (!result.ok) {
      setIsPublishing(false);
      toast.error(result.message, { id: toastId });
      return;
    }

    toast.success(
      isEditing
        ? "Perubahan artikel tersimpan."
        : "Artikel berhasil diterbitkan.",
      { id: toastId }
    );
    setIsPublishModalOpen(false);
    const { slug_url, id } = result.article;
    router.push(`/articles/${slug_url || "artikel"}/${id}`);
  }

  function goBack() {
    router.back();
  }

  return (
    <main className="min-h-screen bg-white text-[#172033]">
      <header className="sticky top-0 z-40 h-16 border-b border-[#e6e9ef] bg-white/95 backdrop-blur-md">
        <div className="flex h-full items-center justify-between px-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <button
              type="button"
              aria-label="Tutup editor"
              title="Tutup editor"
              onClick={goBack}
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-[#343a46] transition hover:bg-[#f3f5f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <ChevronLeft className="size-6" strokeWidth={2.25} />
            </button>

            <div className="flex items-center gap-2 rounded-lg border border-[#e1e5ea] bg-white px-3 py-1.5 text-sm text-[#454b57]">
              {isSaved ? (
                <Check className="size-3.5 text-[#1baf7a]" strokeWidth={3} />
              ) : (
                <span className="size-2 animate-pulse rounded-full bg-[#eda100]" />
              )}
              <span className="hidden sm:inline">
                {isSaved ? "Tersimpan" : "Menyimpan..."}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={openPublishModal}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-secondary px-4 text-sm font-semibold text-white transition hover:bg-[#e6534b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30 sm:px-6"
            >
              {isEditing ? "Perbarui" : "Lanjutkan"}
            </button>
          </div>
        </div>
      </header>

      <ArticleEditorToolbar
        editor={editor}
        onInsertImage={() => bodyImageInputRef.current?.click()}
      />

      <input
        ref={bodyImageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          void insertBodyImage(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          void setCoverFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      <div className="mx-auto w-full max-w-[900px] px-4 pb-28 pt-6 sm:px-8 sm:pt-14">
        <textarea
          ref={titleRef}
          rows={1}
          value={title}
          maxLength={70}
          onChange={updateTitle}
          onKeyDown={handleSingleLineKeyDown}
          placeholder="Judul artikel"
          aria-label="Judul artikel"
          aria-describedby="article-title-limit"
          className="font-stack-sans-headline block w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-[26px] font-medium leading-[1.15] text-[#172033] outline-none placeholder:text-[#afb4bd] sm:text-[38px] sm:leading-[1.1] lg:text-[54px]"
        />
        <div
          id="article-title-limit"
          className={`mt-2 flex min-h-5 items-center justify-end gap-2 text-xs ${
            title.length >= 70 ? "text-destructive" : "text-[#9aa0ab]"
          }`}
        >
          {title.length >= 70 && <span>Judul maksimal 70 karakter.</span>}
          <span>{title.length}/70</span>
        </div>
        <textarea
          ref={subtitleRef}
          rows={1}
          value={subtitle}
          maxLength={170}
          onChange={updateSubtitle}
          onKeyDown={handleSingleLineKeyDown}
          placeholder="Tambahkan ringkasan singkat..."
          aria-label="Ringkasan artikel"
          className="mt-3 block w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-base leading-relaxed text-[#5f6573] outline-none placeholder:text-[#b7bbc3] sm:mt-4 sm:text-xl lg:text-2xl"
        />
        <div
          className={`mt-1 text-right text-xs ${
            subtitle.length >= 170 ? "text-destructive" : "text-[#9aa0ab]"
          }`}
        >
          {subtitle.length >= 170 && (
            <span className="mr-2">Ringkasan maksimal 170 karakter.</span>
          )}
          {subtitle.length}/170
        </div>

        <section className="mt-7">
          {coverUrl ? (
            <div className="group relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-[#f3f5f7]">
              <Image
                src={coverUrl}
                alt="Cover artikel"
                fill
                unoptimized
                className="object-cover transition duration-300 group-hover:scale-[1.01]"
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/15 opacity-100 transition sm:bg-black/0 sm:opacity-0 sm:group-hover:bg-black/25 sm:group-hover:opacity-100 sm:group-focus-within:bg-black/25 sm:group-focus-within:opacity-100">
                <div className="pointer-events-auto flex items-center gap-2">
                  <Button
                    variant="light"
                    size="default"
                    disabled={isCoverUploading}
                    onClick={() => coverInputRef.current?.click()}
                    className="h-10 rounded-xl border-0 px-4 shadow-lg"
                  >
                    <ImagePlus className="size-4" /> Ganti cover
                  </Button>
                  <Button
                    variant="destructive"
                    size="default"
                    disabled={isCoverUploading}
                    aria-label="Hapus cover"
                    title="Hapus cover"
                    onClick={() => {
                      setCoverUrl("");
                      markAsChanged();
                    }}
                    className="h-10 rounded-xl px-4 shadow-lg"
                  >
                    <Trash2 className="size-4" /> Hapus
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={isCoverUploading}
              onClick={() => coverInputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleCoverDrop}
              className="flex aspect-[16/9] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#cbd2dc] bg-[#fbfcfd] px-5 text-center transition hover:border-primary hover:bg-primary-soft/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary">
                <FileImage className="size-5" />
              </span>
              <span className="mt-3 text-sm font-semibold text-[#343a46] lg:text-[15px]">
                {isCoverUploading ? (
                  "Mengunggah cover..."
                ) : (
                  <>
                    Unggah cover artikel{" "}
                    <span className="text-destructive">*</span>
                  </>
                )}
              </span>
              <span className="mt-1 text-xs text-[#8a909d] lg:text-[13px]">
                Klik atau tarik gambar ke sini · rasio 16:9 disarankan
              </span>
            </button>
          )}
        </section>

        <div className="mt-7 sm:mt-10">
          <EditorContent editor={editor} />
        </div>
      </div>

      <Modal
        open={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title={isEditing ? "Perbarui artikel" : "Siapkan publikasi"}
        panelClassName="max-w-xl"
      >
        <p className="text-sm leading-relaxed text-[#6b7280]">
          Pilih kategori dan tambahkan keyword agar artikel lebih mudah
          ditemukan.
        </p>

        <div className="mt-6">
          <Select
            selectId="article-category"
            label="Kategori"
            placeholder={
              categoryOptions.length === 0
                ? "Belum ada kategori"
                : "Pilih kategori"
            }
            value={categoryId}
            required
            disabled={categoryOptions.length === 0}
            options={categoryOptions}
            onChange={(value) => {
              setCategoryId(typeof value === "number" ? value : null);
              markAsChanged();
            }}
          />

          <div className="mt-5">
            <Input
              inputId="article-keywords"
              label="Keyword (maks. 8)"
              value={keywordInput}
              onChange={(event) => setKeywordInput(event.target.value)}
              onKeyDown={handleKeywordKeyDown}
              onBlur={addKeyword}
              placeholder={
                keywords.length === 0
                  ? "Ketik lalu tekan Enter..."
                  : "Tambah keyword..."
              }
              disabled={keywords.length >= 8}
              className="h-12"
            />
            {keywords.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex h-7 items-center gap-1 rounded-full bg-primary-soft pl-2.5 pr-1.5 text-sm text-primary-foreground"
                  >
                    {keyword}
                    <button
                      type="button"
                      aria-label={`Hapus keyword ${keyword}`}
                      onClick={() => removeKeyword(keyword)}
                      className="flex size-5 items-center justify-center rounded-full hover:bg-primary/15"
                    >
                      <X className="size-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="mt-2 text-xs text-[#8a909d]">
              Gunakan keyword yang spesifik dan relevan dengan isi artikel.
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl bg-[#202428]">
          {coverUrl && (
            <div className="relative aspect-[16/9] w-full bg-black/20">
              <Image
                src={coverUrl}
                alt="Pratinjau cover artikel"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          )}
          <div className="p-4">
            <p className="font-stack-sans-headline text-xl font-medium text-white">
              {title}
            </p>
            {subtitle && (
              <p className="mt-1.5 line-clamp-2 text-sm text-white/65">
                {subtitle}
              </p>
            )}
            <div className="mt-3 flex items-center gap-2.5 border-t border-white/10 pt-3">
              <Avatar src={author.avatar} name={author.fullName} size={32} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {author.fullName}
                </p>
                <p className="text-xs text-white/70">Penulis</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-[#e6e9ef] pt-4 sm:flex-row sm:justify-end">
          <Button
            variant="light"
            disabled={isPublishing}
            onClick={() => setIsPublishModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            disabled={isPublishing}
            onClick={() => void publishArticle()}
          >
            {isPublishing
              ? "Menyimpan..."
              : isEditing
                ? "Simpan Perubahan"
                : "Publish"}
          </Button>
        </div>
      </Modal>
    </main>
  );
}
