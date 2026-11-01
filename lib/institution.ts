// The slug is decorative (only the id resolves), so a missing one falls back to a fixed segment.
export function institutionHref(id: number, slug?: string | null): string {
  return `/institutions/${slug || "institusi"}/${id}`;
}

function withPrefix(prefix: string, value?: string | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.toLowerCase().startsWith(prefix.toLowerCase())
    ? trimmed
    : `${prefix} ${trimmed}`;
}

// "Perguruan Tinggi di {kota}", or Indonesia when the institution has no city on record.
export function institutionLocationLine(institution: {
  city_name?: string | null;
}): string {
  return `Perguruan Tinggi di ${institution.city_name?.trim() || "Indonesia"}`;
}

// "Jl. X, Kecamatan Y, Kota Z, Provinsi W", skipping missing parts; null when none are known.
export function institutionAddressLine(institution: {
  address?: string | null;
  district_name?: string | null;
  city_name?: string | null;
  province_name?: string | null;
}): string | null {
  const parts = [
    institution.address?.trim() || null,
    withPrefix("Kecamatan", institution.district_name),
    institution.city_name?.trim() || null,
    withPrefix("Provinsi", institution.province_name),
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}
