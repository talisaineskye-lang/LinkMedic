import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | LinkMedic",
  description: "LinkMedic Terms of Service. Read our terms and conditions for using the LinkMedic affiliate link management service.",
  keywords: ["linkmedic terms", "terms of service", "terms and conditions"],
  openGraph: {
    title: "Terms of Service | LinkMedic",
    description: "Read LinkMedic's terms and conditions.",
    type: "website",
    url: "https://linkmedic.io/terms",
  },
  twitter: {
    card: "summary",
    title: "Terms of Service | LinkMedic",
    description: "Read LinkMedic's terms and conditions.",
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
