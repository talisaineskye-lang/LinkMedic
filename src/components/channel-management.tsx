"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Youtube,
  Trash2,
  Plus,
  Check,
  Loader2,
  AlertTriangle,
  Crown,
} from "lucide-react";

interface Channel {
  id: string;
  youtubeChannelId: string;
  title: string;
  thumbnailUrl?: string | null;
  subscriberCount?: number;
  videoCount?: number;
  createdAt?: string;
}

interface ChannelManagementProps {
  channels: Channel[];
  activeChannelId: string | null;
  channelLimit: number;
  tier: string;
  isOverLimit: boolean;
}

export function ChannelManagement({
  channels,
  activeChannelId,
  channelLimit,
  tier,
  isOverLimit,
}: ChannelManagementProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingChannelId, setLoadingChannelId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [availableChannels, setAvailableChannels] = useState<Channel[]>([]);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [fetchingAvailable, setFetchingAvailable] = useState(false);
  const router = useRouter();

  const isOperator = tier === "OPERATOR";
  const canAddMore = channels.length < channelLimit;

  const fetchAvailableChannels = async () => {
    setFetchingAvailable(true);
    setError(null);
    try {
      const response = await fetch("/api/channels");
      const data = await response.json();

      if (response.ok) {
        // Filter to only show channels not yet connected
        const unconnected = data.availableChannels?.filter(
          (c: { isConnected: boolean }) => !c.isConnected
        ) || [];
        setAvailableChannels(unconnected);
        setShowAddPanel(true);
      } else {
        setError(data.error || "Failed to fetch channels");
      }
    } catch {
      setError("Failed to fetch available channels");
    } finally {
      setFetchingAvailable(false);
    }
  };

  const handleAddChannel = async (channel: Channel) => {
    // Check if at limit before trying
    if (!canAddMore) {
      setShowUpgradePrompt(true);
      return;
    }

    setLoadingChannelId(channel.youtubeChannelId);
    setError(null);

    try {
      const response = await fetch("/api/channels/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtubeChannelId: channel.youtubeChannelId,
          title: channel.title,
          thumbnailUrl: channel.thumbnailUrl,
          subscriberCount: channel.subscriberCount,
          videoCount: channel.videoCount,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowAddPanel(false);
        router.refresh();
      } else if (data.upgradeRequired) {
        setShowUpgradePrompt(true);
      } else {
        setError(data.error || "Failed to add channel");
      }
    } catch {
      setError("Failed to add channel");
    } finally {
      setLoadingChannelId(null);
    }
  };

  const handleRemoveChannel = async (channelId: string) => {
    if (!confirm("Remove this channel? Videos will remain but won't be associated with a channel.")) {
      return;
    }

    setLoadingChannelId(channelId);
    setError(null);

    try {
      const response = await fetch("/api/channels/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to remove channel");
      }
    } catch {
      setError("Failed to remove channel");
    } finally {
      setLoadingChannelId(null);
    }
  };

  const handleSetActive = async (channelId: string) => {
    if (channelId === activeChannelId) return;

    setLoadingChannelId(channelId);
    setError(null);

    try {
      const response = await fetch("/api/channels/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to switch channel");
      }
    } catch {
      setError("Failed to switch channel");
    } finally {
      setLoadingChannelId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-emergency-red/10 border border-emergency-red/30 rounded-xl p-4">
          <p className="text-sm text-emergency-red">{error}</p>
        </div>
      )}

      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-yt-dark border border-white/10 rounded-xl p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-8 h-8 text-profit-green" />
              <h3 className="font-display text-xl">UPGRADE REQUIRED</h3>
            </div>
            <p className="text-yt-light mb-6">
              Your current plan only allows {channelLimit} channel{channelLimit !== 1 ? "s" : ""}.
              Upgrade to Operator ($39/mo) to connect up to 3 YouTube channels and manage them
              from a unified dashboard.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradePrompt(false)}
                className="flex-1 px-4 py-2 border border-white/20 rounded-lg text-yt-light hover:text-white hover:border-white/40 transition-colors"
              >
                Maybe Later
              </button>
              <a
                href="/pricing"
                className="flex-1 px-4 py-2 bg-profit-green hover:bg-profit-green/90 text-black font-semibold rounded-lg text-center transition-colors"
              >
                View Plans
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Connected Channels */}
      <div className="bg-yt-gray/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h2 className="font-display text-lg tracking-wide">CONNECTED CHANNELS</h2>
        </div>

        {channels.length === 0 ? (
          <div className="p-8 text-center">
            <Youtube className="w-12 h-12 mx-auto text-yt-light/50 mb-3" />
            <p className="text-yt-light">No channels connected yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {channels.map((channel, index) => {
              const isActive = channel.id === activeChannelId;
              const isDisabled = isOverLimit && index >= channelLimit;
              const isLoadingThis = loadingChannelId === channel.id;

              return (
                <div
                  key={channel.id}
                  className={`flex items-center gap-4 p-4 ${
                    isDisabled ? "opacity-50" : ""
                  }`}
                >
                  {/* Thumbnail */}
                  {channel.thumbnailUrl ? (
                    <Image
                      src={channel.thumbnailUrl}
                      alt={channel.title}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-yt-gray flex items-center justify-center">
                      <Youtube className="w-6 h-6 text-yt-light" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white truncate">{channel.title}</p>
                      {isActive && (
                        <span className="text-xs px-2 py-0.5 bg-profit-green/20 text-profit-green rounded">
                          Active
                        </span>
                      )}
                      {isDisabled && (
                        <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Over limit
                        </span>
                      )}
                    </div>
                    {channel.videoCount !== undefined && (
                      <p className="text-sm text-yt-light">
                        {channel.videoCount.toLocaleString()} videos
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!isActive && !isDisabled && (
                      <button
                        onClick={() => handleSetActive(channel.id)}
                        disabled={isLoadingThis}
                        className="px-3 py-1.5 text-sm text-yt-light hover:text-white border border-white/20 hover:border-white/40 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isLoadingThis ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Set Active"
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveChannel(channel.id)}
                      disabled={isLoadingThis}
                      className="p-2 text-yt-light hover:text-emergency-red transition-colors disabled:opacity-50"
                      title="Remove channel"
                    >
                      {isLoadingThis ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Channel Button */}
        {isOperator && (
          <div className="p-4 border-t border-white/10">
            <button
              onClick={fetchAvailableChannels}
              disabled={fetchingAvailable || !canAddMore}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                canAddMore
                  ? "text-profit-green hover:bg-profit-green/10"
                  : "text-yt-light cursor-not-allowed"
              }`}
            >
              {fetchingAvailable ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {canAddMore
                ? `Add Channel (${channels.length}/${channelLimit})`
                : `Channel limit reached (${channelLimit}/${channelLimit})`}
            </button>
          </div>
        )}
      </div>

      {/* Add Channel Panel */}
      {showAddPanel && availableChannels.length > 0 && (
        <div className="bg-yt-gray/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-display text-lg tracking-wide">AVAILABLE CHANNELS</h2>
            <button
              onClick={() => setShowAddPanel(false)}
              className="text-yt-light hover:text-white"
            >
              Cancel
            </button>
          </div>
          <div className="divide-y divide-white/5">
            {availableChannels.map((channel) => {
              const isLoadingThis = loadingChannelId === channel.youtubeChannelId;

              return (
                <div key={channel.youtubeChannelId} className="flex items-center gap-4 p-4">
                  {channel.thumbnailUrl ? (
                    <Image
                      src={channel.thumbnailUrl}
                      alt={channel.title}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-yt-gray flex items-center justify-center">
                      <Youtube className="w-6 h-6 text-yt-light" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{channel.title}</p>
                    {channel.videoCount !== undefined && (
                      <p className="text-sm text-yt-light">
                        {channel.videoCount.toLocaleString()} videos
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddChannel(channel)}
                    disabled={isLoadingThis}
                    className="flex items-center gap-2 px-4 py-2 bg-profit-green hover:bg-profit-green/90 text-black font-semibold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isLoadingThis ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showAddPanel && availableChannels.length === 0 && (
        <div className="bg-yt-gray/70 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
          <Check className="w-12 h-12 mx-auto text-profit-green mb-3" />
          <p className="text-white font-medium mb-1">All channels connected</p>
          <p className="text-sm text-yt-light">
            All YouTube channels associated with your account are already connected.
          </p>
          <button
            onClick={() => setShowAddPanel(false)}
            className="mt-4 px-4 py-2 border border-white/20 rounded-lg text-yt-light hover:text-white hover:border-white/40 transition-colors"
          >
            Close
          </button>
        </div>
      )}

      {/* Non-Operator Upgrade CTA */}
      {!isOperator && (
        <div className="bg-gradient-to-r from-profit-green/10 to-profit-green/5 border border-profit-green/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <Crown className="w-8 h-8 text-profit-green flex-shrink-0" />
            <div>
              <h3 className="font-display text-lg text-white mb-1">MANAGE MULTIPLE CHANNELS</h3>
              <p className="text-sm text-yt-light mb-4">
                Upgrade to Operator ($39/mo) to connect up to 3 YouTube channels. Perfect for
                creators who manage multiple channels or work with clients.
              </p>
              <a
                href="/pricing"
                className="inline-flex items-center gap-2 px-4 py-2 bg-profit-green hover:bg-profit-green/90 text-black font-semibold rounded-lg transition-colors"
              >
                Upgrade to Operator
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
