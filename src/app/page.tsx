import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Link2 } from "lucide-react";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Link2 className="w-10 h-10 text-red-500" />
          <h1 className="text-4xl font-bold">
            <span className="text-white">Link</span><span className="text-red-500">Medic</span>
          </h1>
        </div>
        <p className="text-xl text-gray-300 mb-8">
          Detect, prioritize, and fix broken affiliate links across all your YouTube videos before revenue is lost.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-left mb-8">
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="text-2xl mb-2">🔍</div>
              <h3 className="font-semibold text-white">Scan Links</h3>
              <p className="text-sm text-gray-400">Automatically scan all affiliate links in your video descriptions</p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold text-white">Estimate Impact</h3>
              <p className="text-sm text-gray-400">See estimated revenue loss from broken or out-of-stock links</p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="text-2xl mb-2">🔔</div>
              <h3 className="font-semibold text-white">Get Alerts</h3>
              <p className="text-sm text-gray-400">Receive email notifications when issues are detected</p>
            </div>
          </div>

          <Link
            href="/login"
            className="inline-block bg-red-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            Get Started
          </Link>

          <p className="text-sm text-gray-400 mt-4">
            7-day free trial • $19/month after
          </p>
        </div>
      </div>
    </main>
  );
}
