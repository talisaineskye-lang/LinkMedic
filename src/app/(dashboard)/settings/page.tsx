import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SettingsForm } from "@/components/settings-form";

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
      subscriptionStatus: true,
      trialEndsAt: true,
    },
  });

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-300">Manage your account and preferences</p>
      </div>

      {/* Account Info */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-6 backdrop-blur">
        <h2 className="text-lg font-semibold text-white mb-4">Account</h2>
        <dl className="space-y-4">
          <div>
            <dt className="text-sm text-slate-400">Email</dt>
            <dd className="text-white">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-400">Name</dt>
            <dd className="text-white">{user.name || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-400">YouTube Channel</dt>
            <dd className="text-white">
              {user.youtubeChannelId ? (
                <a
                  href={`https://youtube.com/channel/${user.youtubeChannelId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline"
                >
                  {user.youtubeChannelId}
                </a>
              ) : (
                <span className="text-slate-500">Not connected</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-400">Subscription Status</dt>
            <dd>
              <span
                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${
                  user.subscriptionStatus === "active"
                    ? "bg-emerald-950/30 border-emerald-700/50 text-emerald-400"
                    : user.subscriptionStatus === "trial"
                    ? "bg-blue-950/30 border-blue-700/50 text-blue-400"
                    : "bg-red-950/30 border-red-700/50 text-red-400"
                }`}
              >
                {user.subscriptionStatus === "trial"
                  ? `Trial (ends ${user.trialEndsAt ? new Date(user.trialEndsAt).toLocaleDateString() : "N/A"})`
                  : user.subscriptionStatus}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      {/* Revenue Assumptions */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-6 backdrop-blur">
        <h2 className="text-lg font-semibold text-white mb-2">Revenue Assumptions</h2>
        <p className="text-sm text-slate-400 mb-6">
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
      <div className="bg-red-950/20 border border-red-700/50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h2>
        <p className="text-sm text-slate-400 mb-4">
          These actions are irreversible. Please proceed with caution.
        </p>
        <button
          className="px-4 py-2 text-sm font-medium text-red-400 bg-red-950/30 border border-red-700/50 rounded-lg hover:bg-red-950/50 disabled:opacity-50 transition"
          disabled
        >
          Delete Account (Coming Soon)
        </button>
      </div>
    </div>
  );
}
