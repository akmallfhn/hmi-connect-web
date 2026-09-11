"use client";

import { ArrowLeft, CircleAlert, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { resetPassword } from "@/lib/actions";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  hasPasswordErrors,
  validateNewPassword,
  type NewPasswordErrors,
} from "@/lib/password";
import { isSuccessStatus } from "@/lib/types";
import AuthSplitLayout from "../auth/AuthSplitLayout";
import Button from "../buttons/Button";
import PasswordInput from "../fields/PasswordInput";
import LogoHmiConnect from "../svg/LogoHmiConnect";

interface ResetPasswordPageProps {
  sessionId: string;
  // Resolved server-side through reset-password/check, so a dead link never renders a form.
  valid: boolean;
  invalidMessage?: string;
}

export default function ResetPasswordPage({
  sessionId,
  valid,
  invalidMessage,
}: ResetPasswordPageProps) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errors, setErrors] = useState<NewPasswordErrors>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const validation = validateNewPassword(password, confirmation);
    setErrors(validation);
    if (hasPasswordErrors(validation)) return;

    setErrorMessage("");
    setSubmitting(true);

    try {
      const result = await resetPassword(sessionId, password);

      if (!isSuccessStatus(result.status)) {
        setErrorMessage(
          result.message ?? "Gagal menyimpan password. Silakan coba lagi."
        );
        return;
      }

      setDone(true);
    } catch (err) {
      console.error("[ResetPasswordPage] reset password failed:", err);
      setErrorMessage("Gagal menyimpan password. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthSplitLayout>
      <div className="container z-30 flex w-full max-w-[340px] items-center rounded-[20px] bg-transparent px-5 py-12 text-center text-[#172033] shadow-none lg:max-w-[420px] lg:px-8">
        <div className="mx-auto flex w-full flex-col items-center gap-6">
          <LogoHmiConnect className="h-22 w-auto" />

          {!valid ? (
            <>
              <span className="flex size-14 items-center justify-center rounded-full bg-destructive-soft text-destructive">
                <CircleAlert className="size-7" />
              </span>

              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                  Tautan Tidak Berlaku
                </h1>
                <p className="text-sm leading-6 text-[#5f6573] lg:text-base">
                  {invalidMessage ??
                    "Tautan reset ini tidak valid, sudah dipakai, atau sudah kedaluwarsa."}{" "}
                  Minta tautan baru untuk melanjutkan.
                </p>
              </div>

              <Link href="/auth/forget-password" className="w-full">
                <Button variant="primary" size="lg" className="w-full font-bold">
                  Minta Tautan Baru
                </Button>
              </Link>
            </>
          ) : done ? (
            <>
              <span className="flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary">
                <ShieldCheck className="size-7" />
              </span>

              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                  Password Berhasil Diubah
                </h1>
                <p className="text-sm leading-6 text-[#5f6573] lg:text-base">
                  Semua sesi kamu sudah diakhiri. Masuk kembali dengan password
                  baru.
                </p>
              </div>

              <Link href="/auth/login" className="w-full">
                <Button variant="primary" size="lg" className="w-full font-bold">
                  Login Sekarang
                </Button>
              </Link>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                  Buat Password Baru
                </h1>
                <p className="text-sm leading-6 text-[#5f6573] lg:text-base">
                  Password {PASSWORD_MIN_LENGTH}-{PASSWORD_MAX_LENGTH} karakter.
                  Masukkan dua kali untuk memastikan tidak salah ketik.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex w-full flex-col gap-3 text-left"
              >
                <PasswordInput
                  inputId="reset-password"
                  label="Password Baru"
                  placeholder="Masukkan password baru"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  errorMessage={errors.password}
                  disabled={submitting}
                  required
                />

                <PasswordInput
                  inputId="reset-password-confirmation"
                  label="Konfirmasi Password Baru"
                  placeholder="Ulangi password baru"
                  autoComplete="new-password"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  errorMessage={errors.confirmation}
                  disabled={submitting}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={submitting || !password || !confirmation}
                  className="w-full font-bold"
                >
                  {submitting && <Loader2 className="size-4 animate-spin" />}
                  <span>{submitting ? "Menyimpan..." : "Simpan Password"}</span>
                </Button>
              </form>

              {errorMessage ? (
                <p className="text-xs font-semibold text-destructive">
                  {errorMessage}
                </p>
              ) : null}
            </>
          )}

          {done ? null : (
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5f6573] hover:text-primary"
            >
              <ArrowLeft className="size-4" />
              Kembali ke Login
            </Link>
          )}
        </div>
      </div>
    </AuthSplitLayout>
  );
}
