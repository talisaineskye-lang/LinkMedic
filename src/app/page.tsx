import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Link<span className="text-blue-600">Medic</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Detect, prioritize, and fix broken affiliate links across all your YouTube videos before revenue is lost.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-left mb-8">
            <div className="p-4 bg-white rounded-lg shadow-sm border">
              <div className="text-2xl mb-2">🔍</div>
              <h3 className="font-semibold text-gray-900">Scan Links</h3>
              <p className="text-sm text-gray-600">Automatically scan all affiliate links in your video descriptions</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm border">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold text-gray-900">Estimate Impact</h3>
              <p className="text-sm text-gray-600">See estimated revenue loss from broken or out-of-stock links</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm border">
              <div className="text-2xl mb-2">🔔</div>
              <h3 className="font-semibold text-gray-900">Get Alerts</h3>
              <p className="text-sm text-gray-600">Receive email notifications when issues are detected</p>
            </div>
          </div>

          <Link
            href="/login"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>

          <p className="text-sm text-gray-500 mt-4">
            7-day free trial • $19/month after
          </p>
        </div>
      </div>
    </main>
  );
}
