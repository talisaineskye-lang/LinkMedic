import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SettingsForm } from "@/components/settings-form";
import { SubscriptionSection } from "@/components/subscription-section";
import { AffiliateTagsSection } from "@/components/affiliate-tags-section";
import { getTierDisplayName, getTierBadgeColors } from "@/lib/tier-limits";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  // Get user settings
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      name: true,
      youtubeChannelId: true,
      ctrPercent: true,
      conversionPercent: true,
      avgOrderValue: true,
      affiliateTag: true,
      affiliateTagUS: true,
      affiliateTagUK: true,
      affiliateTagCA: true,
      affiliateTagDE: true,
      trialEndsAt: true,
      tier: true,
      stripeCustomerId: true,
      subscriptionCancelAt: true,
    },
  });

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl tracking-wide mb-1">SETTINGS</h1>
        <p className="text-yt-light">Manage your account and preferences</p>
      </div>

      {/* Account Info */}
      <div className="bg-yt-gray/70 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h2 className="font-display text-xl tracking-wide mb-6">PROFILE</h2>
        <dl className="space-y-4">
          <div>
            <dt className="text-sm text-yt-light mb-1">Email</dt>
            <dd className="text-white">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-yt-light mb-1">Name</dt>
            <dd className="text-white">{user.name || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm text-yt-light mb-1">YouTube Channel</dt>
            <dd className="text-white">
              {user.youtubeChannelId ? (
                <a
                  href={`https://youtube.com/channel/${user.youtubeChannelId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-profit-green hover:underline"
                >
                  {user.youtubeChannelId}
                </a>
              ) : (
                <span className="text-yt-light/50">Not connected</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-yt-light mb-1">Plan</dt>
            <dd className="flex flex-col gap-2">
              <span
                className={`inline-flex px-2 py-1 text-xs font-bold rounded border ${
                  user.subscriptionCancelAt
                    ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400"
                    : getTierBadgeColors(user.tier)
                }`}
              >
                {user.tier === "TRIAL"
                  ? `Trial (ends ${user.trialEndsAt ? new Date(user.trialEndsAt).toLocaleDateString() : "N/A"})`
                  : user.subscriptionCancelAt
                  ? `${getTierDisplayName(user.tier)} (Canceling)`
                  : getTierDisplayName(user.tier)}
              </span>
              {user.subscriptionCancelAt && (
                <span className="text-sm text-yellow-400/80">
                  Full access until {new Date(user.subscriptionCancelAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      {/* Subscription */}
      <SubscriptionSection
        tier={user.tier}
        hasStripeCustomer={!!user.stripeCustomerId}
        subscriptionCancelAt={user.subscriptionCancelAt?.toISOString() ?? null}
      />

      {/* Affiliate Tags */}
      <AffiliateTagsSection
        initialTags={{
          affiliateTagUS: user.affiliateTagUS,
          affiliateTagUK: user.affiliateTagUK,
          affiliateTagCA: user.affiliateTagCA,
          affiliateTagDE: user.affiliateTagDE,
        }}
      />

      {/* Revenue Assumptions */}
      <div className="bg-yt-gray/70 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h2 className="font-display text-xl tracking-wide mb-2">REVENUE ASSUMPTIONS</h2>
        <p className="text-sm text-yt-light mb-6">
          Customize the assumptions used to estimate revenue loss from broken links.
        </p>
        <SettingsForm
          initialValues={{
            ctrPercent: user.ctrPercent ?? 2.0,
            conversionPercent: user.conversionPercent ?? 3.0,
            avgOrderValue: user.avgOrderValue ?? 45.0,
            affiliateTag: user.affiliateTag ?? "",
          }}
        />
      </div>

      {/* Danger Zone */}
      <div className="bg-emergency-red/10 border border-emergency-red/30 rounded-xl p-6">
        <h2 className="font-display text-xl tracking-wide text-emergency-red mb-2">DANGER ZONE</h2>
        <p className="text-sm text-yt-light mb-4">
          These actions are irreversible. Please proceed with caution.
        </p>
        <button
          className="px-4 py-2 text-sm font-semibold text-emergency-red border border-emergency-red/50 rounded-lg hover:bg-emergency-red/10 disabled:opacity-50 transition"
          disabled
        >
          Delete Account (Coming Soon)
        </button>
      </div>
    </div>
  );
}
