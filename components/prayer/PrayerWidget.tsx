"use client";

import { IconArrowRight, IconShare2 } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import type {
  PrayerTimeKey,
  PrayerWidget as PrayerWidgetData,
} from "@/apis/prayer-schedules";
import {
  DEFAULT_PRAYER_FALLBACK_CITY,
  PRAYER_TIME_LABEL,
  PRAYER_TIME_ORDER,
  formatScheduleDate,
  nextPrayerKey,
  prayerFallbackCityName,
  prayerSchedulesHref,
  rememberPrayerCity,
  syncBrowserTimezoneCookie,
  timeToSeconds,
} from "@/lib/prayer-schedule";
import ShareModal from "../modals/ShareModal";
import MosqueSkyline from "./MosqueSkyline";
import PrayerCitySelect from "./PrayerCitySelect";

export type PrayerWidgetVariant = "page" | "feed";

type VariantConfig = {
  frame: string;
  bannerPadding: string;
  headline: string;
  // Classes for the day's eight times below lg; every variant shows them as one row from lg up.
  times: string;
  // Refetch only the widget instead of refreshing or navigating the page it sits on.
  updateInPlace: boolean;
  monthlyLink: boolean;
};

// Every difference between the variants lives here; the markup below is shared.
const VARIANTS: Record<PrayerWidgetVariant, VariantConfig> = {
  page: {
    frame: "rounded-2xl border",
    bannerPadding: "pb-10 lg:pb-8",
    headline: "text-3xl lg:text-[40px]",
    times: "-mt-5 flex flex-col gap-1 rounded-t-2xl p-3",
    updateInPlace: false,
    monthlyLink: false,
  },
  feed: {
    frame: "border border-x-0 lg:rounded-2xl lg:border-x",
    bannerPadding: "pb-6 lg:pb-8",
    headline: "text-3xl lg:text-[34px]",
    times: "hidden",
    updateInPlace: true,
    monthlyLink: true,
  },
};

interface PrayerWidgetProps {
  widget: PrayerWidgetData | null;
  variant?: PrayerWidgetVariant;
  cityId?: number | null;
  // Fallback label when the widget itself failed to load.
  cityName?: string;
  // The server picked the city from the browser-zone fallback, so a newly learned zone may name a better one.
  isFallbackCity?: boolean;
}

const DAY_SECONDS = 86_400;

type LoadedWidget = { data: PrayerWidgetData | null; receivedAt: number };

async function fetchWidget(
  query: { cityId: number } | { timezone: string }
): Promise<PrayerWidgetData | null> {
  const params = new URLSearchParams(
    "cityId" in query ? { city_id: String(query.cityId) } : { timezone: query.timezone }
  );
  try {
    const response = await fetch(`/api/prayer-schedules/widget?${params}`);
    if (!response.ok) return null;
    const json = await response.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

function formatCountdown(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return minutes > 0 ? `${hours} jam ${minutes} menit` : `${hours} jam`;
  if (minutes > 0) return `${minutes} menit ${seconds} detik`;
  return `${seconds} detik`;
}

function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

// The latest time already passed today; before Imsak it is still last night's Isya.
function currentPrayerKey(widget: PrayerWidgetData, nowSeconds: number): PrayerTimeKey {
  let current: PrayerTimeKey = "isya";
  for (const key of PRAYER_TIME_ORDER) {
    if (timeToSeconds(widget[key]) <= nowSeconds) current = key;
  }
  return current;
}

export default function PrayerWidget({
  widget: initialWidget,
  variant = "page",
  cityId,
  cityName,
  isFallbackCity = false,
}: PrayerWidgetProps) {
  const config = VARIANTS[variant];
  const router = useRouter();
  const now = useNow();
  const [loaded, setLoaded] = useState<LoadedWidget>(() => ({
    data: initialWidget,
    receivedAt: Date.now(),
  }));
  const [updating, setUpdating] = useState(false);
  const [navigating, startNavigation] = useTransition();
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const widget = loaded.data;
  const elapsed = Math.max(0, Math.floor((now - loaded.receivedAt) / 1000));
  const remaining = widget ? Math.max(0, widget.next_prayer_in_seconds - elapsed) : 0;
  const reachedNextPrayer = Boolean(widget) && remaining === 0;
  const displayCityId = widget?.city_id ?? cityId ?? null;
  const displayCity = widget?.city_name ?? cityName;
  const busy = updating || navigating;

  // Once the next prayer arrives, reload today's countdown for the same city.
  useEffect(() => {
    if (!reachedNextPrayer || !displayCityId) return;
    if (!config.updateInPlace) {
      router.refresh();
      return;
    }
    let cancelled = false;
    fetchWidget({ cityId: displayCityId }).then((next) => {
      if (!cancelled && next) setLoaded({ data: next, receivedAt: Date.now() });
    });
    return () => {
      cancelled = true;
    };
  }, [reachedNextPrayer, displayCityId, config.updateInPlace, router]);

  // A fallback city only changes when the newly stored zone names a city other than Jakarta Pusat.
  useEffect(() => {
    const zone = syncBrowserTimezoneCookie();
    if (!zone || !isFallbackCity) return;
    if (prayerFallbackCityName(zone) === DEFAULT_PRAYER_FALLBACK_CITY) return;
    if (!config.updateInPlace) {
      router.refresh();
      return;
    }
    let cancelled = false;
    fetchWidget({ timezone: zone }).then((next) => {
      if (!cancelled && next) setLoaded({ data: next, receivedAt: Date.now() });
    });
    return () => {
      cancelled = true;
    };
  }, [isFallbackCity, config.updateInPlace, router]);

  const nowSeconds = widget ? (timeToSeconds(widget.current_time) + elapsed) % DAY_SECONDS : 0;
  const activeKey = widget ? currentPrayerKey(widget, nowSeconds) : null;
  const nextKey = widget ? nextPrayerKey(widget.next_prayer_name) : null;
  const nextLabel = nextKey ? PRAYER_TIME_LABEL[nextKey] : widget?.next_prayer_name;

  async function handleCityChange(nextCityId: number) {
    if (nextCityId === displayCityId) return;
    rememberPrayerCity(nextCityId);

    if (!config.updateInPlace) {
      startNavigation(() => {
        router.push(prayerSchedulesHref({ cityId: nextCityId }), { scroll: false });
      });
      return;
    }

    setUpdating(true);
    const next = await fetchWidget({ cityId: nextCityId });
    setUpdating(false);
    if (next) setLoaded({ data: next, receivedAt: Date.now() });
    else toast.error("Jadwal sholat untuk kota ini belum tersedia.");
  }

  function handleOpenShare() {
    setShareUrl(`${window.location.origin}${prayerSchedulesHref({ cityId: displayCityId })}`);
    setShareOpen(true);
  }

  return (
    <section className={`overflow-hidden border-border bg-surface ${config.frame}`}>
      <div className="relative isolate overflow-hidden bg-brand-deep text-on-dark">
        <div className="pointer-events-none absolute -right-20 -top-24 -z-10 size-72 rounded-full bg-primary/45 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 -z-10 size-64 rounded-full bg-secondary/25 blur-3xl" />

        <div
          className={`relative flex flex-col px-5 pt-4 lg:min-h-[248px] lg:flex-row lg:items-center lg:px-8 lg:pt-6 ${config.bannerPadding}`}
        >
          <button
            type="button"
            onClick={handleOpenShare}
            className="z-10 inline-flex h-8 w-fit items-center gap-1.5 self-center rounded-full bg-white/10 px-3 text-xs font-semibold ring-1 ring-white/20 transition hover:bg-white/20 lg:absolute lg:left-8 lg:top-6"
          >
            <IconShare2 className="size-4" stroke={2} />
            Bagikan
          </button>

          <MosqueSkyline className="pointer-events-none mx-auto mt-3 w-full max-w-[340px] [mask-image:linear-gradient(to_bottom,black_78%,transparent)] lg:absolute lg:bottom-0 lg:left-4 lg:mt-0 lg:w-[52%] lg:max-w-[540px] lg:[mask-image:none]" />

          <div
            className={`relative z-10 mt-2 flex flex-col items-center text-center transition-opacity lg:ml-auto lg:mt-8 lg:w-[44%] lg:items-end lg:text-right ${busy ? "opacity-70" : ""}`}
          >
            {widget ? (
              <>
                <p className="text-xs text-on-dark/70 lg:text-sm">
                  {formatScheduleDate(widget.date, {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="mt-1 text-sm text-on-dark/85 lg:text-base" aria-live="polite">
                  <span className="font-semibold tabular-nums text-white">
                    {formatCountdown(remaining)}
                  </span>{" "}
                  menuju
                </p>
                <h2
                  className={`mt-1 font-stack-sans-headline font-medium leading-tight ${config.headline}`}
                >
                  {nextLabel},{" "}
                  <span className="tabular-nums text-secondary">{widget.next_prayer_time}</span>
                </h2>
                <p className="mt-2 text-sm text-on-dark/85 lg:text-base">
                  Untuk wilayah <span className="font-semibold text-white">{widget.city_name}</span>{" "}
                  <span className="text-on-dark/60">({widget.timezone_abbr})</span>
                </p>
              </>
            ) : (
              <>
                <h2 className="font-stack-sans-headline text-2xl font-medium lg:text-3xl">
                  Jadwal Sholat
                </h2>
                <p className="mt-2 max-w-sm text-sm text-on-dark/80">
                  {displayCityId
                    ? "Jadwal hari ini belum tersedia untuk lokasi ini. Coba pilih kota lain."
                    : "Pilih kota untuk melihat jadwal sholat hari ini."}
                </p>
              </>
            )}

            <div className="mt-4 w-full max-w-sm text-left text-heading lg:max-w-80">
              <PrayerCitySelect
                key={displayCityId ?? "none"}
                selectId={`prayer-city-${variant}`}
                value={
                  displayCityId && displayCity
                    ? { label: displayCity, value: displayCityId }
                    : null
                }
                onChange={handleCityChange}
                disabled={busy}
              />
            </div>
          </div>
        </div>
      </div>

      {widget && (
        <ol
          className={`relative bg-linear-to-b from-primary-soft to-surface lg:mt-0 lg:grid lg:grid-cols-8 lg:gap-2 lg:rounded-none lg:px-4 lg:py-4 ${config.times}`}
        >
          {PRAYER_TIME_ORDER.map((key) => {
            const isActive = key === activeKey;
            const isNext = key === nextKey;
            return (
              <li
                key={key}
                aria-current={isActive ? "time" : undefined}
                className={[
                  "flex items-center justify-between rounded-xl px-4 py-3 transition lg:flex-col lg:justify-center lg:gap-1 lg:px-2 lg:py-3",
                  isActive
                    ? "bg-surface text-secondary-foreground shadow-sm ring-1 ring-secondary-soft-border"
                    : isNext
                      ? "text-primary-foreground"
                      : "text-heading",
                ].join(" ")}
              >
                <span className="flex items-center gap-2 text-sm lg:text-[15px]">
                  {PRAYER_TIME_LABEL[key]}
                  {isNext && (
                    <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold leading-none text-on-primary-action lg:hidden">
                      Berikutnya
                    </span>
                  )}
                </span>
                <span className="text-[15px] font-semibold tabular-nums lg:text-lg">
                  {widget[key]}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {config.monthlyLink && (
        <Link
          href={prayerSchedulesHref({ cityId: displayCityId })}
          className="flex items-center justify-center gap-1 border-t border-border py-2.5 text-[13px] font-semibold text-primary-foreground transition hover:bg-surface-subtle"
        >
          Lihat jadwal sebulan
          <IconArrowRight className="size-4" stroke={2} />
        </Link>
      )}

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={shareUrl}
        title="Bagikan Jadwal Sholat"
        text={
          widget
            ? `Jadwal sholat ${widget.city_name} hari ini — ${nextLabel} pukul ${widget.next_prayer_time} ${widget.timezone_abbr}. Cek di HMI Connect`
            : "Cek jadwal sholat di HMI Connect"
        }
      />
    </section>
  );
}
