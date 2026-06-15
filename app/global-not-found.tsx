import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NotFoundContent } from "./components/not-found-content";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "404 - Page Not Found | Cash For Cars San Diego",
  description:
    "This page could not be found. Return to Cash For Cars San Diego to start a cash offer or call for help.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function GlobalNotFound() {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#07150d] text-white">
        <NotFoundContent locale="en" />
      </body>
    </html>
  );
}
