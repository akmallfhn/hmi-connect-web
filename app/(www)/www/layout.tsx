import type { Metadata } from "next";
import type { ReactNode } from "react";

const siteDescription =
  "HMI Connect adalah ruang digital kader HMI untuk terhubung, berbagi kabar, dan mengelola data keanggotaan.";

function getMetadataBase() {
  const fallbackUrl = "https://hmi-connect-web.vercel.app";
  try {
    return new URL(process.env.NEXT_PUBLIC_BASE_URL ?? fallbackUrl);
  } catch {
    return new URL(fallbackUrl);
  }
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  applicationName: "HMI Connect",
  title: {
    default: "HMI Connect",
    template: "%s | HMI Connect",
  },
  description: siteDescription,
  keywords: [
    "HMI",
    "HMI Connect",
    "Himpunan Mahasiswa Islam",
    "kader HMI",
    "keanggotaan HMI",
  ],
  authors: [{ name: "HMI Connect" }],
  creator: "HMI Connect",
  publisher: "HMI Connect",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "HMI Connect",
    title: "HMI Connect",
    description: siteDescription,
    url: "/",
  },
  twitter: {
    card: "summary",
    title: "HMI Connect",
    description: siteDescription,
  },
};

export default function WwwLayout({ children }: { children: ReactNode }) {
  return <div className="font-google-sans">{children}</div>;
}
