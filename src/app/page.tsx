import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Link2, Search, TrendingDown, Bell } from "lucide-react";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-semibold flex items-center justify-center gap-1 mb-4 text-gray-900">
          <span>Link</span>
          <Link2 className="w-8 h-8 text-emerald-600" />
          <span>Medic</span>
        </h1>
        <p className="text-lg text-gray-600 mb-12">
          Automated link health monitoring for YouTube creators. Detect broken affiliate links before they cost you revenue.
        </p>

        <div className="grid grid-cols-3 gap-6 text-left mb-12">
          <div className="p-5 bg-white rounded-lg border border-gray-200">
            <Search className="w-5 h-5 text-gray-400 mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">Automated Scans</h3>
            <p className="text-sm text-gray-500">Weekly checks across all your video descriptions</p>
          </div>
          <div className="p-5 bg-white rounded-lg border border-gray-200">
            <TrendingDown className="w-5 h-5 text-amber-500 mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">Revenue Impact</h3>
            <p className="text-sm text-gray-500">Estimated loss from broken or out-of-stock links</p>
          </div>
          <div className="p-5 bg-white rounded-lg border border-gray-200">
            <Bell className="w-5 h-5 text-gray-400 mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">Email Alerts</h3>
            <p className="text-sm text-gray-500">Get notified when issues need attention</p>
          </div>
        </div>

        <Link
          href="/login"
          className="inline-block bg-gray-900 text-white px-6 py-2.5 rounded-md font-medium hover:bg-gray-800 transition-colors"
        >
          Get Started
        </Link>

        <p className="text-sm text-gray-400 mt-4">
          7-day free trial · $19/month
        </p>
      </div>
    </main>
  );
}
