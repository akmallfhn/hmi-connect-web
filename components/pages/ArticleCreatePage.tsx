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
import ArticleEditorToolbar from "@/components/articles/ArticleEditorToolbar";
import Button from "@/components/buttons/Button";

const ARTICLE_CATEGORIES = [
  "Berita",
  "Opini",
  "Kajian",
  "Organisasi",
  "Kaderisasi",
];

type ComposerStep = "write" | "details";

function readImage(file: File, callback: (url: string) => void) {
  if (!file.type.startsWith("image/")) {
    toast.error("File yang dipilih harus berupa gambar.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => callback(String(reader.result));
  reader.onerror = () => toast.error("Gambar tidak dapat dibaca.");
  reader.readAsDataURL(file);
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

const ArticleImageExtension = ImageExtension.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ArticleBodyImage);
  },
});

export default function ArticleCreatePage() {
  const router = useRouter();
  const bodyImageInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [coverUrl, setCoverUrl] = useState("");
  const [isSaved, setIsSaved] = useState(true);
  const [step, setStep] = useState<ComposerStep>("write");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      SuperscriptExtension,
      SubscriptExtension,
      ArticleImageExtension.configure({
        allowBase64: true,
        HTMLAttributes: { class: "article-body-image" },
      }),
      Placeholder.configure({
        placeholder: "Mulai menulis artikelmu...",
      }),
    ],
    editorProps: {
      attributes: {
        class: "article-editor min-h-[380px] focus:outline-none",
        "aria-label": "Isi artikel",
      },
    },
    onUpdate: markAsChanged,
  });

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

  function updateTitle(event: ChangeEvent<HTMLTextAreaElement>) {
    const nextTitle = event.target.value.replace(/[\r\n]+/g, " ");
    event.target.value = nextTitle;
    setTitle(nextTitle);
    event.target.style.height = "auto";
    event.target.style.height = `${event.target.scrollHeight}px`;
    markAsChanged();
  }

  function handleTitleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
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

  function setCoverFile(file?: File) {
    if (!file) return;
    readImage(file, (url) => {
      setCoverUrl(url);
      markAsChanged();
    });
  }

  function handleCoverDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setCoverFile(event.dataTransfer.files[0]);
  }

  function insertBodyImage(file?: File) {
    if (!file || !editor) return;
    readImage(file, (url) => {
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
    });
  }

  function continueToDetails() {
    if (!title.trim()) {
      toast.error("Tambahkan judul artikel terlebih dahulu.");
      return;
    }
    if (editor?.isEmpty) {
      toast.error("Isi artikel belum boleh kosong.");
      return;
    }

    setStep("details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function publishArticle() {
    if (!category) {
      toast.error("Pilih kategori artikel terlebih dahulu.");
      return;
    }

    toast.info(
      "Artikel sudah siap. Integrasi publish akan ditambahkan bersama backend."
    );
  }

  function goBack() {
    if (step === "details") {
      setStep("write");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
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
              onClick={step === "write" ? continueToDetails : publishArticle}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-secondary px-4 text-sm font-semibold text-white transition hover:bg-[#e6534b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30 sm:px-6"
            >
              {step === "write" ? "Lanjutkan" : "Publikasikan"}
            </button>
          </div>
        </div>
      </header>

      {step === "write" && (
        <ArticleEditorToolbar
          editor={editor}
          onInsertImage={() => bodyImageInputRef.current?.click()}
        />
      )}

      <input
        ref={bodyImageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          insertBodyImage(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          setCoverFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      {step === "write" ? (
        <div className="mx-auto w-full max-w-[900px] px-5 pb-28 pt-10 sm:px-8 sm:pt-14">
          <textarea
            rows={1}
            value={title}
            maxLength={70}
            onChange={updateTitle}
            onKeyDown={handleTitleKeyDown}
            placeholder="Judul artikel"
            aria-label="Judul artikel"
            aria-describedby="article-title-limit"
            className="font-stack-sans-headline block min-h-[58px] w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-[42px] font-medium leading-[1.1] text-[#172033] outline-none placeholder:text-[#afb4bd] sm:text-[54px]"
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
          <input
            type="text"
            value={subtitle}
            maxLength={170}
            onChange={(event) => {
              setSubtitle(event.target.value);
              markAsChanged();
            }}
            placeholder="Tambahkan ringkasan singkat..."
            aria-label="Ringkasan artikel"
            className="mt-4 block w-full border-0 bg-transparent p-0 text-xl leading-relaxed text-[#5f6573] outline-none placeholder:text-[#b7bbc3] sm:text-2xl"
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
              <div className="group relative aspect-[16/7] w-full overflow-hidden rounded-2xl bg-[#f3f5f7]">
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
                      onClick={() => coverInputRef.current?.click()}
                      className="h-10 rounded-xl border-0 px-4 shadow-lg"
                    >
                      <ImagePlus className="size-4" /> Ganti cover
                    </Button>
                    <Button
                      variant="destructive"
                      size="default"
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
                onClick={() => coverInputRef.current?.click()}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleCoverDrop}
                className="flex aspect-[16/5] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#cbd2dc] bg-[#fbfcfd] px-5 text-center transition hover:border-primary hover:bg-primary-soft/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <FileImage className="size-5" />
                </span>
                <span className="mt-3 text-sm font-semibold text-[#343a46] lg:text-[15px]">
                  Unggah cover artikel
                </span>
                <span className="mt-1 text-xs text-[#8a909d] lg:text-[13px]">
                  Klik atau tarik gambar ke sini · rasio 16:9 disarankan
                </span>
              </button>
            )}
          </section>

          <div className="mt-10">
            <EditorContent editor={editor} />
          </div>
        </div>
      ) : (
        <section className="mx-auto w-full max-w-[680px] px-5 pb-28 pt-12 sm:px-8 sm:pt-16">
          <p className="text-sm font-semibold text-primary">Langkah 2 dari 2</p>
          <h1 className="mt-2 font-stack-sans-headline text-3xl font-medium text-[#172033] sm:text-4xl">
            Siapkan publikasi
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[#6b7280]">
            Pilih kategori dan tambahkan keyword agar artikel lebih mudah
            ditemukan.
          </p>

          <div className="mt-9 rounded-2xl border border-[#e6e9ef] bg-[#fbfcfd] p-5 sm:p-6">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#454b57]">
                Kategori <span className="text-destructive">*</span>
              </span>
              <select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  markAsChanged();
                }}
                className="h-12 w-full rounded-xl border border-[#dbe3ef] bg-white px-3.5 text-base text-[#172033] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                <option value="">Pilih kategori</option>
                {ARTICLE_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-6">
              <label
                htmlFor="article-keywords"
                className="mb-2 block text-sm font-medium text-[#454b57]"
              >
                Keyword{" "}
                <span className="font-normal text-[#8a909d]">(maks. 8)</span>
              </label>
              <div className="flex min-h-12 flex-wrap items-center gap-2 rounded-xl border border-[#dbe3ef] bg-white px-3 py-2 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
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
                <input
                  id="article-keywords"
                  value={keywordInput}
                  onChange={(event) => setKeywordInput(event.target.value)}
                  onKeyDown={handleKeywordKeyDown}
                  onBlur={addKeyword}
                  placeholder={
                    keywords.length === 0
                      ? "Ketik lalu tekan Enter..."
                      : "Tambah keyword..."
                  }
                  className="h-7 min-w-[170px] flex-1 border-0 bg-transparent px-1 text-base text-[#172033] outline-none placeholder:text-[#9aa0ab]"
                />
              </div>
              <p className="mt-2 text-xs text-[#8a909d]">
                Gunakan keyword yang spesifik dan relevan dengan isi artikel.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-[#e6e9ef] p-5">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#8a909d]">
              Artikel
            </p>
            <p className="mt-2 font-stack-sans-headline text-xl font-medium text-[#172033]">
              {title}
            </p>
            {subtitle && (
              <p className="mt-1.5 line-clamp-2 text-sm text-[#6b7280]">
                {subtitle}
              </p>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
