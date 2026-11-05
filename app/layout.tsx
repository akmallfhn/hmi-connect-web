import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { config as fontAwesomeConfig } from "@fortawesome/fontawesome-svg-core";
import { Google_Sans } from "next/font/google";
import { Toaster } from "sonner";
import ScrollToTop from "@/components/common/ScrollToTop";
import AppThemeProvider from "@/components/theme/AppThemeProvider";
import AppQueryProvider from "@/components/query/AppQueryProvider";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "./globals.css";

// Ship Font Awesome's CSS ourselves (imported above) instead of a runtime-injected <style> tag that races SSR/hydration.
fontAwesomeConfig.autoAddCss = false;

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
  const googleAnalyticsId = process.env.GOOGLE_ANALYTICS_ID;
  const analyticsEnabled =
    !!googleAnalyticsId &&
    process.env.NODE_ENV === "production" &&
    process.env.DOMAIN_MODE !== "local";

  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${googleSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppThemeProvider>
          <AppQueryProvider>
            <ScrollToTop />
            <GoogleOAuthProvider clientId={googleOauthId!}>
              <div className="font-google-sans flex min-h-full flex-1 flex-col">
                {children}
              </div>
            </GoogleOAuthProvider>
            <Toaster richColors position="top-center" />
          </AppQueryProvider>
        </AppThemeProvider>
        {analyticsEnabled && <GoogleAnalytics gaId={googleAnalyticsId!} />}
      </body>
    </html>
  );
}
