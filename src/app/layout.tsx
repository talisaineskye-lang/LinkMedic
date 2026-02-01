import type { Metadata } from "next";
import { Outfit, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";
import { CookieConsent } from "@/components/cookie-consent";
import { JsonLd, organizationSchema } from "@/components/JsonLd";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LinkMedic - Stop Leaking Revenue From Your Old Videos",
  description: "Detect, prioritize, and fix broken affiliate links across all your YouTube videos. Scan your channel, find dead links, and recover lost commissions automatically.",
  metadataBase: new URL("https://link-medic.app"),
  openGraph: {
    title: "LinkMedic - Stop Leaking Revenue From Your Old Videos",
    description: "Detect, prioritize, and fix broken affiliate links across all your YouTube videos. Scan your channel, find dead links, and recover lost commissions automatically.",
    url: "https://link-medic.app",
    siteName: "LinkMedic",
    images: [
      {
        url: "/opengraph-image.jpg",
        width: 1200,
        height: 630,
        alt: "LinkMedic - Fix broken affiliate links in your YouTube videos",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkMedic - Stop Leaking Revenue From Your Old Videos",
    description: "Detect, prioritize, and fix broken affiliate links across all your YouTube videos. Scan your channel, find dead links, and recover lost commissions automatically.",
    images: ["/opengraph-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXYMEVL86W"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXYMEVL86W');
          `}
        </Script>
        <JsonLd data={organizationSchema} />
      </head>
      <body
        className={`${outfit.variable} ${geistMono.variable} font-sans antialiased bg-[#0F0F0F]`}
      >
        <Providers>
          {children}
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
