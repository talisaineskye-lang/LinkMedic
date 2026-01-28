import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | LinkMedic",
  description: "LinkMedic Cookie Policy. Learn about the minimal cookies we use and how we protect your privacy.",
  keywords: ["linkmedic cookies", "cookie policy", "tracking"],
  openGraph: {
    title: "Cookie Policy | LinkMedic",
    description: "Learn about the minimal cookies LinkMedic uses.",
    type: "website",
    url: "https://linkmedic.io/cookies",
  },
  twitter: {
    card: "summary",
    title: "Cookie Policy | LinkMedic",
    description: "Learn about the minimal cookies LinkMedic uses.",
  },
};

export default function CookiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
