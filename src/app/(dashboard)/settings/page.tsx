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
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>
        <dl className="space-y-4">
          <div>
            <dt className="text-sm text-gray-500">Email</dt>
            <dd className="text-gray-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Name</dt>
            <dd className="text-gray-900">{user.name || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">YouTube Channel</dt>
            <dd className="text-gray-900">
              {user.youtubeChannelId ? (
                <a
                  href={`https://youtube.com/channel/${user.youtubeChannelId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {user.youtubeChannelId}
                </a>
              ) : (
                "Not connected"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Subscription Status</dt>
            <dd>
              <span
                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  user.subscriptionStatus === "active"
                    ? "bg-green-100 text-green-700"
                    : user.subscriptionStatus === "trial"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-red-100 text-red-700"
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
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Revenue Assumptions</h2>
        <p className="text-sm text-gray-500 mb-6">
          Customize the assumptions used to estimate revenue loss from broken links.
        </p>
        <SettingsForm
          initialValues={{
            ctrPercent: user.ctrPercent ?? 2.0,
            conversionPercent: user.conversionPercent ?? 3.0,
            avgOrderValue: user.avgOrderValue ?? 45.0,
          }}
        />
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-4">
          These actions are irreversible. Please proceed with caution.
        </p>
        <button
          className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50"
          disabled
        >
          Delete Account (Coming Soon)
        </button>
      </div>
    </div>
  );
}
