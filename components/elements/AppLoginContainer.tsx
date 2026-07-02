"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

function getSafeRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

export default function AppLoginContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const redirectTo = getSafeRedirect(searchParams.get("redirectTo"));
  const isLoading = status === "loading";

  const handleAuthAction = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
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
          throw new Error("Authentication request failed");
        }

        router.push(redirectTo);
        router.refresh();
      } catch {
        setStatus("error");
      }
    },
    onError: () => setStatus("error"),
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

          <button
            type="button"
            onClick={() => handleAuthAction()}
            disabled={isLoading}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-full bg-white px-5 text-sm font-bold text-[#172033] shadow-[0_18px_45px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5 hover:bg-[#f5f7fb] disabled:cursor-not-allowed disabled:opacity-70 lg:border lg:border-[#e6e9ef] lg:shadow-none"
          >
            <span className="grid size-6 place-items-center rounded-full bg-[#0b8f6a] text-xs font-black text-white">
              H
            </span>
            <span>
              {isLoading ? "Connecting..." : "Login with HMI Connect"}
            </span>
          </button>

          {status === "error" ? (
            <p className="text-xs font-semibold text-[#ffe1e1] lg:text-[#b42318]">
              Login request failed. Please try again.
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
