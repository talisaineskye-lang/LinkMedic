"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Users, Video, CheckCircle2 } from "lucide-react";

interface YouTubeChannel {
  id: string;
  title: string;
  thumbnailUrl: string;
  subscriberCount: number;
  videoCount: number;
}

function formatCount(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + "M";
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + "K";
  }
  return count.toString();
}

export default function SelectChannelPage() {
  const [channels, setChannels] = useState<YouTubeChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchChannels() {
      try {
        const response = await fetch("/api/channels");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch channels");
        }

        // API returns availableChannels (YouTube channels user can select)
        setChannels(data.availableChannels || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error("Channel fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchChannels();
  }, []);

  const handleSelectChannel = async (channel: YouTubeChannel) => {
    setSelecting(channel.id);
    setError(null);

    try {
      const response = await fetch("/api/channels/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtubeChannelId: channel.id,
          title: channel.title,
          thumbnailUrl: channel.thumbnailUrl,
          subscriberCount: channel.subscriberCount,
          videoCount: channel.videoCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show specific error from API
        throw new Error(data.error || "Failed to add channel");
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add channel";
      setError(message);
      setSelecting(null);
      console.error("Channel add error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0f172a]/95 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="LinkMedic" width={120} height={28} className="h-7 w-auto" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="font-display text-3xl tracking-wide mb-4">SELECT YOUR YOUTUBE CHANNEL</h1>
          <p className="text-slate-400">
            Choose which channel you want to monitor for affiliate link health.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-4" />
            <p className="text-slate-400">Loading your channels...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white/5 hover:bg-white/5/80 border border-white/10 rounded-lg text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : channels.length === 0 ? (
          <div className="bg-white/5/70 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
            <p className="text-slate-400 mb-4">
              No YouTube channels found for your account.
            </p>
            <p className="text-sm text-slate-400/50">
              Make sure you have a YouTube channel associated with your Google account.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => handleSelectChannel(channel)}
                disabled={selecting !== null}
                className={`w-full bg-white/5/70 backdrop-blur-sm border rounded-xl p-6 text-left transition-all hover:bg-white/5 hover:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed ${
                  selecting === channel.id
                    ? "border-cyan-500 shadow-[0_0_20px_rgba(0,255,0,0.15)]"
                    : "border-white/10"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Channel Thumbnail */}
                  <div className="relative flex-shrink-0">
                    {channel.thumbnailUrl ? (
                      <Image
                        src={channel.thumbnailUrl}
                        alt={channel.title}
                        width={64}
                        height={64}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-[#0f172a] rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                    {selecting === channel.id && (
                      <div className="absolute inset-0 bg-cyan-500/20 rounded-full flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Channel Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate">
                      {channel.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {formatCount(channel.subscriberCount)} subscribers
                      </span>
                      <span className="flex items-center gap-1">
                        <Video className="w-4 h-4" />
                        {formatCount(channel.videoCount)} videos
                      </span>
                    </div>
                  </div>

                  {/* Select Indicator */}
                  <div className="flex-shrink-0">
                    {selecting === channel.id ? (
                      <CheckCircle2 className="w-6 h-6 text-cyan-400" />
                    ) : (
                      <div className="w-6 h-6 border-2 border-slate-400/30 rounded-full" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {channels.length > 0 && (
          <p className="text-center text-sm text-slate-400/50 mt-8">
            You can change your channel selection later in Settings.
          </p>
        )}
      </main>
    </div>
  );
}
