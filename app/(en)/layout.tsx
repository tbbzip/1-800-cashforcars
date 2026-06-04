import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { getDictionary } from "../dictionaries";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dictionary = getDictionary("en");

export const metadata: Metadata = {
  title: dictionary.meta.title,
  description: dictionary.meta.description,
  openGraph: {
    title: dictionary.meta.title,
    description: dictionary.meta.description,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: dictionary.meta.title,
    description: dictionary.meta.description,
  },
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      es: "/es",
    },
  },
};

export default function EnglishRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
