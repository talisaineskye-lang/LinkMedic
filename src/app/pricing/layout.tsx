import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | LinkMedic – YouTube Affiliate Link Protection",
  description: "Choose the plan that fits your channel. From free audits to full protection with weekly scans, AI-powered fix suggestions, and priority support.",
  keywords: ["linkmedic pricing", "youtube affiliate tools", "affiliate link checker pricing", "youtube creator tools"],
  openGraph: {
    title: "Pricing | LinkMedic – YouTube Affiliate Link Protection",
    description: "Choose the plan that fits your channel. Free audits, weekly scans, AI-powered fixes.",
    type: "website",
    url: "https://linkmedic.io/pricing",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing | LinkMedic",
    description: "Choose the plan that fits your channel. Free audits, weekly scans, AI-powered fixes.",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
