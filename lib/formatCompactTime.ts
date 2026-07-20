// Instagram-style short relative time for list rows — formatRelativeTime's dayjs
// "fromNow" phrases ("5 menit yang lalu") are too long for a single-line preview row.
export function formatCompactTime(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes}mnt`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}j`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}h`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}mgg`;

  const months = Math.floor(days / 30);
  return `${months}bln`;
}
