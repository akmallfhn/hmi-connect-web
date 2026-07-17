import { GoogleOAuthProvider } from "@react-oauth/google";
import { Geist, Geist_Mono, Google_Sans } from "next/font/google";
import { Toaster } from "sonner";
import ScrollToTop from "@/components/common/ScrollToTop";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const googleSans = Google_Sans({
  variable: "--font-google-sans",
  subsets: ["latin"],
  adjustFontFallback: false,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleOauthId = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ID;

  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} ${googleSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col scroll-smooth">
        <ScrollToTop />
        <GoogleOAuthProvider clientId={googleOauthId!}>
          {children}
        </GoogleOAuthProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
