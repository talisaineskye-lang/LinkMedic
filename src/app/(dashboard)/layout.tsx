import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
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

  // Check if trial has expired
  const trialEndsAt = session.user.trialEndsAt;
  const isTrialExpired = trialEndsAt && new Date(trialEndsAt) < new Date();
  const isSubscribed = session.user.subscriptionStatus === "active";

  if (isTrialExpired && !isSubscribed) {
    // For MVP, we'll show a message but still allow access
    // In production, this would redirect to a payment page
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                Link<span className="text-blue-600">Medic</span>
              </Link>
              <nav className="flex gap-6">
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/issues"
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  Issues
                </Link>
                <Link
                  href="/videos"
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  Videos
                </Link>
                <Link
                  href="/settings"
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  Settings
                </Link>
              </nav>
            </div>
            <UserMenu user={session.user} />
          </div>
        </div>
      </header>

      {/* Trial Banner */}
      {trialEndsAt && !isSubscribed && (
        <div className="bg-blue-50 border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <p className="text-sm text-blue-700 text-center">
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
