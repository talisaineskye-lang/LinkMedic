import type { Metadata } from "next";
import { Anton, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LinkMedic - Protect Your Affiliate Revenue",
  description: "Detect, prioritize, and fix broken affiliate links across all your YouTube videos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${anton.variable} ${inter.variable} ${geistMono.variable} font-sans antialiased bg-zinc-950`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
