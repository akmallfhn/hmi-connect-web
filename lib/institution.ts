// The slug is decorative (only the id resolves), so a missing one falls back to a fixed segment.
export function institutionHref(id: number, slug?: string | null): string {
  return `/institutions/${slug || "institusi"}/${id}`;
}
