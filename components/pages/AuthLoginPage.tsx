"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Button from "../buttons/Button";

function getSafeRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

function LoginAction() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState(
    "Login request failed. Please try again."
  );

  const redirectTo = getSafeRedirect(searchParams.get("redirectTo"));
  const isLoading = status === "loading";

  const handleAuthAction = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("[AuthLoginPage] Google token response:", tokenResponse);

      try {
        setStatus("loading");

        const response = await fetch("/api/auth/callback/google", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            access_token: tokenResponse.access_token,
          }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(
            body?.message ??
              `Authentication request failed (${response.status})`
          );
        }

        router.push(redirectTo);
        router.refresh();
      } catch (err) {
        console.error("[AuthLoginPage] login callback failed:", err);
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Login request failed. Please try again."
        );
        setStatus("error");
      }
    },
    onError: (err) => {
      console.error("[AuthLoginPage] Google popup failed:", err);
      setErrorMessage(
        "Google sign-in was cancelled or failed. Please try again."
      );
      setStatus("error");
    },
  });

  return (
    <div className="container z-30 flex w-full max-w-[340px] items-center rounded-[20px] bg-white/25 px-5 py-12 text-center text-white shadow-[0_24px_80px_rgba(15,23,42,0.22)] backdrop-blur-xl lg:max-w-[420px] lg:bg-transparent lg:px-8 lg:text-[#172033] lg:shadow-none">
      <div className="login-component mx-auto flex w-full flex-col items-center gap-8">
        <div className="grid size-20 place-items-center rounded-[24px] border border-white/40 bg-white/20 text-3xl font-black tracking-tight lg:border-[#dbe3ef] lg:bg-[#f5fbf8] lg:text-[#0b8f6a]">
          H
        </div>

        <div className="login-head flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/75 lg:text-[#0b8f6a]">
            HMI Connect
          </p>
          <h1 className="login-title text-2xl font-bold tracking-tight lg:text-3xl">
            Welcome Back, Kader!
          </h1>
          <p className="login-tagline text-sm leading-6 text-white/85 lg:text-lg lg:text-[#5f6573]">
            Login untuk lanjut mengelola koneksi, agenda, dan aktivitas HMI.
          </p>
        </div>

        <div className="login-action flex w-full flex-col gap-3">
          <p className="text-[13px] font-medium text-white/85 lg:text-base lg:text-[#5f6573]">
            Continue securely with
          </p>

          <Button
            variant="light"
            size="pill"
            onClick={() => handleAuthAction()}
            disabled={isLoading}
            className="w-full font-bold"
          >
            <span className="grid size-6 place-items-center rounded-full bg-[#0b8f6a] text-xs font-black text-white">
              H
            </span>
            <span>
              {isLoading ? "Connecting..." : "Login with HMI Connect"}
            </span>
          </Button>

          {status === "error" ? (
            <p className="text-xs font-semibold text-[#ffe1e1] lg:text-[#b42318]">
              {errorMessage}
            </p>
          ) : null}
        </div>

        <p className="text-[11px] leading-5 text-white/80 lg:text-sm lg:text-[#7b8190]">
          By logging in, you agree to HMI Connect privacy and usage terms.
        </p>
      </div>
    </div>
  );
}

export default function AuthLoginPage() {
  return (
    <main className="root fixed inset-0 z-50 min-h-screen overflow-hidden bg-white">
      <div className="relative flex h-full w-full items-start justify-center bg-white sm:items-center lg:flex-row-reverse">
        <section className="relative z-20 flex w-full justify-center px-5 pt-24 sm:pt-0 lg:h-full lg:flex-1 lg:items-center lg:bg-white">
          <Suspense fallback={<div className="h-96 w-full max-w-[340px]" />}>
            <LoginAction />
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
