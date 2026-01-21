import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Link as LinkIcon } from "lucide-react";
import { UserMenu } from "@/components/user-menu";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Check if user has selected a YouTube channel
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { youtubeChannelId: true },
  });

  if (!user?.youtubeChannelId) {
    redirect("/onboarding/select-channel");
  }

  // Check if trial has expired
  const trialEndsAt = session.user.trialEndsAt;
  const isTrialExpired = trialEndsAt && new Date(trialEndsAt) < new Date();
  const isSubscribed = session.user.subscriptionStatus === "active";

  if (isTrialExpired && !isSubscribed) {
    // For MVP, we'll show a message but still allow access
    // In production, this would redirect to a payment page
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-0.5 text-xl font-semibold">
                <span className="text-white">Link</span>
                <LinkIcon className="w-5 h-5 text-emerald-500" />
                <span className="text-emerald-500">Medic</span>
              </Link>
              <nav className="hidden md:flex gap-6">
                <Link
                  href="/dashboard"
                  className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/issues"
                  className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
                >
                  Issues
                </Link>
                <Link
                  href="/videos"
                  className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
                >
                  Videos
                </Link>
              </nav>
            </div>
            <UserMenu user={session.user} />
          </div>
        </div>
      </header>

      {/* Trial Banner */}
      {trialEndsAt && !isSubscribed && (
        <div className="bg-amber-500/10 border-b border-amber-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <p className="text-sm text-amber-400 text-center">
              {isTrialExpired ? (
                <>Your trial has expired. Subscribe to continue using LinkMedic.</>
              ) : (
                <>
                  Trial ends {new Date(trialEndsAt).toLocaleDateString()}. Subscribe for $19/month to continue.
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
