import type { ReactNode } from "react";
import LogoSilaturahmi from "../svg/LogoSilaturahmi";

// The shared login/forget-password/reset-password shell: form on the left, brand panel on the right at lg:.
export default function AuthSplitLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="root fixed inset-0 z-50 min-h-screen overflow-hidden bg-white">
      <div className="relative flex h-full w-full items-start justify-center bg-white sm:items-center lg:flex-row-reverse">
        {/* Only this pane scrolls — the brand panel's lg:h-full needs the row to keep a definite height. */}
        <section className="relative z-20 flex h-full w-full justify-center overflow-y-auto px-5 py-6 sm:py-10 lg:flex-1 lg:bg-white">
          {/* my-auto, never items-center: centering a too-tall child inside a scroll area cuts off its top. */}
          <div className="my-auto flex w-full justify-center">{children}</div>
        </section>

        <section className="hidden lg:relative lg:flex lg:h-full lg:flex-1">
          <div
            className="h-full w-full bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.55)), url('https://i.pinimg.com/736x/3a/2b/60/3a2b60357003fb55a492c32118b86ada.jpg')",
            }}
          />

          <div className="quotes absolute left-1/2 top-1/2 hidden w-max -translate-x-1/2 -translate-y-1/2 lg:block">
            <LogoSilaturahmi className="h-auto w-[380px] text-white" />
          </div>
        </section>
      </div>
    </main>
  );
}
