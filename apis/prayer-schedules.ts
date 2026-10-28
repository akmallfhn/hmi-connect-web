import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import { searchCitiesNationwide } from "./locations";
import { getSession } from "./session";
import { getUserByUsername } from "./users";
import { isSuccessStatus } from "@/lib/types";
import {
  DEFAULT_PRAYER_FALLBACK_CITY,
  prayerFallbackCityName,
} from "@/lib/prayer-schedule";
import {
  BROWSER_TIMEZONE_COOKIE_NAME,
  PRAYER_CITY_COOKIE_NAME,
  SESSION_COOKIE_NAME,
} from "@/lib/constants";

// The eight daily times every prayer_schedules row carries, in reading order.
export type PrayerTimes = {
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  zuhur: string;
  asar: string;
  magrib: string;
  isya: string;
};

export type PrayerTimeKey = keyof PrayerTimes;

type PrayerCityScope = {
  city_id: number;
  city_name: string;
  province_id: number;
  province_name: string;
  timezone: string;
  timezone_abbr: string;
  utc_offset: number;
};

// Mirrors POST /api/v1/prayer-schedules/widget — today's times plus the countdown to the next obligatory prayer.
export type PrayerWidget = PrayerCityScope &
  PrayerTimes & {
    date: string;
    current_time: string;
    next_prayer_name: string;
    next_prayer_time: string;
    next_prayer_date: string;
    next_prayer_in_seconds: number;
    next_prayer_in_minutes: number;
    next_prayer_in_hours: number;
  };

export type PrayerScheduleDay = PrayerTimes & { date: string };

// Mirrors POST /api/v1/prayer-schedules — one calendar month for one city.
export type PrayerMonthSchedule = PrayerCityScope & {
  month: number;
  year: number;
  list: PrayerScheduleDay[];
};

async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

export async function getPrayerWidget(
  cityId: number
): Promise<PrayerWidget | null> {
  const token = await getSessionToken();
  if (!token) return null;

  const result = await callApi<PrayerWidget>(
    "/api/v1/prayer-schedules/widget",
    { method: "POST", token, body: { city_id: cityId } }
  );

  if (!isSuccessStatus(result.status) || !result.data) return null;
  return result.data;
}

// A month never exceeds 31 rows, so one page of 31 always covers it.
export async function listPrayerSchedules(options: {
  cityId: number;
  month: number;
  year: number;
}): Promise<PrayerMonthSchedule | null> {
  const token = await getSessionToken();
  if (!token) return null;

  const { cityId, month, year } = options;
  const result = await callApi<PrayerMonthSchedule>(
    "/api/v1/prayer-schedules",
    {
      method: "POST",
      token,
      body: { city_id: cityId, month, year, page: 1, page_size: 31 },
    }
  );

  if (!isSuccessStatus(result.status) || !result.data) return null;
  return result.data;
}

async function findCityIdByName(name: string): Promise<number | null> {
  const { list } = await searchCitiesNationwide({ search: name });
  return list[0]?.id ?? null;
}

// Fallback for a viewer with no saved choice and no address: their browser's zone, else Jakarta Pusat.
export async function findFallbackPrayerCityId(
  timezone?: string | null
): Promise<number | null> {
  const zoneCity = prayerFallbackCityName(timezone);
  if (zoneCity !== DEFAULT_PRAYER_FALLBACK_CITY) {
    const cityId = await findCityIdByName(zoneCity);
    if (cityId) return cityId;
  }
  return findCityIdByName(DEFAULT_PRAYER_FALLBACK_CITY);
}

function parseCityId(value?: string | null): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export type ResolvedPrayerCity = {
  cityId: number | null;
  // True when no URL, saved choice, or profile address named the city.
  isFallback: boolean;
};

// Explicit ?city_id wins, then the remembered choice, then the viewer's own address, then the zone fallback.
export async function resolvePrayerCityId(
  requested?: string
): Promise<ResolvedPrayerCity> {
  const explicit = parseCityId(requested);
  if (explicit) return { cityId: explicit, isFallback: false };

  const cookieStore = await cookies();
  const remembered = parseCityId(cookieStore.get(PRAYER_CITY_COOKIE_NAME)?.value);
  if (remembered) return { cityId: remembered, isFallback: false };

  const { sessionToken, user } = await getSession();
  if (user?.username) {
    const profile = await getUserByUsername(user.username, sessionToken);
    if (profile?.city_id) return { cityId: profile.city_id, isFallback: false };
  }

  const timezone = cookieStore.get(BROWSER_TIMEZONE_COOKIE_NAME)?.value;
  return { cityId: await findFallbackPrayerCityId(timezone), isFallback: true };
}
