import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { UserMenu } from "@/components/user-menu";
import { OnboardingModal } from "@/components/onboarding-modal";
import { ChannelSwitcher } from "@/components/channel-switcher";
import { LinkStatus } from "@prisma/client";
import { getMaxChannels } from "@/lib/tier-limits";

// All statuses that indicate a broken/problematic link
const PROBLEM_STATUSES: LinkStatus[] = [
  LinkStatus.NOT_FOUND,
  LinkStatus.OOS,
  LinkStatus.OOS_THIRD_PARTY,
  LinkStatus.SEARCH_REDIRECT,
  LinkStatus.MISSING_TAG,
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Check if user has selected a YouTube channel and get onboarding status
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      youtubeChannelId: true,
      affiliateTag: true,
      hasCompletedFirstScan: true,
      subscriptionCancelAt: true,
      tier: true,
      activeChannelId: true,
    },
  });

  if (!user?.youtubeChannelId) {
    redirect("/onboarding/select-channel");
  }

  // Fetch user's connected channels for the channel switcher
  const channels = await (prisma as any).channel.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      youtubeChannelId: true,
      title: true,
      thumbnailUrl: true,
      subscriberCount: true,
      videoCount: true,
    },
  });

  const channelLimit = getMaxChannels(user.tier);

  // Auto-set activeChannelId if null but channels exist (handles edge case after migration or channel deletion)
  let effectiveActiveChannelId = user.activeChannelId;
  if (!effectiveActiveChannelId && channels.length > 0) {
    effectiveActiveChannelId = channels[0].id;
    // Update in background (fire-and-forget) to persist the fix
    prisma.user.update({
      where: { id: session.user.id },
      data: { activeChannelId: channels[0].id },
    }).catch(() => {
      // Ignore errors - this is a background optimization
    });
  }

  // Build channel filter for queries
  const channelFilter = effectiveActiveChannelId
    ? { channelId: effectiveActiveChannelId }
    : {};

  // Show onboarding modal if user hasn't set up affiliate tag or completed first scan
  const showOnboardingModal = !user.affiliateTag || !user.hasCompletedFirstScan;

  // Get count of broken links for badge (filtered by active channel)
  const brokenCount = await prisma.affiliateLink.count({
    where: {
      video: { userId: session.user.id, ...channelFilter },
      status: { in: PROBLEM_STATUSES },
      isFixed: false,
      isDismissed: false,
    },
  });

  // Check if trial has expired
  const trialEndsAt = session.user.trialEndsAt;
  const isTrialExpired = trialEndsAt && new Date(trialEndsAt) < new Date();
  const isSubscribed = session.user.tier === "SPECIALIST" || session.user.tier === "OPERATOR";

  if (isTrialExpired && !isSubscribed) {
    // For MVP, we'll show a message but still allow access
    // In production, this would redirect to a payment page
  }

  return (
    <div className="min-h-screen bg-yt-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-yt-dark/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center">
                <Image src="/logo.png" alt="LinkMedic" width={120} height={28} className="h-7 w-auto" />
              </Link>
              <nav className="hidden md:flex gap-6">
                <Link
                  href="/dashboard"
                  className="text-yt-light hover:text-white text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/fix-center"
                  className="text-yt-light hover:text-white text-sm font-medium transition-colors flex items-center gap-2"
                >
                  Fix Center
                  {brokenCount > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full bg-emergency-red text-white min-w-[20px]">
                      {brokenCount > 99 ? "99+" : brokenCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/history"
                  className="text-yt-light hover:text-white text-sm font-medium transition-colors"
                >
                  History
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              {/* Channel Switcher - only show for Operator tier or if user has channels */}
              {channels.length > 0 && (
                <ChannelSwitcher
                  channels={channels}
                  activeChannelId={effectiveActiveChannelId}
                  channelLimit={channelLimit}
                  tier={user.tier}
                />
              )}
              <UserMenu user={session.user} />
            </div>
          </div>
        </div>
      </header>

      {/* Trial Banner */}
      {trialEndsAt && !isSubscribed && (
        <div className="bg-emergency-red/10 border-b border-emergency-red/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <p className="text-sm text-emergency-red text-center">
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

      {/* Subscription Canceling Banner */}
      {user.subscriptionCancelAt && isSubscribed && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <p className="text-sm text-yellow-400 text-center">
              Your subscription is canceling. You have full access until{" "}
              <span className="font-semibold">
                {new Date(user.subscriptionCancelAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
              .{" "}
              <Link href="/settings" className="underline hover:text-yellow-300">
                Reactivate in Settings →
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Onboarding Modal */}
      <OnboardingModal show={showOnboardingModal} />
    </div>
  );
}
