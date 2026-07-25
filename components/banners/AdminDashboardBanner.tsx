import LogoHmiConnect from "../svg/LogoHmiConnect";
import LogoHmiOutline from "../svg/LogoHmiOutline";

export default function AdminDashboardBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-[#222222] to-black">
      <div className="relative z-10 px-6 py-6 sm:px-10 sm:py-7 md:px-12 md:py-16">
        <div className="flex max-w-xl flex-col items-start gap-5 md:flex-row md:items-center xl:max-w-3xl">
          <div className="flex shrink-0 items-center gap-3">
            <LogoHmiOutline className="h-10 w-auto sm:h-16" />
            <LogoHmiConnect
              colorPrimary="white"
              colorSecondary="white"
              className="h-8 w-auto sm:h-12"
            />
          </div>
          <div className="hidden h-12 w-px shrink-0 bg-white/50 md:block" />
          <div>
            <h2 className="text-xl leading-tight font-extrabold text-white sm:text-2xl">
              Data Center HMI, Perekat Tali Silaturahmi
            </h2>
            <p className="mt-2 text-sm text-white/70 sm:text-base xl:text-lg">
              Kelola HMI dalam satu dashboard.
            </p>
          </div>
        </div>
      </div>
      <video
        src="https://fkzvvwtrwpjsclpthqex.supabase.co/storage/v1/object/public/hmi-connect/globe-video-slow.webm"
        autoPlay
        loop
        muted
        playsInline
        className="pointer-events-none absolute -right-8 -bottom-8 size-48 object-contain sm:-right-14 sm:-bottom-18 sm:size-72"
      />
    </div>
  );
}
