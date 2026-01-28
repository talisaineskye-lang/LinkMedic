import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | LinkMedic",
  description: "LinkMedic Refund Policy. 14-day money-back guarantee and cancellation terms for LinkMedic subscriptions.",
  keywords: ["linkmedic refund", "refund policy", "money back guarantee", "cancellation"],
  openGraph: {
    title: "Refund Policy | LinkMedic",
    description: "14-day money-back guarantee and cancellation terms.",
    type: "website",
    url: "https://linkmedic.io/refund",
  },
  twitter: {
    card: "summary",
    title: "Refund Policy | LinkMedic",
    description: "14-day money-back guarantee and cancellation terms.",
  },
};

export default function RefundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
