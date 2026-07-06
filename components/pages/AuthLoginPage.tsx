"use client";

import { useGoogleLogin } from "@react-oauth/google";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Button from "../buttons/Button";
import LogoHmiConnect from "../svg/LogoHmiConnect";
import LogoSilaturahmi from "../svg/LogoSilaturahmi";

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
    <div className="container z-30 flex w-full max-w-[340px] items-center rounded-[20px] bg-transparent px-5 py-12 text-center text-[#172033] shadow-none lg:max-w-[420px] lg:px-8">
      <div className="login-component mx-auto flex w-full flex-col items-center gap-8">
        <LogoHmiConnect className="h-22 w-auto" />

        <div className="login-head flex flex-col gap-2">
          <h1 className="login-title text-2xl font-bold tracking-tight lg:text-3xl">
            Welcome Back, Kanda!
          </h1>
          <p className="login-tagline text-sm leading-6 text-[#5f6573] lg:text-lg">
            Login untuk lanjut mengelola koneksi, agenda, dan aktivitas HMI.
          </p>
        </div>

        <div className="login-action flex w-full flex-col gap-3">
          <p className="text-[13px] font-medium text-[#5f6573] lg:text-base">
            Continue securely with
          </p>

          <Button
            variant="dark"
            size="lg"
            onClick={() => handleAuthAction()}
            disabled={isLoading}
            className="w-full font-bold"
          >
            <Image
              src="https://www.gstatic.com/marketing-cms/assets/images/cc/1a/d1e32b9846568d13353e580cb893/g-about-gatg.png=n-w128-h131-fcrop64=1,000005f5ffffffff-rw"
              alt="Google"
              width={24}
              height={24}
              className="size-5"
            />
            <span>{isLoading ? "Connecting..." : "Login with Google"}</span>
          </Button>

          {status === "error" ? (
            <p className="text-xs font-semibold text-destructive">
              {errorMessage}
            </p>
          ) : null}
        </div>

        <p className="text-[11px] leading-5 text-[#7b8190] lg:text-sm">
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
        <section className="relative z-20 flex w-full justify-center px-5 pt-12 sm:pt-0 lg:h-full lg:flex-1 lg:items-center lg:bg-white">
          <Suspense fallback={<div className="h-96 w-full max-w-[340px]" />}>
            <LoginAction />
          </Suspense>
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
