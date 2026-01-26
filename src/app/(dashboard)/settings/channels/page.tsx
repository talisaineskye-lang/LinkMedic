import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ChannelManagement } from "@/components/channel-management";
import { getMaxChannels, getTierDisplayName } from "@/lib/tier-limits";
import { UserTier } from "@prisma/client";

export default async function ChannelsSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      tier: true,
      activeChannelId: true,
    },
  });

  if (!user) {
    return null;
  }

  // Fetch user's connected channels
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
      createdAt: true,
    },
  });

  const channelLimit = getMaxChannels(user.tier);
  const isOverLimit = channels.length > channelLimit;
  const isOperator = user.tier === UserTier.OPERATOR;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl tracking-wide mb-1">CHANNELS</h1>
        <p className="text-yt-light">Manage your connected YouTube channels</p>
      </div>

      {/* Over Limit Warning */}
      {isOverLimit && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <h3 className="font-semibold text-yellow-400 mb-1">Channel Limit Exceeded</h3>
          <p className="text-sm text-yellow-400/80">
            Your {getTierDisplayName(user.tier)} plan allows {channelLimit} channel{channelLimit !== 1 ? "s" : ""},
            but you have {channels.length} connected. You can view all channels, but scanning is limited to your
            first {channelLimit}. Remove channels or{" "}
            <a href="/pricing" className="underline hover:text-yellow-300">
              upgrade to Operator
            </a>{" "}
            for up to 3 channels.
          </p>
        </div>
      )}

      {/* Current Plan Info */}
      <div className="bg-yt-gray/70 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl tracking-wide mb-1">YOUR PLAN</h2>
            <p className="text-yt-light">
              {getTierDisplayName(user.tier)} &middot; {channels.length}/{channelLimit} channels used
            </p>
          </div>
          {!isOperator && (
            <a
              href="/pricing"
              className="px-4 py-2 bg-profit-green hover:bg-profit-green/90 text-black font-semibold rounded-lg transition-colors"
            >
              Upgrade for More Channels
            </a>
          )}
        </div>
      </div>

      {/* Channel Management */}
      <ChannelManagement
        channels={channels}
        activeChannelId={user.activeChannelId}
        channelLimit={channelLimit}
        tier={user.tier}
        isOverLimit={isOverLimit}
      />
    </div>
  );
}
