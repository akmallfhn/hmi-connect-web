import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";

dayjs.extend(relativeTime);

export function formatRelativeTime(dateString: string): string {
  return dayjs(dateString).locale("id").fromNow();
}
