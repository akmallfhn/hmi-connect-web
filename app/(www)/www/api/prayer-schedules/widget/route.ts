import { NextResponse } from "next/server";
import {
  findFallbackPrayerCityId,
  getPrayerWidget,
} from "@/apis/prayer-schedules";

// Lets the feed widget update itself for a picked city or a browser zone without refreshing the whole home page.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requested = Number(searchParams.get("city_id"));
  const cityId =
    Number.isInteger(requested) && requested > 0
      ? requested
      : await findFallbackPrayerCityId(searchParams.get("timezone"));

  const widget = cityId ? await getPrayerWidget(cityId) : null;
  if (!widget) return NextResponse.json({ data: null }, { status: 404 });

  return NextResponse.json({ data: widget });
}
