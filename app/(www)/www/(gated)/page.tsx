import Image from "next/image";
import { getSession } from "@/apis/session";

export default async function HomePage() {
  const { user } = await getSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-5 text-center">
      {user?.avatar && (
        <Image
          src={user.avatar}
          alt={user.full_name ?? "Avatar"}
          width={64}
          height={64}
          className="rounded-full"
        />
      )}
      <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
        Welcome, {user?.full_name ?? "Kader"}!
      </h1>
      <p className="text-sm text-[#5f6573]">
        Akun kamu sudah terverifikasi. Selamat bergabung di HMI Connect.
      </p>
    </main>
  );
}
