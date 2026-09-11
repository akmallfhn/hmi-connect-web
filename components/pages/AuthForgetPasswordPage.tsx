"use client";

import { ArrowLeft, Loader2, Mail, MailCheck } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { requestPasswordReset } from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import AuthSplitLayout from "../auth/AuthSplitLayout";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import LogoHmiConnect from "../svg/LogoHmiConnect";

export default function AuthForgetPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [expiresInMinutes, setExpiresInMinutes] = useState<number | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const address = email.trim();
    setErrorMessage("");
    setSubmitting(true);

    try {
      const result = await requestPasswordReset(address);

      if (!isSuccessStatus(result.status)) {
        setErrorMessage(
          result.message ?? "Gagal mengirim tautan reset. Silakan coba lagi."
        );
        return;
      }

      setExpiresInMinutes(result.data?.expires_in_minutes ?? null);
      setSentTo(address);
    } catch (err) {
      console.error("[AuthForgetPasswordPage] forget password failed:", err);
      setErrorMessage("Gagal mengirim tautan reset. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthSplitLayout>
      <div className="container z-30 flex w-full max-w-[340px] items-center rounded-[20px] bg-transparent px-5 py-12 text-center text-[#172033] shadow-none lg:max-w-[420px] lg:px-8">
        <div className="mx-auto flex w-full flex-col items-center gap-6">
          <LogoHmiConnect className="h-22 w-auto" />

          {sentTo ? (
            <>
              <span className="flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary">
                <MailCheck className="size-7" />
              </span>

              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                  Cek Email Kamu
                </h1>
                <p className="text-sm leading-6 text-[#5f6573] lg:text-base">
                  Tautan untuk membuat password baru sudah dikirim ke{" "}
                  <strong className="text-[#172033]">{sentTo}</strong>.
                  {expiresInMinutes
                    ? ` Tautan berlaku ${expiresInMinutes} menit dan hanya bisa dipakai sekali.`
                    : " Tautan hanya bisa dipakai sekali."}
                </p>
              </div>

              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setSentTo(null);
                  setExpiresInMinutes(null);
                }}
                className="w-full font-bold"
              >
                Kirim Ulang Tautan
              </Button>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                  Lupa Password?
                </h1>
                <p className="text-sm leading-6 text-[#5f6573] lg:text-base">
                  Masukkan email akun kamu. Kami akan mengirim tautan untuk
                  membuat password baru.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex w-full flex-col gap-3 text-left"
              >
                <Input
                  inputId="forget-password-email"
                  label="Email"
                  type="email"
                  placeholder="nama@email.com"
                  icon={<Mail className="size-4" />}
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={submitting}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={submitting || !email.trim()}
                  className="w-full font-bold"
                >
                  {submitting && <Loader2 className="size-4 animate-spin" />}
                  <span>{submitting ? "Mengirim..." : "Kirim Tautan Reset"}</span>
                </Button>
              </form>

              {errorMessage ? (
                <p className="text-xs font-semibold text-destructive">
                  {errorMessage}
                </p>
              ) : null}
            </>
          )}

          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5f6573] hover:text-primary"
          >
            <ArrowLeft className="size-4" />
            Kembali ke Login
          </Link>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
