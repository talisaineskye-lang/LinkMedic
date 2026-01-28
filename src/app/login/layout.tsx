import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | LinkMedic",
  description: "Sign in to LinkMedic to protect your YouTube affiliate revenue. Scan for broken links, get AI-powered fixes, and monitor your channel weekly.",
  keywords: ["linkmedic login", "linkmedic sign in", "youtube affiliate tools"],
  openGraph: {
    title: "Sign In | LinkMedic",
    description: "Sign in to protect your YouTube affiliate revenue.",
    type: "website",
    url: "https://linkmedic.io/login",
  },
  twitter: {
    card: "summary",
    title: "Sign In | LinkMedic",
    description: "Sign in to protect your YouTube affiliate revenue.",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
