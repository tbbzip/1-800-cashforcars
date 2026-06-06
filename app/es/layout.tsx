import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import "../globals.css";
import { getDictionary } from "../dictionaries";
import { createPageMetadata } from "../seo";
import { GtmPhoneClickEvents } from "../components/gtm-events";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dictionary = getDictionary("es");
const gtmId = process.env.NEXT_PUBLIC_GTM_ID ?? "GTM-TR3NQ5M8";

export const metadata: Metadata = createPageMetadata({
  locale: "es",
  title: dictionary.meta.title,
  description: dictionary.meta.description,
  path: "/es",
  alternates: {
    canonical: "/es",
    languages: {
      en: "/",
      es: "/es",
    },
  },
});

export default function SpanishRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <GoogleTagManager gtmId={gtmId} />
      <body className="min-h-full flex flex-col">
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        <GtmPhoneClickEvents />
        {children}
      </body>
    </html>
  );
}
