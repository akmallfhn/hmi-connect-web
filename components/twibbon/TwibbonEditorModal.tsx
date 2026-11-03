"use client";

import {
  IconDownload,
  IconHandMove,
  IconKeyboard,
  IconPhotoUp,
  IconReplace,
  IconShare2,
  IconTrash,
  IconZoomIn,
} from "@tabler/icons-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ChangeEvent,
  KeyboardEvent,
  PointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import Button from "../buttons/Button";
import Modal from "../modals/Modal";
import { COMPOSE_INTENT_KEY, COMPOSE_INTENT_PHOTO_KEY } from "@/lib/constants";
import { ImageOptimizationError, optimizeImage } from "@/lib/optimize-image";
import { downloadImageBlob, loadImage } from "@/lib/share-canvas";
import {
  blobToDataUrl,
  clampTwibbonTransform,
  DEFAULT_TWIBBON_TRANSFORM,
  drawTwibbon,
  renderTwibbonBlob,
  TWIBBON_FRAMES,
  twibbonOutputSize,
  type TwibbonTransform,
} from "@/lib/twibbon";

interface TwibbonEditorModalProps {
  open: boolean;
  onClose: () => void;
  canShareToFeed: boolean;
}

const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PHOTO_BYTES = 20 * 1024 * 1024;
// Arrow keys move 2% of the 1080px-wide output per press.
const MOVE_STEP = 24;
const ZOOM_STEP = 1.1;
// The preview never grows past this height, whatever the frame's shape.
const PREVIEW_MAX_HEIGHT = "min(60vh, 460px)";
const FILE_NAME = "twibbon-kongres-xxxiii.jpg";

// Marks the frame's transparent area, where the photo goes, in the preview and the frame picker.
const CHECKERBOARD_CLASS =
  "bg-[conic-gradient(var(--border)_25%,var(--surface)_0_50%,var(--border)_0_75%,var(--surface)_0)] bg-[length:20px_20px]";

const INSTRUCTIONS = [
  {
    icon: IconHandMove,
    text: "Geser foto di pratinjau untuk mengatur posisinya.",
  },
  {
    icon: IconZoomIn,
    text: "Cubit dengan dua jari atau scroll untuk zoom in dan zoom out.",
  },
  {
    icon: IconKeyboard,
    text: "Di keyboard, pakai tombol panah untuk geser dan + / − untuk zoom.",
  },
];

export default function TwibbonEditorModal({
  open,
  onClose,
  canShareToFeed,
}: TwibbonEditorModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Twibbon Kongres XXXIII"
      variant="bottomSheet"
      panelClassName="max-w-lg lg:max-w-4xl"
    >
      {open && (
        <TwibbonEditor onClose={onClose} canShareToFeed={canShareToFeed} />
      )}
    </Modal>
  );
}

function TwibbonEditor({
  onClose,
  canShareToFeed,
}: Omit<TwibbonEditorModalProps, "open">) {
  const router = useRouter();
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const [frameId, setFrameId] = useState(TWIBBON_FRAMES[0].id);
  const [frames, setFrames] = useState<Record<string, HTMLImageElement>>({});
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [transform, setTransform] = useState(DEFAULT_TWIBBON_TRANSFORM);
  const [busy, setBusy] = useState<"upload" | "download" | "share" | null>(
    null
  );
  const frameConfig =
    TWIBBON_FRAMES.find((item) => item.id === frameId) ?? TWIBBON_FRAMES[0];
  const size = useMemo(() => twibbonOutputSize(frameConfig), [frameConfig]);
  const frame = frames[frameConfig.id] ?? null;

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled(
      TWIBBON_FRAMES.map(
        async (item) => [item.id, await loadImage(item.src)] as const
      )
    ).then((results) => {
      if (cancelled) return;
      const loaded: Record<string, HTMLImageElement> = {};
      for (const result of results) {
        if (result.status === "fulfilled") {
          loaded[result.value[0]] = result.value[1];
        }
      }
      setFrames(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!photoUrl) return;
    return () => URL.revokeObjectURL(photoUrl);
  }, [photoUrl]);

  useEffect(() => {
    const context = canvasRef.current?.getContext("2d");
    if (context) drawTwibbon(context, size, photo, frame, transform, false);
  }, [size, photo, frame, transform]);

  function update(next: (prev: TwibbonTransform) => TwibbonTransform) {
    setTransform((prev) => clampTwibbonTransform(next(prev), photo, size));
  }

  function move(dx: number, dy: number) {
    update((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
  }

  function zoomBy(factor: number) {
    update((prev) => ({ ...prev, zoom: prev.zoom * factor }));
  }

  function selectFrame(id: string) {
    const next = TWIBBON_FRAMES.find((item) => item.id === id);
    if (!next) return;
    setFrameId(id);
    setTransform((prev) =>
      clampTwibbonTransform(prev, photo, twibbonOutputSize(next))
    );
  }

  // Wheel needs a non-passive listener to keep the modal from scrolling while zooming.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !photo) return;

    function handleWheel(event: WheelEvent) {
      event.preventDefault();
      const factor = Math.exp(-event.deltaY * 0.0015);
      setTransform((prev) =>
        clampTwibbonTransform(
          { ...prev, zoom: prev.zoom * factor },
          photo,
          size
        )
      );
    }
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [photo, size]);

  function openPicker() {
    if (busy !== "upload") fileInputRef.current?.click();
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!PHOTO_TYPES.includes(file.type)) {
      toast.error("Format foto hanya JPG, PNG, atau WEBP.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error("Ukuran foto maksimal 20MB.");
      return;
    }

    setBusy("upload");
    let url: string | null = null;
    try {
      const optimized = await optimizeImage(file, "twibbon_photo");
      url = URL.createObjectURL(optimized);
      const image = await loadImage(url);
      setPhoto(image);
      setPhotoUrl(url);
      setTransform(DEFAULT_TWIBBON_TRANSFORM);
    } catch (error) {
      if (url) URL.revokeObjectURL(url);
      toast.error(
        error instanceof ImageOptimizationError
          ? error.message
          : "Foto tidak dapat dibaca."
      );
    } finally {
      setBusy(null);
    }
  }

  function removePhoto() {
    setPhoto(null);
    setPhotoUrl(null);
    setTransform(DEFAULT_TWIBBON_TRANSFORM);
  }

  function canvasScale() {
    const rect = canvasRef.current?.getBoundingClientRect();
    return rect && rect.width ? size.width / rect.width : 1;
  }

  function handlePointerDown(event: PointerEvent<HTMLCanvasElement>) {
    if (!photo) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
  }

  function handlePointerMove(event: PointerEvent<HTMLCanvasElement>) {
    const pointers = pointersRef.current;
    const previous = pointers.get(event.pointerId);
    if (!previous) return;

    const current = { x: event.clientX, y: event.clientY };
    if (pointers.size === 1) {
      const scale = canvasScale();
      move((current.x - previous.x) * scale, (current.y - previous.y) * scale);
    } else if (pointers.size === 2) {
      const other = [...pointers.entries()].find(
        ([id]) => id !== event.pointerId
      )?.[1];
      if (other) {
        const before = Math.hypot(previous.x - other.x, previous.y - other.y);
        const after = Math.hypot(current.x - other.x, current.y - other.y);
        if (before > 0) zoomBy(after / before);
      }
    }
    pointers.set(event.pointerId, current);
  }

  function handlePointerEnd(event: PointerEvent<HTMLCanvasElement>) {
    pointersRef.current.delete(event.pointerId);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLCanvasElement>) {
    if (!photo) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPicker();
      }
      return;
    }
    const actions: Record<string, () => void> = {
      ArrowLeft: () => move(-MOVE_STEP, 0),
      ArrowRight: () => move(MOVE_STEP, 0),
      ArrowUp: () => move(0, -MOVE_STEP),
      ArrowDown: () => move(0, MOVE_STEP),
      "+": () => zoomBy(ZOOM_STEP),
      "=": () => zoomBy(ZOOM_STEP),
      "-": () => zoomBy(1 / ZOOM_STEP),
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  }

  async function handleDownload() {
    if (!photo) return;
    setBusy("download");
    try {
      const blob = await renderTwibbonBlob(size, photo, frame, transform);
      await downloadImageBlob(blob, FILE_NAME, "Twibbon Kongres XXXIII");
    } catch (error) {
      if ((error as Error)?.name !== "AbortError") {
        toast.error("Gagal mengunduh twibbon.");
      }
    } finally {
      setBusy(null);
    }
  }

  async function handleShareToFeed() {
    if (!photo) return;
    setBusy("share");
    try {
      const blob = await renderTwibbonBlob(size, photo, frame, transform);
      const dataUrl = await blobToDataUrl(blob);
      window.sessionStorage.setItem(COMPOSE_INTENT_PHOTO_KEY, dataUrl);
      window.sessionStorage.setItem(COMPOSE_INTENT_KEY, "1");
      onClose();
      if (pathname === "/") window.dispatchEvent(new Event(COMPOSE_INTENT_KEY));
      else router.push("/");
    } catch {
      window.sessionStorage.removeItem(COMPOSE_INTENT_PHOTO_KEY);
      toast.error("Gagal menyiapkan twibbon untuk diposting.");
    } finally {
      setBusy(null);
    }
  }

  const ratio = size.width / size.height;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div
        className="relative mx-auto w-full"
        style={{
          aspectRatio: `${size.width} / ${size.height}`,
          maxWidth: `calc(${PREVIEW_MAX_HEIGHT} * ${ratio})`,
        }}
      >
        <canvas
          ref={canvasRef}
          width={size.width}
          height={size.height}
          tabIndex={0}
          role={photo ? undefined : "button"}
          aria-label={
            photo
              ? "Pratinjau twibbon. Geser untuk memindah foto, cubit atau scroll untuk zoom."
              : "Unggah foto untuk twibbon"
          }
          onClick={() => {
            if (!photo) openPicker();
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onKeyDown={handleKeyDown}
          className={[
            "absolute inset-0 size-full touch-none rounded-xl border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            CHECKERBOARD_CLASS,
            photo ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
          ].join(" ")}
        />
        <div className="absolute right-3 top-3 flex gap-2">
          {photo ? (
            <>
              <Button
                type="button"
                variant="light"
                size="sm"
                onClick={openPicker}
                disabled={busy !== null}
              >
                <IconReplace className="size-4" />
                {busy === "upload" ? "Memproses..." : "Ganti Foto"}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={removePhoto}
                disabled={busy !== null}
              >
                <IconTrash className="size-4" />
                Hapus
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="light"
              size="sm"
              onClick={openPicker}
              disabled={busy === "upload"}
            >
              <IconPhotoUp className="size-4" />
              {busy === "upload" ? "Memproses..." : "Unggah Foto"}
            </Button>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-5">
        <section>
          <h3 className="text-sm font-semibold text-heading">Pilih Frame</h3>
          <div className="mt-2 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TWIBBON_FRAMES.map((item) => {
              const selected = item.id === frameConfig.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectFrame(item.id)}
                  aria-pressed={selected}
                  className="flex shrink-0 cursor-pointer flex-col items-center gap-1.5"
                >
                  {/* Every thumbnail shares one height; a long frame only grows wider. */}
                  <Image
                    src={item.src}
                    alt=""
                    width={item.width}
                    height={item.height}
                    sizes="200px"
                    className={[
                      "h-20 w-auto max-w-none rounded-lg border transition",
                      CHECKERBOARD_CLASS,
                      selected
                        ? "border-primary ring-2 ring-primary"
                        : "border-border hover:border-border-strong",
                    ].join(" ")}
                  />
                  <span
                    className={[
                      "w-0 min-w-full truncate text-center text-xs",
                      selected
                        ? "font-semibold text-primary"
                        : "text-muted-foreground",
                    ].join(" ")}
                  >
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-heading">
            Cara Mengatur Foto
          </h3>
          <ul className="mt-2 flex flex-col gap-2.5 text-sm text-muted-foreground">
            {INSTRUCTIONS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-2.5">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-foreground">
                  <Icon className="size-4" />
                </span>
                <span className="pt-1">{text}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-auto grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="soft"
            onClick={handleDownload}
            disabled={!photo || busy !== null}
          >
            <IconDownload className="size-4" />
            {busy === "download" ? "Menyiapkan..." : "Unduh"}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleShareToFeed}
            disabled={!photo || busy !== null || !canShareToFeed}
          >
            <IconShare2 className="size-4" />
            {busy === "share" ? "Menyiapkan..." : "Bagikan ke Feed"}
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={PHOTO_TYPES.join(",")}
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
