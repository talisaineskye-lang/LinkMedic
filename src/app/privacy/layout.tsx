import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | LinkMedic",
  description: "LinkMedic Privacy Policy. Learn how we collect, use, and protect your data including YouTube channel information and affiliate link data.",
  keywords: ["linkmedic privacy", "privacy policy", "data protection"],
  openGraph: {
    title: "Privacy Policy | LinkMedic",
    description: "Learn how LinkMedic collects, uses, and protects your data.",
    type: "website",
    url: "https://linkmedic.io/privacy",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | LinkMedic",
    description: "Learn how LinkMedic collects, uses, and protects your data.",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
