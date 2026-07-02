import { Suspense } from "react";
import AppLoginContainer from "../elements/AppLoginContainer";

export default function AuthLoginPage() {
  return (
    <main className="root fixed inset-0 z-50 min-h-screen overflow-hidden bg-white">
      <div className="relative flex h-full w-full items-start justify-center bg-white sm:items-center lg:flex-row-reverse">
        <section className="relative z-20 flex w-full justify-center px-5 pt-24 sm:pt-0 lg:h-full lg:flex-1 lg:items-center lg:bg-white">
          <Suspense fallback={<div className="h-96 w-full max-w-[340px]" />}>
            <AppLoginContainer />
          </Suspense>
        </section>

        <section className="absolute inset-0 lg:relative lg:flex lg:h-full lg:flex-1">
          <div
            className="h-full w-full bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(8, 83, 67, 0.86), rgba(16, 30, 51, 0.46)), url('https://static.wixstatic.com/media/02a5b1_e03d69c571a743c1895d874478439010~mv2.webp')",
            }}
          />

          <div className="logo absolute left-1/2 top-10 hidden -translate-x-1/2 items-center gap-3 text-white lg:flex">
            <div className="grid size-11 place-items-center rounded-2xl bg-white text-lg font-black text-[#0b8f6a]">
              H
            </div>
            <p className="text-xl font-bold tracking-tight">HMI Connect</p>
          </div>

          <div className="quotes absolute left-1/2 top-1/2 hidden w-max -translate-x-1/2 -translate-y-1/2 lg:block">
            <p className="p-2 text-center text-4xl font-bold leading-tight text-white">
              Space for{" "}
              <span className="italic underline decoration-[#4ade80] decoration-4 underline-offset-8">
                connecting
              </span>
              <br />
              Tools for{" "}
              <span className="italic underline decoration-[#4ade80] decoration-4 underline-offset-8">
                organizing
              </span>
              <br />
              Home for{" "}
              <span className="italic underline decoration-[#4ade80] decoration-4 underline-offset-8">
                growing
              </span>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
