import type { DocumentOutlineItem } from "@/apis/organizational-documents";

export const ORGANIZATIONAL_DOCUMENTS_PATH = "/organizational-documents";
export const PDF_WORKER_SRC = "/documents/pdf.worker.min.mjs";
// The backend accepts four outline levels; the editor counts depth from 0.
export const MAX_OUTLINE_DEPTH = 3;

export function organizationalDocumentHref(document: {
  id: number;
  slug_url: string;
}) {
  return `${ORGANIZATIONAL_DOCUMENTS_PATH}/${document.slug_url || "pedoman"}/${document.id}`;
}

export type FlatOutlineRow = {
  key: string;
  title: string;
  page: string;
  depth: number;
};

let rowSeed = 0;

export function newOutlineRow(
  depth = 0,
  title = "",
  page = ""
): FlatOutlineRow {
  rowSeed += 1;
  return { key: `row-${rowSeed}`, title, page, depth };
}

export function flattenOutlineTree(
  items: DocumentOutlineItem[],
  depth = 0
): FlatOutlineRow[] {
  return items.flatMap((item) => [
    newOutlineRow(depth, item.title, String(item.page)),
    ...flattenOutlineTree(item.children ?? [], depth + 1),
  ]);
}

// Rebuilds the nested tree from indented rows; a row nests under the nearest shallower row above it.
export function buildOutlineTree(
  rows: FlatOutlineRow[]
): DocumentOutlineItem[] {
  const root: DocumentOutlineItem[] = [];
  const stack: { depth: number; children: DocumentOutlineItem[] }[] = [
    { depth: -1, children: root },
  ];
  for (const row of rows) {
    const item: DocumentOutlineItem = {
      title: row.title.trim(),
      page: Number(row.page),
      children: [],
    };
    while (stack.length > 1 && stack[stack.length - 1].depth >= row.depth) {
      stack.pop();
    }
    stack[stack.length - 1].children.push(item);
    stack.push({ depth: row.depth, children: item.children });
  }
  return root;
}

// Reads a local PDF's page count and its own bookmarks, so the form can prefill both.
export async function inspectPdf(source: File | string): Promise<{
  pageCount: number;
  outline: DocumentOutlineItem[];
}> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;
  const data =
    typeof source === "string"
      ? source
      : { data: new Uint8Array(await source.arrayBuffer()) };
  const pdf = await pdfjs.getDocument(data).promise;
  try {
    const nodes = (await pdf.getOutline()) ?? [];
    type OutlineNode = (typeof nodes)[number];

    async function convert(items: OutlineNode[], depth: number) {
      const result: DocumentOutlineItem[] = [];
      for (const node of items) {
        try {
          const destination =
            typeof node.dest === "string"
              ? await pdf.getDestination(node.dest)
              : node.dest;
          const ref = destination?.[0];
          if (!ref || !node.title?.trim()) continue;
          const pageIndex =
            typeof ref === "number"
              ? ref
              : await pdf.getPageIndex(
                  ref as Parameters<typeof pdf.getPageIndex>[0]
                );
          result.push({
            title: node.title.trim(),
            page: pageIndex + 1,
            children:
              depth < MAX_OUTLINE_DEPTH && node.items?.length
                ? await convert(node.items, depth + 1)
                : [],
          });
        } catch {
          continue;
        }
      }
      return result;
    }

    return { pageCount: pdf.numPages, outline: await convert(nodes, 0) };
  } finally {
    await pdf.destroy();
  }
}
