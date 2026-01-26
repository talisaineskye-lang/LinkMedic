"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus, Check, Youtube, Loader2 } from "lucide-react";

interface Channel {
  id: string;
  youtubeChannelId: string;
  title: string;
  thumbnailUrl?: string | null;
  subscriberCount?: number;
  videoCount?: number;
}

interface ChannelSwitcherProps {
  channels: Channel[];
  activeChannelId: string | null;
  channelLimit: number;
  tier: string;
}

export function ChannelSwitcher({
  channels,
  activeChannelId,
  channelLimit,
  tier,
}: ChannelSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];
  const canAddMore = channels.length < channelLimit;
  const isOperator = tier === "OPERATOR";

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitchChannel = async (channelId: string) => {
    if (channelId === activeChannelId) {
      setIsOpen(false);
      return;
    }

    setIsSwitching(true);
    try {
      const response = await fetch("/api/channels/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId }),
      });

      if (response.ok) {
        setIsOpen(false);
        router.refresh();
      } else {
        console.error("Failed to switch channel");
      }
    } catch (error) {
      console.error("Error switching channel:", error);
    } finally {
      setIsSwitching(false);
    }
  };

  // Don't show switcher if user has no channels
  if (channels.length === 0) {
    return null;
  }

  // For single-channel users (non-Operator), show simpler display
  if (!isOperator && channels.length <= 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yt-gray/50 border border-white/10">
        <Youtube className="w-4 h-4 text-profit-green" />
        <span className="text-sm text-white truncate max-w-[140px]">
          {activeChannel?.title || "No Channel"}
        </span>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yt-gray/50 border border-white/10 hover:bg-yt-gray hover:border-white/20 transition-colors"
      >
        {activeChannel?.thumbnailUrl ? (
          <Image
            src={activeChannel.thumbnailUrl}
            alt={activeChannel.title}
            width={24}
            height={24}
            className="rounded-full"
          />
        ) : (
          <Youtube className="w-5 h-5 text-profit-green" />
        )}
        <span className="text-sm text-white truncate max-w-[120px]">
          {activeChannel?.title || "Select Channel"}
        </span>
        <span className="text-xs text-yt-light bg-yt-gray px-1.5 py-0.5 rounded">
          {channels.length}/{channelLimit}
        </span>
        {isSwitching ? (
          <Loader2 className="w-4 h-4 text-yt-light animate-spin" />
        ) : (
          <ChevronDown
            className={`w-4 h-4 text-yt-light transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 bg-yt-dark border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
          {/* Channel list */}
          <div className="py-2">
            <div className="px-3 py-1.5 text-xs font-semibold text-yt-light uppercase tracking-wide">
              Your Channels
            </div>
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => handleSwitchChannel(channel.id)}
                disabled={isSwitching}
                className={`flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-white/5 transition-colors ${
                  channel.id === activeChannelId ? "bg-profit-green/10" : ""
                }`}
              >
                {channel.thumbnailUrl ? (
                  <Image
                    src={channel.thumbnailUrl}
                    alt={channel.title}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-yt-gray flex items-center justify-center">
                    <Youtube className="w-4 h-4 text-yt-light" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{channel.title}</p>
                  {channel.videoCount !== undefined && (
                    <p className="text-xs text-yt-light">
                      {channel.videoCount.toLocaleString()} videos
                    </p>
                  )}
                </div>
                {channel.id === activeChannelId && (
                  <Check className="w-4 h-4 text-profit-green flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Add channel option */}
          {isOperator && (
            <div className="py-2 border-t border-white/10">
              {canAddMore ? (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push("/settings/channels");
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2 text-sm text-profit-green hover:bg-white/5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Channel ({channels.length}/{channelLimit})
                </button>
              ) : (
                <div className="px-3 py-2 text-sm text-yt-light">
                  Channel limit reached ({channelLimit}/{channelLimit})
                </div>
              )}
            </div>
          )}

          {/* Upgrade prompt for non-Operator */}
          {!isOperator && channels.length >= channelLimit && (
            <div className="py-2 border-t border-white/10">
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push("/pricing");
                }}
                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-profit-green hover:bg-white/5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Upgrade for more channels
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
