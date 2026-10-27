"use client";

import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  FileText,
  ListTree,
  LoaderCircle,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  Search,
  X,
} from "lucide-react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import { useRouter } from "next/navigation";
import {
  type CSSProperties,
  FormEvent,
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { DocumentOutlineItem } from "@/apis/organizational-documents";
import BackButton from "../buttons/BackButton";
import Button from "../buttons/Button";
import PageMargin from "../common/PageMargin";

// 100% is fit-to-width; the page never shrinks below the reader's width.
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;
const PAGE_GAP = 12;
const MAX_MATCHES = 500;

interface OutlineItem {
  id: string;
  title: string;
  page: number;
  children?: OutlineItem[];
}

interface PageSize {
  width: number;
  height: number;
}

// One text run on a page, positioned in scale-1 viewport pixels.
interface PositionedText {
  str: string;
  x: number;
  top: number;
  width: number;
  height: number;
}

interface PageIndex {
  items: PositionedText[];
  text: string;
  raw: string[];
  itemOf: number[];
  offsetOf: number[];
}

interface HighlightRect {
  x: number;
  top: number;
  width: number;
  height: number;
}

interface SearchMatch {
  page: number;
  rects: HighlightRect[];
  snippet: string;
}

// Keys come from the item's position, since titles repeat (every BAB has a "Pasal 1").
function toOutlineItems(
  items: DocumentOutlineItem[],
  prefix = "toc"
): OutlineItem[] {
  return items.map((item, index) => {
    const id = `${prefix}-${index}`;
    return {
      id,
      title: item.title,
      page: item.page,
      children: item.children?.length
        ? toOutlineItems(item.children, id)
        : undefined,
    };
  });
}

type PdfOutlineNode = Awaited<
  ReturnType<PDFDocumentProxy["getOutline"]>
>[number];

// Falls back to the PDF's own bookmarks when the backend stores no table of contents.
async function readPdfOutline(
  documentProxy: PDFDocumentProxy,
  nodes: PdfOutlineNode[],
  prefix = "pdf"
): Promise<OutlineItem[]> {
  const items: OutlineItem[] = [];
  for (const [index, node] of nodes.entries()) {
    try {
      const destination =
        typeof node.dest === "string"
          ? await documentProxy.getDestination(node.dest)
          : node.dest;
      const ref = destination?.[0];
      if (!ref) continue;
      const pageIndex =
        typeof ref === "number"
          ? ref
          : await documentProxy.getPageIndex(
              ref as Parameters<PDFDocumentProxy["getPageIndex"]>[0]
            );
      const id = `${prefix}-${index}`;
      const children = node.items?.length
        ? await readPdfOutline(documentProxy, node.items, id)
        : [];
      items.push({
        id,
        title: node.title,
        page: pageIndex + 1,
        children: children.length ? children : undefined,
      });
    } catch {
      continue;
    }
  }
  return items;
}

function normalizeSearchText(value: string) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("id-ID");
}

function multiplyTransform(m1: number[], m2: number[]) {
  return [
    m1[0] * m2[0] + m1[2] * m2[1],
    m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3],
    m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
  ];
}

// Normalized search text keeps a per-character map back to its text run, so a match can be drawn.
function buildPageIndex(items: PositionedText[], eols: boolean[]): PageIndex {
  let text = "";
  const raw: string[] = [];
  const itemOf: number[] = [];
  const offsetOf: number[] = [];
  let lastSpace = true;

  function push(char: string, rawChar: string, item: number, offset: number) {
    text += char;
    raw.push(rawChar);
    itemOf.push(item);
    offsetOf.push(offset);
  }

  items.forEach((item, itemIndex) => {
    for (let offset = 0; offset < item.str.length; offset++) {
      const char = item.str[offset];
      if (/\s/.test(char)) {
        if (!lastSpace) push(" ", " ", itemIndex, offset);
        lastSpace = true;
        continue;
      }
      const normalized = normalizeSearchText(char);
      for (let k = 0; k < normalized.length; k++) {
        push(normalized[k], k === 0 ? char : "", itemIndex, offset);
      }
      if (normalized.length > 0) lastSpace = false;
    }
    if (eols[itemIndex] && !lastSpace) {
      push(" ", " ", -1, -1);
      lastSpace = true;
    }
  });

  return { items, text, raw, itemOf, offsetOf };
}

function findMatches(pages: PageIndex[], query: string): SearchMatch[] {
  const matches: SearchMatch[] = [];
  for (const [pageIndex, page] of pages.entries()) {
    let from = 0;
    while (matches.length < MAX_MATCHES) {
      const start = page.text.indexOf(query, from);
      if (start < 0) break;
      const end = start + query.length;
      from = end;

      const spans = new Map<number, { min: number; max: number }>();
      for (let i = start; i < end; i++) {
        const item = page.itemOf[i];
        if (item < 0) continue;
        const span = spans.get(item);
        const offset = page.offsetOf[i];
        if (!span) spans.set(item, { min: offset, max: offset });
        else span.max = Math.max(span.max, offset);
      }
      const rects = [...spans.entries()].map(([item, span]) => {
        const run = page.items[item];
        const unit = run.str.length ? run.width / run.str.length : 0;
        return {
          x: run.x + unit * span.min,
          top: run.top,
          width: Math.max(unit * (span.max + 1 - span.min), 2),
          height: run.height,
        };
      });

      const snippetStart = Math.max(0, start - 54);
      const snippetEnd = Math.min(page.text.length, end + 62);
      const snippet = page.raw.slice(snippetStart, snippetEnd).join("").trim();
      matches.push({
        page: pageIndex + 1,
        rects,
        snippet: `${snippetStart > 0 ? "..." : ""}${snippet}${snippetEnd < page.text.length ? "..." : ""}`,
      });
    }
  }
  return matches;
}

function flattenOutline(items: OutlineItem[]): OutlineItem[] {
  return items.flatMap((item) => [
    item,
    ...flattenOutline(item.children ?? []),
  ]);
}

function OutlineRow({
  item,
  depth,
  activeId,
  onNavigate,
}: {
  item: OutlineItem;
  depth: number;
  activeId: string | null;
  onNavigate: (item: OutlineItem) => void;
}) {
  const [open, setOpen] = useState(depth === 0);
  const hasChildren = Boolean(item.children?.length);
  const isCurrent = item.id === activeId;

  return (
    <li>
      <div
        className={`group flex min-h-9 items-center rounded-lg pr-2 transition-colors ${
          isCurrent
            ? "bg-primary-soft text-primary-foreground"
            : "text-body hover:bg-surface-muted"
        }`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={`${open ? "Tutup" : "Buka"} ${item.title}`}
            aria-expanded={open}
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-heading"
          >
            <ChevronDown
              className={`size-3.5 transition-transform ${open ? "" : "-rotate-90"}`}
            />
          </button>
        ) : (
          <span className="w-7 shrink-0" />
        )}
        <button
          type="button"
          onClick={() => onNavigate(item)}
          aria-current={isCurrent ? "location" : undefined}
          className={`min-w-0 flex-1 py-2 text-left text-[13px] leading-5 ${
            depth === 0 ? "font-semibold" : "font-medium"
          }`}
        >
          {item.title}
        </button>
        <span className="ml-2 text-xs tabular-nums text-muted-foreground">
          {item.page}
        </span>
      </div>
      {hasChildren && open && (
        <ul>
          {item.children!.map((child) => (
            <OutlineRow
              key={child.id}
              item={child}
              depth={depth + 1}
              activeId={activeId}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function TableOfContents({
  outline,
  activeId,
  onNavigate,
  onClose,
}: {
  outline: OutlineItem[];
  activeId: string | null;
  onNavigate: (item: OutlineItem) => void;
  onClose?: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2">
          <ListTree className="size-4 text-primary" />
          <h2 className="font-stack-sans-headline text-base font-semibold text-heading">
            Daftar isi
          </h2>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup daftar isi"
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-muted hover:text-heading xl:hidden"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <nav
        aria-label="Daftar isi dokumen"
        className="min-h-0 flex-1 overflow-y-auto p-3"
      >
        <ul className="space-y-0.5">
          {outline.map((item) => (
            <OutlineRow
              key={item.id}
              item={item}
              depth={0}
              activeId={activeId}
              onNavigate={(target) => {
                onNavigate(target);
                onClose?.();
              }}
            />
          ))}
        </ul>
      </nav>
    </div>
  );
}

// Draws its canvas only while near the viewport, so a long document doesn't hold every page in memory.
const PdfPage = memo(function PdfPage({
  documentProxy,
  pageNumber,
  baseWidth,
  baseHeight,
  scale,
  scrollArea,
  highlights,
  activeRects,
  registerPage,
}: {
  documentProxy: PDFDocumentProxy;
  pageNumber: number;
  baseWidth: number;
  baseHeight: number;
  scale: number;
  scrollArea: HTMLDivElement | null;
  highlights: HighlightRect[];
  activeRects: HighlightRect[];
  registerPage: (page: number, element: HTMLDivElement | null) => void;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [near, setNear] = useState(pageNumber <= 2);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || !scrollArea) return;
    const observer = new IntersectionObserver(
      ([entry]) => setNear(entry.isIntersecting),
      { root: scrollArea, rootMargin: "1200px 0px" }
    );
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [scrollArea]);

  useEffect(() => {
    if (!near || !canvasRef.current) return;
    let active = true;
    let renderTask: RenderTask | null = null;

    async function renderPage() {
      try {
        const page = await documentProxy.getPage(pageNumber);
        if (!active || !canvasRef.current) return;
        const viewport = page.getViewport({ scale });
        const outputScale = Math.min(window.devicePixelRatio || 1, 2);
        // Drawn offscreen and swapped in, so a zoom keeps the stretched old bitmap instead of flashing blank.
        const offscreen = document.createElement("canvas");
        const context = offscreen.getContext("2d", { alpha: false });
        if (!context) return;
        offscreen.width = Math.floor(viewport.width * outputScale);
        offscreen.height = Math.floor(viewport.height * outputScale);
        renderTask = page.render({
          canvas: null,
          canvasContext: context,
          viewport,
          transform:
            outputScale === 1
              ? undefined
              : [outputScale, 0, 0, outputScale, 0, 0],
          background: "#ffffff",
        });
        await renderTask.promise;
        const visible = canvasRef.current;
        if (!active || !visible) return;
        visible.width = offscreen.width;
        visible.height = offscreen.height;
        visible.getContext("2d", { alpha: false })?.drawImage(offscreen, 0, 0);
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "RenderingCancelledException"
        )
          return;
        console.error(
          "[OrganizationalDocumentDetailPage] render page threw:",
          error
        );
      }
    }

    void renderPage();
    return () => {
      active = false;
      renderTask?.cancel();
    };
  }, [documentProxy, near, pageNumber, scale]);

  const width = Math.floor(baseWidth * scale);
  const height = Math.floor(baseHeight * scale);

  return (
    <div
      ref={(element) => {
        wrapperRef.current = element;
        registerPage(pageNumber, element);
      }}
      className="relative mx-auto shrink-0 overflow-hidden rounded-[3px] bg-white shadow-[0_10px_30px_-6px_rgba(16,24,40,0.22),0_2px_6px_rgba(16,24,40,0.08)]"
      style={{ width, height }}
    >
      <span className="absolute inset-0 flex items-center justify-center text-sm tabular-nums text-[#9aa3b2]">
        {pageNumber}
      </span>
      {near && (
        <canvas
          ref={canvasRef}
          aria-label={`Halaman ${pageNumber} dari dokumen`}
          className="relative block"
          style={{ width, height }}
        />
      )}
      {highlights.map((rect, index) => (
        <span
          key={`hit-${index}`}
          aria-hidden="true"
          className="pointer-events-none absolute rounded-[2px] bg-[#ffe600]/45 mix-blend-multiply"
          style={{
            left: rect.x * scale,
            top: rect.top * scale,
            width: rect.width * scale,
            height: rect.height * scale,
          }}
        />
      ))}
      {activeRects.map((rect, index) => (
        <span
          key={`active-${index}`}
          aria-hidden="true"
          className="pointer-events-none absolute rounded-[2px] bg-[#ff9f0a]/55 ring-2 ring-[#ff9f0a] mix-blend-multiply"
          style={{
            left: rect.x * scale,
            top: rect.top * scale,
            width: rect.width * scale,
            height: rect.height * scale,
          }}
        />
      ))}
    </div>
  );
});

interface OrganizationalDocumentDetailPageProps {
  document: {
    title: string;
    fileUrl: string;
    tableOfContents: DocumentOutlineItem[];
  };
}

// A point on a page, and where it sat inside the scroll area, so a zoom can keep it in place.
interface ZoomAnchor {
  page: number;
  fx: number;
  fy: number;
  midX: number;
  midY: number;
}

interface PinchGesture extends ZoomAnchor {
  startZoom: number;
  target: number;
  startDistance: number;
  wheelRatio: number;
}

interface PendingZoom extends ZoomAnchor {
  // How large the pages looked just before the commit, relative to their new size.
  fromVisual: number;
}

const ZOOM_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
const ZOOM_TRANSITION_MS = 280;

function captureAnchor(
  area: HTMLDivElement,
  pages: (HTMLDivElement | null)[],
  midX: number,
  midY: number
): ZoomAnchor | null {
  const contentY = area.scrollTop + midY;
  let page = 1;
  pages.forEach((element, index) => {
    if (element && element.offsetTop <= contentY) page = index + 1;
  });
  const element = pages[page - 1];
  if (!element) return null;
  return {
    page,
    fx: (area.scrollLeft + midX - element.offsetLeft) / element.offsetWidth,
    fy: (contentY - element.offsetTop) / element.offsetHeight,
    midX,
    midY,
  };
}

function resetZoomTransform(wrapper: HTMLDivElement) {
  delete wrapper.dataset.zoomRun;
  wrapper.style.transition = "";
  wrapper.style.transform = "";
  wrapper.style.transformOrigin = "";
  wrapper.style.willChange = "";
}

// FLIP: start from how the pages looked a frame ago, then ease to their real layout.
function playZoomTransition(
  wrapper: HTMLDivElement,
  originX: number,
  originY: number,
  dx: number,
  dy: number,
  fromScale: number
) {
  if (
    Math.abs(dx) < 0.5 &&
    Math.abs(dy) < 0.5 &&
    Math.abs(fromScale - 1) < 0.002
  ) {
    resetZoomTransform(wrapper);
    return;
  }
  const run = String(Math.random());
  wrapper.dataset.zoomRun = run;
  wrapper.style.transition = "none";
  wrapper.style.willChange = "transform";
  wrapper.style.transformOrigin = `${originX}px ${originY}px`;
  wrapper.style.transform = `translate(${dx}px, ${dy}px) scale(${fromScale})`;
  void wrapper.offsetWidth;
  wrapper.style.transition = `transform ${ZOOM_TRANSITION_MS}ms ${ZOOM_EASING}`;
  wrapper.style.transform = "";
  // A newer pinch owns the wrapper once it starts, so only this run may clean up after itself.
  const finish = () => {
    wrapper.removeEventListener("transitionend", finish);
    if (wrapper.dataset.zoomRun === run) resetZoomTransform(wrapper);
  };
  wrapper.addEventListener("transitionend", finish);
  setTimeout(finish, ZOOM_TRANSITION_MS + 80);
}

const NO_RECTS: HighlightRect[] = [];
const FALLBACK_PAGE_SIZE: PageSize = { width: 595, height: 842 };
// Glass surface shared by every floating mobile control.
const FLOATING_SURFACE =
  "bg-surface/85 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10 shadow-[0_14px_36px_-10px_rgba(16,24,40,0.4),0_3px_8px_rgba(16,24,40,0.1)]";

function clampZoom(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

function subscribeNothing() {
  return () => {};
}

export default function OrganizationalDocumentDetailPage({
  document: organizationalDocument,
}: OrganizationalDocumentDetailPageProps) {
  const { title, fileUrl, tableOfContents } = organizationalDocument;
  const router = useRouter();
  const viewerRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pageInputFocused = useRef(false);
  const scrollAnchor = useRef({ page: 1, fraction: 0 });
  const pendingZoom = useRef<PendingZoom | null>(null);
  const zoomRef = useRef(1);
  const scrollFrame = useRef(0);
  const zoomHintTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const [scrollArea, setScrollArea] = useState<HTMLDivElement | null>(null);
  const [documentProxy, setDocumentProxy] = useState<PDFDocumentProxy | null>(
    null
  );
  const [firstPageSize, setFirstPageSize] = useState<PageSize | null>(null);
  const [pageSizes, setPageSizes] = useState<PageSize[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [zoom, setZoom] = useState(1);
  const [gestureZoom, setGestureZoom] = useState<number | null>(null);
  const [zoomHintVisible, setZoomHintVisible] = useState(false);
  const [areaWidth, setAreaWidth] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pageIndexes, setPageIndexes] = useState<PageIndex[]>([]);
  const [indexedPages, setIndexedPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchResult, setActiveSearchResult] = useState(0);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenEnabled = useSyncExternalStore(
    subscribeNothing,
    () => document.fullscreenEnabled,
    () => false
  );
  const storedOutline = useMemo(
    () => toOutlineItems(tableOfContents),
    [tableOfContents]
  );
  const [pdfOutline, setPdfOutline] = useState<OutlineItem[]>([]);
  const outline = storedOutline.length > 0 ? storedOutline : pdfOutline;
  const hasOutline = outline.length > 0;
  const flatOutline = useMemo(() => flattenOutline(outline), [outline]);
  const [tocSelection, setTocSelection] = useState<OutlineItem | null>(null);
  const deferredQuery = useDeferredValue(searchQuery);
  const totalPages = documentProxy?.numPages ?? 0;
  const displayZoom = gestureZoom ?? zoom;

  function sizeOf(page: number): PageSize {
    const size = pageSizes[page - 1];
    return (size?.width ? size : null) ?? firstPageSize ?? FALLBACK_PAGE_SIZE;
  }

  // Each page fits areaWidth (the content box) on its own, so a landscape page can't widen the column.
  function scaleOf(page: number) {
    return areaWidth > 0 ? (areaWidth / sizeOf(page).width) * zoom : zoom;
  }

  const registerPage = useCallback(
    (page: number, element: HTMLDivElement | null) => {
      pageRefs.current[page - 1] = element;
    },
    []
  );

  function commitZoom(value: number) {
    zoomRef.current = value;
    setZoom(value);
  }

  useEffect(() => {
    let active = true;
    let loadingTask: ReturnType<
      (typeof import("pdfjs-dist"))["getDocument"]
    > | null = null;

    async function loadDocument() {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/documents/pdf.worker.min.mjs";
        loadingTask = pdfjs.getDocument(fileUrl);
        const loadedDocument = await loadingTask.promise;
        const firstPage = await loadedDocument.getPage(1);
        if (!active) {
          await loadedDocument.destroy();
          return;
        }
        const viewport = firstPage.getViewport({ scale: 1 });
        setFirstPageSize({ width: viewport.width, height: viewport.height });
        setDocumentProxy(loadedDocument);
      } catch (error) {
        console.error(
          "[OrganizationalDocumentDetailPage] load PDF threw:",
          error
        );
        if (active)
          setLoadError(
            "Dokumen tidak dapat dimuat. Coba muat ulang halaman ini."
          );
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadDocument();
    return () => {
      active = false;
      void loadingTask?.destroy();
    };
  }, [fileUrl]);

  useEffect(() => {
    if (!documentProxy || storedOutline.length > 0) return;
    let active = true;
    documentProxy
      .getOutline()
      .then((nodes) =>
        nodes?.length ? readPdfOutline(documentProxy, nodes) : []
      )
      .then((items) => {
        if (active) setPdfOutline(items);
      })
      .catch((error) =>
        console.error(
          "[OrganizationalDocumentDetailPage] read outline threw:",
          error
        )
      );
    return () => {
      active = false;
    };
  }, [documentProxy, storedOutline.length]);

  useEffect(() => {
    if (!scrollArea) return;
    const observer = new ResizeObserver(([entry]) =>
      setAreaWidth(entry.contentRect.width)
    );
    observer.observe(scrollArea);
    return () => observer.disconnect();
  }, [scrollArea]);

  // Indexes every page's text and size once, in the background, for search and highlights.
  useEffect(() => {
    if (!documentProxy) return;
    let active = true;
    let nextPage = 1;
    const indexes: PageIndex[] = Array.from(
      { length: documentProxy.numPages },
      () => buildPageIndex([], [])
    );
    const sizes: PageSize[] = Array.from(
      { length: documentProxy.numPages },
      () => ({ width: 0, height: 0 })
    );

    async function indexWorker() {
      while (active) {
        const page = nextPage++;
        if (page > documentProxy!.numPages) return;
        const pdfPage = await documentProxy!.getPage(page);
        const viewport = pdfPage.getViewport({ scale: 1 });
        sizes[page - 1] = { width: viewport.width, height: viewport.height };
        const content = await pdfPage.getTextContent();
        const items: PositionedText[] = [];
        const eols: boolean[] = [];
        for (const item of content.items) {
          if (!("str" in item)) continue;
          const tx = multiplyTransform(viewport.transform, item.transform);
          const fontHeight = Math.hypot(tx[2], tx[3]);
          items.push({
            str: item.str,
            x: tx[4],
            top: tx[5] - fontHeight * 0.9,
            width: item.width,
            height: fontHeight * 1.15,
          });
          eols.push(item.hasEOL);
        }
        indexes[page - 1] = buildPageIndex(items, eols);
        if (active) setIndexedPages((count) => count + 1);
      }
    }

    Promise.all(Array.from({ length: 4 }, () => indexWorker()))
      .then(() => {
        if (!active) return;
        setPageIndexes(indexes);
        setPageSizes(sizes);
      })
      .catch((error) =>
        console.error(
          "[OrganizationalDocumentDetailPage] index PDF threw:",
          error
        )
      );

    return () => {
      active = false;
    };
  }, [documentProxy]);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === viewerRef.current);
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Pinch (touch) and ctrl/trackpad wheel scale the pages live, then commit the zoom they ended on.
  useEffect(() => {
    if (!scrollArea) return;
    const area = scrollArea;
    let gesture: PinchGesture | null = null;
    let frame = 0;
    let wheelTimer: ReturnType<typeof setTimeout> | undefined;

    function begin(clientX: number, clientY: number, startDistance: number) {
      const wrapper = pagesRef.current;
      if (!wrapper) return null;
      const bounds = area.getBoundingClientRect();
      const midX = clientX - bounds.left;
      const midY = clientY - bounds.top;
      const anchor = captureAnchor(area, pageRefs.current, midX, midY);
      if (!anchor) return null;
      delete wrapper.dataset.zoomRun;
      wrapper.style.transition = "none";
      wrapper.style.transform = "";
      wrapper.style.transformOrigin = `${area.scrollLeft + midX - wrapper.offsetLeft}px ${area.scrollTop + midY - wrapper.offsetTop}px`;
      wrapper.style.willChange = "transform";
      clearTimeout(zoomHintTimer.current);
      setZoomHintVisible(true);
      return {
        ...anchor,
        startZoom: zoomRef.current,
        target: zoomRef.current,
        startDistance,
        wheelRatio: 1,
      };
    }

    function update(current: PinchGesture, ratio: number) {
      current.target = clampZoom(current.startZoom * ratio);
      const wrapper = pagesRef.current;
      if (wrapper)
        wrapper.style.transform = `scale(${current.target / current.startZoom})`;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setGestureZoom(current.target));
    }

    function end(current: PinchGesture) {
      cancelAnimationFrame(frame);
      const shown = current.target;
      const target = shown < MIN_ZOOM + 0.03 ? MIN_ZOOM : shown;
      const wrapper = pagesRef.current;
      if (Math.abs(target - current.startZoom) > 0.001) {
        pendingZoom.current = { ...current, fromVisual: shown / target };
        zoomRef.current = target;
        setZoom(target);
      } else if (wrapper) {
        const run = String(Math.random());
        wrapper.dataset.zoomRun = run;
        wrapper.style.transition = `transform ${ZOOM_TRANSITION_MS}ms ${ZOOM_EASING}`;
        wrapper.style.transform = "";
        setTimeout(() => {
          if (wrapper.dataset.zoomRun === run) resetZoomTransform(wrapper);
        }, ZOOM_TRANSITION_MS + 80);
      }
      setGestureZoom(null);
      zoomHintTimer.current = setTimeout(() => setZoomHintVisible(false), 900);
    }

    function distance(touches: TouchList) {
      return Math.hypot(
        touches[0].clientX - touches[1].clientX,
        touches[0].clientY - touches[1].clientY
      );
    }

    function handleTouchStart(event: TouchEvent) {
      if (event.touches.length !== 2) return;
      event.preventDefault();
      gesture = begin(
        (event.touches[0].clientX + event.touches[1].clientX) / 2,
        (event.touches[0].clientY + event.touches[1].clientY) / 2,
        distance(event.touches)
      );
    }

    function handleTouchMove(event: TouchEvent) {
      if (!gesture || event.touches.length !== 2) return;
      event.preventDefault();
      update(gesture, distance(event.touches) / gesture.startDistance);
    }

    function handleTouchEnd(event: TouchEvent) {
      if (!gesture || event.touches.length >= 2) return;
      end(gesture);
      gesture = null;
    }

    function handleWheel(event: WheelEvent) {
      if (!event.ctrlKey) return;
      event.preventDefault();
      gesture ??= begin(event.clientX, event.clientY, 1);
      if (!gesture) return;
      gesture.wheelRatio *= Math.exp(-event.deltaY * 0.01);
      update(gesture, gesture.wheelRatio);
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        if (gesture) end(gesture);
        gesture = null;
      }, 160);
    }

    area.addEventListener("touchstart", handleTouchStart, { passive: false });
    area.addEventListener("touchmove", handleTouchMove, { passive: false });
    area.addEventListener("touchend", handleTouchEnd);
    area.addEventListener("touchcancel", handleTouchEnd);
    area.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(wheelTimer);
      area.removeEventListener("touchstart", handleTouchStart);
      area.removeEventListener("touchmove", handleTouchMove);
      area.removeEventListener("touchend", handleTouchEnd);
      area.removeEventListener("touchcancel", handleTouchEnd);
      area.removeEventListener("wheel", handleWheel);
    };
  }, [scrollArea]);

  useEffect(() => () => clearTimeout(zoomHintTimer.current), []);

  // Keeps the zoomed point, or else the same spot of the current page, in view when page heights change.
  useLayoutEffect(() => {
    if (!scrollArea) return;
    const pending = pendingZoom.current;
    pendingZoom.current = null;
    if (pending) {
      const element = pageRefs.current[pending.page - 1];
      const wrapper = pagesRef.current;
      if (!element) return;
      const pointX = element.offsetLeft + pending.fx * element.offsetWidth;
      const pointY = element.offsetTop + pending.fy * element.offsetHeight;
      scrollArea.scrollTo({
        left: zoom > MIN_ZOOM ? pointX - pending.midX : 0,
        top: pointY - pending.midY,
      });
      if (!wrapper) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        resetZoomTransform(wrapper);
        return;
      }
      playZoomTransition(
        wrapper,
        pointX - wrapper.offsetLeft,
        pointY - wrapper.offsetTop,
        pending.midX - (pointX - scrollArea.scrollLeft),
        pending.midY - (pointY - scrollArea.scrollTop),
        pending.fromVisual
      );
      return;
    }
    const element = pageRefs.current[scrollAnchor.current.page - 1];
    if (!element) return;
    scrollArea.scrollTo({
      top:
        element.offsetTop +
        scrollAnchor.current.fraction * element.offsetHeight -
        PAGE_GAP,
      ...(zoom > MIN_ZOOM ? {} : { left: 0 }),
    });
  }, [areaWidth, pageSizes, scrollArea, zoom]);

  const normalizedQuery = normalizeSearchText(deferredQuery)
    .replace(/\s+/g, " ")
    .trim();
  const searchResults = useMemo(
    () =>
      normalizedQuery.length < 2 || pageIndexes.length === 0
        ? []
        : findMatches(pageIndexes, normalizedQuery),
    [normalizedQuery, pageIndexes]
  );
  const highlightsByPage = useMemo(() => {
    const byPage = new Map<number, HighlightRect[]>();
    for (const match of searchResults) {
      byPage.set(match.page, [
        ...(byPage.get(match.page) ?? []),
        ...match.rects,
      ]);
    }
    return byPage;
  }, [searchResults]);
  const activeMatch = searchResults[activeSearchResult];
  // One highlighted entry: the clicked one while it's on screen, else the last entry starting at or before this page.
  const activeTocId =
    tocSelection?.page === pageNumber
      ? tocSelection.id
      : (flatOutline.findLast((item) => item.page <= pageNumber)?.id ?? null);
  const indexing = totalPages > 0 && indexedPages < totalPages;
  const searchStatus = indexing
    ? `Mengindeks ${indexedPages}/${totalPages} halaman...`
    : searchResults.length > 0
      ? `${activeSearchResult + 1} dari ${searchResults.length}${searchResults.length >= MAX_MATCHES ? "+" : ""} hasil`
      : "Kata tidak ditemukan";

  function handleScroll() {
    cancelAnimationFrame(scrollFrame.current);
    scrollFrame.current = requestAnimationFrame(() => {
      if (!scrollArea) return;
      const probe = scrollArea.scrollTop + scrollArea.clientHeight * 0.3;
      const elements = pageRefs.current;
      let current = 1;
      for (let i = 0; i < totalPages; i++) {
        const element = elements[i];
        if (!element) continue;
        if (element.offsetTop <= probe) current = i + 1;
        else break;
      }
      const element = elements[current - 1];
      if (element) {
        scrollAnchor.current = {
          page: current,
          fraction: Math.max(
            0,
            (scrollArea.scrollTop + PAGE_GAP - element.offsetTop) /
              element.offsetHeight
          ),
        };
      }
      if (current !== pageNumber) {
        setPageNumber(current);
        if (!pageInputFocused.current) setPageInput(String(current));
      }
    });
  }

  function scrollToOffset(page: number, offset: number) {
    const element = pageRefs.current[page - 1];
    if (!scrollArea || !element) return;
    scrollArea.scrollTo({
      top: Math.max(0, element.offsetTop + offset),
      behavior: "smooth",
    });
  }

  function navigateToPage(page: number) {
    if (!totalPages) return;
    const nextPage = Math.min(totalPages, Math.max(1, Math.round(page)));
    setPageNumber(nextPage);
    setPageInput(String(nextPage));
    scrollToOffset(nextPage, -PAGE_GAP);
  }

  function navigateToOutlineItem(item: OutlineItem) {
    setTocSelection(item);
    navigateToPage(item.page);
  }

  function showMatch(index: number) {
    const match = searchResults[index];
    if (!match || !scrollArea) return;
    setActiveSearchResult(index);
    const top = (match.rects[0]?.top ?? 0) * scaleOf(match.page);
    scrollToOffset(match.page, top - scrollArea.clientHeight / 3);
  }

  function commitPageInput() {
    const parsed = Number(pageInput);
    if (!pageInput || !Number.isFinite(parsed)) {
      setPageInput(String(pageNumber));
      return;
    }
    navigateToPage(parsed);
  }

  function moveSearchResult(direction: 1 | -1) {
    if (searchResults.length === 0) return;
    showMatch(
      (activeSearchResult + direction + searchResults.length) %
        searchResults.length
    );
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    showMatch(activeSearchResult);
  }

  function changeSearch(value: string) {
    setSearchQuery(value);
    setActiveSearchResult(0);
  }

  function animateZoomTo(value: number) {
    const target = clampZoom(value);
    if (!scrollArea || Math.abs(target - zoomRef.current) < 0.001) return;
    const anchor = captureAnchor(
      scrollArea,
      pageRefs.current,
      scrollArea.clientWidth / 2,
      scrollArea.clientHeight / 2
    );
    if (anchor)
      pendingZoom.current = { ...anchor, fromVisual: zoomRef.current / target };
    commitZoom(target);
    clearTimeout(zoomHintTimer.current);
    setZoomHintVisible(true);
    zoomHintTimer.current = setTimeout(() => setZoomHintVisible(false), 900);
  }

  function stepZoom(direction: 1 | -1) {
    animateZoomTo(zoomRef.current + direction * ZOOM_STEP);
  }

  async function toggleFullscreen() {
    if (!viewerRef.current) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await viewerRef.current.requestFullscreen();
  }

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push("/organizational-documents");
  }

  const pageInputField = (className: string, style?: CSSProperties) => (
    <input
      style={style}
      type="text"
      inputMode="numeric"
      aria-label="Nomor halaman"
      value={pageInput}
      onChange={(event) => setPageInput(event.target.value.replace(/\D/g, ""))}
      onFocus={(event) => {
        pageInputFocused.current = true;
        event.currentTarget.select();
      }}
      onBlur={() => {
        pageInputFocused.current = false;
        commitPageInput();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
      }}
      className={className}
    />
  );

  const fullscreenLabel = isFullscreen
    ? "Keluar dari layar penuh"
    : "Buka layar penuh";

  return (
    // Mobile is a fixed full-screen reader, so sitewide banners above the page can't push its floating controls off-screen.
    <div className="fixed inset-x-0 top-0 z-30 flex h-dvh flex-col bg-surface lg:static lg:z-auto lg:block lg:h-auto lg:min-h-screen">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-surface px-2 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          aria-label="Kembali"
          className="rounded-full!"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-stack-sans-headline text-base font-medium text-heading">
            {title}
          </h1>
          <p className="text-xs text-muted-foreground">
            {totalPages ? `${totalPages} halaman` : "Memuat dokumen..."}
          </p>
        </div>
      </header>

      <PageMargin
        noMobilePadding
        className="flex min-h-0 flex-1 flex-col lg:block lg:py-6"
      >
        <div className="mb-4 hidden lg:block">
          <BackButton fallbackHref="/organizational-documents">
            Pedoman Organisasi
          </BackButton>
        </div>

        <div
          ref={viewerRef}
          className="relative flex min-h-0 flex-1 overflow-hidden bg-surface lg:h-[calc(100dvh-8rem)] lg:min-h-[620px] lg:rounded-xl lg:border lg:border-border lg:shadow-sm fullscreen:h-dvh fullscreen:min-h-0 fullscreen:rounded-none fullscreen:border-0"
        >
          <section className="relative flex min-w-0 flex-1 flex-col">
            <div className="hidden shrink-0 items-center gap-3 border-b border-border bg-surface px-4 py-2.5 lg:flex">
              <div className="mr-auto flex min-w-0 items-center gap-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-foreground">
                  <FileText className="size-4.5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-stack-sans-headline text-base font-medium text-heading">
                    {title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {totalPages || "—"} halaman
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="soft"
                  size="icon"
                  onClick={() => navigateToPage(pageNumber - 1)}
                  disabled={pageNumber <= 1}
                  aria-label="Halaman sebelumnya"
                  title="Halaman sebelumnya"
                  className="size-9!"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <label className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                  {pageInputField(
                    "h-9 w-12 rounded-lg border border-border-strong bg-surface px-2 text-center text-[13px] font-semibold tabular-nums text-heading outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                  )}
                  <span className="tabular-nums">/ {totalPages || "—"}</span>
                </label>
                <Button
                  variant="soft"
                  size="icon"
                  onClick={() => navigateToPage(pageNumber + 1)}
                  disabled={!totalPages || pageNumber >= totalPages}
                  aria-label="Halaman berikutnya"
                  title="Halaman berikutnya"
                  className="size-9!"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>

              <div className="flex items-center gap-1.5">
                <a
                  href={fileUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Unduh dokumen"
                  title="Unduh dokumen"
                  className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary-foreground transition hover:bg-primary-soft/80 active:scale-95"
                >
                  <Download className="size-4" />
                </a>
                {hasOutline && (
                  <Button
                    variant="soft"
                    size="icon"
                    onClick={() => setTocOpen(true)}
                    aria-label="Buka daftar isi"
                    title="Daftar isi"
                    className="size-9! xl:hidden"
                  >
                    <ListTree className="size-4" />
                  </Button>
                )}
                {fullscreenEnabled && (
                  <Button
                    variant="soft"
                    size="icon"
                    onClick={() => void toggleFullscreen()}
                    aria-label={fullscreenLabel}
                    title={fullscreenLabel}
                    className="size-9!"
                  >
                    {isFullscreen ? (
                      <Minimize2 className="size-4" />
                    ) : (
                      <Maximize2 className="size-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            <div className="hidden shrink-0 items-center gap-2 border-b border-border bg-surface-subtle px-4 py-2 lg:flex">
              <form
                onSubmit={submitSearch}
                className="relative min-w-0 max-w-sm flex-1"
              >
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => changeSearch(event.target.value)}
                  placeholder="Cari kata dalam dokumen..."
                  aria-label="Cari kata dalam dokumen"
                  className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-base text-heading outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </form>

              {normalizedQuery.length >= 2 && (
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="max-w-60 truncate text-[13px] text-muted-foreground">
                    {searchStatus}
                  </span>
                  <Button
                    variant="soft"
                    size="iconSm"
                    onClick={() => moveSearchResult(-1)}
                    disabled={searchResults.length === 0}
                    aria-label="Hasil pencarian sebelumnya"
                    title="Hasil sebelumnya"
                  >
                    <ChevronsLeft className="size-3.5" />
                  </Button>
                  <Button
                    variant="soft"
                    size="iconSm"
                    onClick={() => moveSearchResult(1)}
                    disabled={searchResults.length === 0}
                    aria-label="Hasil pencarian berikutnya"
                    title="Hasil berikutnya"
                  >
                    <ChevronsRight className="size-3.5" />
                  </Button>
                </div>
              )}

              <div className="ml-auto flex items-center gap-1">
                <Button
                  variant="soft"
                  size="iconSm"
                  onClick={() => stepZoom(-1)}
                  disabled={displayZoom <= MIN_ZOOM}
                  aria-label="Perkecil tampilan"
                  title="Perkecil"
                >
                  <Minus className="size-3.5" />
                </Button>
                <button
                  type="button"
                  onClick={() => animateZoomTo(MIN_ZOOM)}
                  title="Reset zoom"
                  className="min-w-14 px-1 text-center text-xs font-semibold tabular-nums text-heading"
                >
                  {Math.round(displayZoom * 100)}%
                </button>
                <Button
                  variant="soft"
                  size="iconSm"
                  onClick={() => stepZoom(1)}
                  disabled={displayZoom >= MAX_ZOOM}
                  aria-label="Perbesar tampilan"
                  title="Perbesar"
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>
            </div>

            {normalizedQuery.length >= 2 && activeMatch && !indexing && (
              <button
                type="button"
                onClick={() => showMatch(activeSearchResult)}
                className="hidden shrink-0 items-center gap-2 border-b border-border bg-primary-soft/60 px-4 py-2 text-left text-[13px] text-body hover:bg-primary-soft lg:flex"
              >
                <span className="shrink-0 font-semibold text-primary-foreground">
                  Halaman {activeMatch.page}
                </span>
                <span className="truncate">{activeMatch.snippet}</span>
              </button>
            )}

            <div
              ref={setScrollArea}
              onScroll={handleScroll}
              className={`relative min-h-0 flex-1 touch-pan-x touch-pan-y overscroll-contain bg-[#e9edf2] pb-28 pt-3 lg:px-6 lg:pb-4 lg:pt-4 ${
                zoom > MIN_ZOOM
                  ? "overflow-auto"
                  : "overflow-y-auto overflow-x-hidden"
              }`}
            >
              {loadError ? (
                <div className="flex h-full min-h-72 items-center justify-center">
                  <div className="max-w-sm rounded-xl border border-border bg-surface p-6 text-center shadow-sm">
                    <FileText className="mx-auto size-8 text-muted-foreground" />
                    <p className="mt-3 text-base font-semibold text-heading">
                      Gagal membuka dokumen
                    </p>
                    <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
                      {loadError}
                    </p>
                  </div>
                </div>
              ) : isLoading || !documentProxy ? (
                <div className="flex h-full min-h-72 items-center justify-center">
                  <div className="flex items-center gap-2 text-base font-medium text-muted-foreground">
                    <LoaderCircle className="size-4 animate-spin text-primary" />
                    Membuka dokumen...
                  </div>
                </div>
              ) : (
                <div
                  ref={pagesRef}
                  className="flex w-max min-w-full flex-col items-center"
                  style={{ gap: PAGE_GAP }}
                >
                  {Array.from({ length: totalPages }, (_, index) => {
                    const page = index + 1;
                    const size = sizeOf(page);
                    return (
                      <PdfPage
                        key={page}
                        documentProxy={documentProxy}
                        pageNumber={page}
                        baseWidth={size.width}
                        baseHeight={size.height}
                        scale={scaleOf(page)}
                        scrollArea={scrollArea}
                        highlights={highlightsByPage.get(page) ?? NO_RECTS}
                        activeRects={
                          activeMatch?.page === page
                            ? activeMatch.rects
                            : NO_RECTS
                        }
                        registerPage={registerPage}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            <div
              className={`pointer-events-none absolute inset-x-3 top-3 z-10 transition-all duration-200 ease-out lg:hidden ${
                mobileSearchOpen
                  ? "translate-y-0 opacity-100"
                  : "-translate-y-3 opacity-0"
              }`}
              aria-hidden={!mobileSearchOpen}
            >
              <div
                className={`rounded-2xl p-2 ${FLOATING_SURFACE} ${mobileSearchOpen ? "pointer-events-auto" : ""}`}
              >
                <form
                  onSubmit={submitSearch}
                  className="flex items-center gap-2"
                >
                  <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      ref={mobileSearchRef}
                      tabIndex={mobileSearchOpen ? 0 : -1}
                      type="search"
                      enterKeyHint="search"
                      value={searchQuery}
                      onChange={(event) => changeSearch(event.target.value)}
                      placeholder="Cari kata dalam dokumen..."
                      aria-label="Cari kata dalam dokumen"
                      className="h-10 w-full rounded-xl bg-surface-muted pl-9 pr-3 text-base text-heading outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/25"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="soft"
                    size="icon"
                    onClick={() => {
                      setMobileSearchOpen(false);
                      mobileSearchRef.current?.blur();
                    }}
                    tabIndex={mobileSearchOpen ? 0 : -1}
                    aria-label="Tutup pencarian"
                    className="rounded-full!"
                  >
                    <X className="size-4" />
                  </Button>
                </form>
                {normalizedQuery.length >= 2 && (
                  <div className="mt-2 flex items-center gap-2 px-1">
                    <button
                      type="button"
                      onClick={() => showMatch(activeSearchResult)}
                      disabled={!activeMatch || indexing}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="text-[13px] font-semibold text-heading">
                        {searchStatus}
                      </p>
                      {activeMatch && !indexing && (
                        <p className="truncate text-xs text-muted-foreground">
                          Hlm. {activeMatch.page} · {activeMatch.snippet}
                        </p>
                      )}
                    </button>
                    <Button
                      variant="soft"
                      size="icon"
                      onClick={() => moveSearchResult(-1)}
                      disabled={searchResults.length === 0}
                      aria-label="Hasil pencarian sebelumnya"
                      className="size-9! rounded-full!"
                    >
                      <ChevronsLeft className="size-4" />
                    </Button>
                    <Button
                      variant="soft"
                      size="icon"
                      onClick={() => moveSearchResult(1)}
                      disabled={searchResults.length === 0}
                      aria-label="Hasil pencarian berikutnya"
                      className="size-9! rounded-full!"
                    >
                      <ChevronsRight className="size-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div
              className={`pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 transition-all duration-200 ${
                mobileSearchOpen ? "top-28" : "top-3"
              } ${zoomHintVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
              aria-live="polite"
            >
              <span
                className={`block rounded-full px-3.5 py-1.5 text-[13px] font-semibold tabular-nums text-heading ${FLOATING_SURFACE}`}
              >
                {Math.round(displayZoom * 100)}%
              </span>
            </div>

            <div className="absolute bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-3 z-10 lg:hidden">
              <div
                className={`flex flex-col gap-1.5 rounded-full p-1.5 ${FLOATING_SURFACE}`}
              >
                <Button
                  variant={mobileSearchOpen ? "primary" : "soft"}
                  size="icon"
                  onClick={() => {
                    const opening = !mobileSearchOpen;
                    setMobileSearchOpen(opening);
                    // Focus inside the tap itself, or iOS won't raise the keyboard.
                    if (opening) mobileSearchRef.current?.focus();
                    else mobileSearchRef.current?.blur();
                  }}
                  aria-label="Cari dalam dokumen"
                  aria-pressed={mobileSearchOpen}
                  className="size-11! rounded-full!"
                >
                  <Search className="size-[18px]" />
                </Button>
                <a
                  href={fileUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Unduh dokumen"
                  className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary-foreground transition active:scale-95"
                >
                  <Download className="size-[18px]" />
                </a>
                {hasOutline && (
                  <Button
                    variant="soft"
                    size="icon"
                    onClick={() => setTocOpen(true)}
                    aria-label="Buka daftar isi"
                    className="size-11! rounded-full!"
                  >
                    <ListTree className="size-[18px]" />
                  </Button>
                )}
              </div>
            </div>

            <div className="absolute bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-10 -translate-x-1/2 lg:hidden">
              <div
                className={`flex h-14 items-center gap-1 rounded-full p-1.5 ${FLOATING_SURFACE}`}
              >
                <Button
                  variant="soft"
                  size="icon"
                  onClick={() => navigateToPage(pageNumber - 1)}
                  disabled={pageNumber <= 1}
                  aria-label="Halaman sebelumnya"
                  className="size-11! rounded-full! disabled:opacity-40"
                >
                  <ChevronLeft className="size-5" />
                </Button>
                <label className="flex h-11 min-w-26 items-center justify-center gap-1.5 px-2 text-base tabular-nums">
                  {pageInputField(
                    "h-9 rounded-md bg-transparent text-right font-semibold text-heading outline-none focus:bg-surface-muted focus:ring-2 focus:ring-primary/25",
                    { width: `${String(totalPages || 0).length + 0.6}ch` }
                  )}
                  <span className="text-muted-foreground">/</span>
                  <span className="text-muted-foreground">
                    {totalPages || "—"}
                  </span>
                </label>
                <Button
                  variant="soft"
                  size="icon"
                  onClick={() => navigateToPage(pageNumber + 1)}
                  disabled={!totalPages || pageNumber >= totalPages}
                  aria-label="Halaman berikutnya"
                  className="size-11! rounded-full! disabled:opacity-40"
                >
                  <ChevronRight className="size-5" />
                </Button>
              </div>
            </div>
          </section>

          {hasOutline && (
            <aside className="hidden w-80 shrink-0 border-l border-border xl:block">
              <TableOfContents
                outline={outline}
                activeId={activeTocId}
                onNavigate={navigateToOutlineItem}
              />
            </aside>
          )}

          {hasOutline && (
            <div
              className={`absolute inset-0 z-20 xl:hidden ${tocOpen ? "" : "pointer-events-none"}`}
              aria-hidden={!tocOpen}
              inert={!tocOpen}
            >
              <button
                type="button"
                aria-label="Tutup daftar isi"
                onClick={() => setTocOpen(false)}
                className={`absolute inset-0 bg-brand-ink/35 transition-opacity ${tocOpen ? "opacity-100" : "opacity-0"}`}
              />
              <aside
                className={`absolute inset-y-0 right-0 w-[min(88vw,340px)] border-l border-border bg-surface transition-[transform,box-shadow] duration-300 ${
                  tocOpen
                    ? "translate-x-0 shadow-2xl"
                    : "translate-x-full shadow-none"
                }`}
              >
                <TableOfContents
                  outline={outline}
                  activeId={activeTocId}
                  onNavigate={navigateToOutlineItem}
                  onClose={() => setTocOpen(false)}
                />
              </aside>
            </div>
          )}
        </div>
      </PageMargin>
    </div>
  );
}
