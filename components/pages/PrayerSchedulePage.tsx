import type {
  PrayerMonthSchedule,
  PrayerWidget as PrayerWidgetData,
} from "@/apis/prayer-schedules";
import type { VerificationStatusEnum } from "@/lib/types";
import PageMargin from "../common/PageMargin";
import BottomNav from "../navigations/BottomNav";
import Header from "../navigations/Header";
import PrayerMonthTable from "../prayer/PrayerMonthTable";
import PrayerWidget from "../prayer/PrayerWidget";
import { prayerWidgetKey } from "@/lib/prayer-schedule";

interface ViewerProps {
  fullName?: string;
  avatar?: string;
  userId?: string;
  username?: string;
  verificationStatus?: VerificationStatusEnum;
}

interface PrayerSchedulePageProps {
  viewer: ViewerProps;
  cityId: number | null;
  isFallbackCity: boolean;
  widget: PrayerWidgetData | null;
  schedule: PrayerMonthSchedule | null;
  month: number;
  year: number;
}

export default function PrayerSchedulePage({
  viewer,
  cityId,
  isFallbackCity,
  widget,
  schedule,
  month,
  year,
}: PrayerSchedulePageProps) {
  return (
    <div className="min-h-screen bg-surface pb-16 lg:pb-0">
      <Header
        fullName={viewer.fullName}
        avatar={viewer.avatar}
        userId={viewer.userId}
        username={viewer.username}
        verificationStatus={viewer.verificationStatus}
        mobileBackTitle="Jadwal Sholat"
      />

      <PageMargin className="pb-8 pt-3 lg:pb-10 lg:pt-6">
        <h1 className="mb-4 hidden font-stack-sans-headline text-2xl font-medium text-heading lg:block">
          Jadwal Sholat
        </h1>

        <div className="flex flex-col gap-6 lg:gap-8">
          <PrayerWidget
            key={prayerWidgetKey(widget, cityId)}
            widget={widget}
            cityId={cityId}
            cityName={schedule?.city_name}
            isFallbackCity={isFallbackCity}
          />

          <PrayerMonthTable
            cityId={cityId}
            cityName={widget?.city_name}
            schedule={schedule}
            month={month}
            year={year}
            today={widget?.date}
          />
        </div>
      </PageMargin>

      <BottomNav userId={viewer.userId} username={viewer.username} />
    </div>
  );
}
