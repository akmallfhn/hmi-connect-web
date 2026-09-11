"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { Loader2, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { loginWithEmail } from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import AuthSplitLayout from "../auth/AuthSplitLayout";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import PasswordInput from "../fields/PasswordInput";
import LogoHmiConnect from "../svg/LogoHmiConnect";

function getSafeRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

function LoginAction() {
  const searchParams = useSearchParams();
  const [googleStatus, setGoogleStatus] = useState<"idle" | "loading">("idle");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const redirectTo = getSafeRedirect(searchParams.get("redirectTo"));
  const isGoogleLoading = googleStatus === "loading";
  const isBusy = isGoogleLoading || submitting;

  const handleAuthAction = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setErrorMessage("");
        setGoogleStatus("loading");

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

        // Hard navigation — the destination's access depends on the cookie just set.
        window.location.href = redirectTo;
      } catch (err) {
        console.error("[AuthLoginPage] login callback failed:", err);
        setErrorMessage(
          err instanceof Error ? err.message : "Login gagal. Silakan coba lagi."
        );
        setGoogleStatus("idle");
      }
    },
    onError: (err) => {
      console.error("[AuthLoginPage] Google popup failed:", err);
      setErrorMessage("Login Google dibatalkan atau gagal. Silakan coba lagi.");
      setGoogleStatus("idle");
    },
  });

  async function handleEmailLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isBusy) return;

    setErrorMessage("");
    setSubmitting(true);

    try {
      const result = await loginWithEmail(identifier.trim(), password);

      if (!isSuccessStatus(result.status)) {
        setErrorMessage(result.message ?? "Email atau password salah.");
        setSubmitting(false);
        return;
      }

      window.location.href = redirectTo;
    } catch (err) {
      console.error("[AuthLoginPage] email login failed:", err);
      setErrorMessage("Login gagal. Silakan coba lagi.");
      setSubmitting(false);
    }
  }

  return (
    <div className="container z-30 flex w-full max-w-[340px] items-center rounded-[20px] bg-transparent px-5 py-12 text-center text-[#172033] shadow-none lg:max-w-[420px] lg:px-8">
      <div className="login-component mx-auto flex w-full flex-col items-center gap-6">
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
            disabled={isBusy}
            className="w-full font-bold"
          >
            <Image
              src="https://www.gstatic.com/marketing-cms/assets/images/cc/1a/d1e32b9846568d13353e580cb893/g-about-gatg.png=n-w128-h131-fcrop64=1,000005f5ffffffff-rw"
              alt="Google"
              width={24}
              height={24}
              className="size-5"
            />
            <span>
              {isGoogleLoading ? "Connecting..." : "Login with Google"}
            </span>
          </Button>
        </div>

        <div className="flex w-full items-center gap-3">
          <span className="h-px flex-1 bg-[#e6e9ef]" />
          <span className="text-[13px] font-medium text-[#7b8190]">atau</span>
          <span className="h-px flex-1 bg-[#e6e9ef]" />
        </div>

        <form
          onSubmit={handleEmailLogin}
          className="flex w-full flex-col gap-3 text-left"
        >
          <Input
            inputId="login-identifier"
            label="Email atau Username"
            placeholder="nama@email.com"
            icon={<Mail className="size-4" />}
            autoComplete="username"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            disabled={isBusy}
            required
          />

          <PasswordInput
            inputId="login-password"
            label="Password"
            placeholder="Masukkan password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isBusy}
            required
          />

          <Link
            href="/auth/forget-password"
            className="self-end text-sm font-semibold text-primary hover:underline"
          >
            Lupa password?
          </Link>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isBusy || !identifier.trim() || !password}
            className="w-full font-bold"
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            <span>{submitting ? "Memproses..." : "Login"}</span>
          </Button>
        </form>

        {errorMessage ? (
          <p className="text-xs font-semibold text-destructive">
            {errorMessage}
          </p>
        ) : null}

        <p className="text-[13px] leading-5 text-[#7b8190] lg:text-sm">
          By logging in, you agree to HMI Connect privacy and usage terms.
        </p>
      </div>
    </div>
  );
}

export default function AuthLoginPage() {
  return (
    <AuthSplitLayout>
      <Suspense fallback={<div className="h-96 w-full max-w-[340px]" />}>
        <LoginAction />
      </Suspense>
    </AuthSplitLayout>
  );
}
