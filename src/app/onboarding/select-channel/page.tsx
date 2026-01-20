"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Link as LinkIcon, Loader2, Users, Video, CheckCircle2 } from "lucide-react";

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
        if (!response.ok) {
          throw new Error("Failed to fetch channels");
        }
        const data = await response.json();
        setChannels(data.channels);
      } catch (err) {
        setError("Failed to load your YouTube channels. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchChannels();
  }, []);

  const handleSelectChannel = async (channel: YouTubeChannel) => {
    setSelecting(channel.id);
    try {
      const response = await fetch("/api/channels/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId: channel.id,
          channelTitle: channel.title,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to select channel");
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError("Failed to select channel. Please try again.");
      setSelecting(null);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-0.5 text-xl font-semibold">
            <span className="text-white">Link</span>
            <LinkIcon className="w-5 h-5 text-emerald-500" />
            <span className="text-emerald-500">Medic</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Select Your YouTube Channel</h1>
          <p className="text-slate-400">
            Choose which channel you want to monitor for affiliate link health.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
            <p className="text-slate-400">Loading your channels...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : channels.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 text-center">
            <p className="text-slate-400 mb-4">
              No YouTube channels found for your account.
            </p>
            <p className="text-sm text-slate-500">
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
                className={`w-full bg-slate-800/50 border rounded-xl p-6 text-left transition-all hover:bg-slate-800 hover:border-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed ${
                  selecting === channel.id
                    ? "border-emerald-500"
                    : "border-slate-700/50"
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
                      <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                    {selecting === channel.id && (
                      <div className="absolute inset-0 bg-emerald-500/20 rounded-full flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
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
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <div className="w-6 h-6 border-2 border-slate-600 rounded-full" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {channels.length > 0 && (
          <p className="text-center text-sm text-slate-500 mt-8">
            You can change your channel selection later in Settings.
          </p>
        )}
      </main>
    </div>
  );
}
