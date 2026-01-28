"use client";

import { useState } from "react";
import { Search, ExternalLink } from "lucide-react";

const AMAZON_REGIONS = {
  US: { domain: "amazon.com", flag: "\ud83c\uddfa\ud83c\uddf8", name: "United States" },
  UK: { domain: "amazon.co.uk", flag: "\ud83c\uddec\ud83c\udde7", name: "United Kingdom" },
  CA: { domain: "amazon.ca", flag: "\ud83c\udde8\ud83c\udde6", name: "Canada" },
  DE: { domain: "amazon.de", flag: "\ud83c\udde9\ud83c\uddea", name: "Germany" },
} as const;

type AmazonRegion = keyof typeof AMAZON_REGIONS;

interface FindReplacementProps {
  link: {
    id: string;
    originalUrl: string;
    amazonRegion?: string | null;
  };
  videoTitle: string;
  userTags: {
    US: string | null;
    UK: string | null;
    CA: string | null;
    DE: string | null;
  };
  defaultRegion?: AmazonRegion;
}

function buildAmazonSearchUrl(
  query: string,
  region: AmazonRegion,
  affiliateTag?: string | null
): string {
  const domain = AMAZON_REGIONS[region].domain;
  const searchUrl = new URL(`https://www.${domain}/s`);
  searchUrl.searchParams.set("k", query);
  if (affiliateTag) {
    searchUrl.searchParams.set("tag", affiliateTag);
  }
  return searchUrl.toString();
}

export function FindReplacement({
  link,
  videoTitle,
  userTags,
  defaultRegion = "US",
}: FindReplacementProps) {
  // Default to original link's region, fallback to default
  const detectedRegion = (link.amazonRegion as AmazonRegion) || defaultRegion;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<AmazonRegion>(detectedRegion);

  const affiliateTag = userTags[selectedRegion];
  const searchUrl = searchTerm
    ? buildAmazonSearchUrl(searchTerm, selectedRegion, affiliateTag)
    : null;

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      return;
    }
    window.open(searchUrl!, "_blank", "noopener,noreferrer");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      handleSearch();
    }
  };

  return (
    <div className="mt-4 p-4 bg-white/5/50 rounded-lg border border-white/5">
      {/* Context hint */}
      <p className="text-slate-400 text-xs mb-3">
        From video:{" "}
        <span className="text-white">&quot;{videoTitle.slice(0, 60)}{videoTitle.length > 60 ? "..." : ""}&quot;</span>
      </p>

      {/* Original region badge */}
      {link.amazonRegion && (
        <p className="text-xs text-slate-400/70 mb-3">
          Original link: {AMAZON_REGIONS[link.amazonRegion as AmazonRegion]?.flag}{" "}
          {link.amazonRegion}
        </p>
      )}

      {/* Search input */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400/50" />
          <input
            type="text"
            placeholder="What was this product? (e.g., wireless mouse)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-slate-400/50 focus:outline-none focus:border-white/30 transition"
          />
        </div>

        {/* Region selector */}
        <div className="relative">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value as AmazonRegion)}
            className="appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-3 pr-10 text-sm text-white focus:outline-none focus:border-white/30 cursor-pointer w-full sm:w-auto"
          >
            {(Object.keys(AMAZON_REGIONS) as AmazonRegion[]).map((region) => (
              <option key={region} value={region}>
                {AMAZON_REGIONS[region].flag} {region}
              </option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400/50 pointer-events-none text-xs">
            &#9660;
          </span>
        </div>

        {/* Search button */}
        <button
          onClick={handleSearch}
          disabled={!searchTerm.trim()}
          className={`rounded-lg px-5 py-3 font-bold text-sm text-center whitespace-nowrap transition flex items-center justify-center gap-2 ${
            searchTerm.trim()
              ? "bg-cyan-500 text-black hover:brightness-110"
              : "bg-white/5 border border-white/10 text-slate-400/50 cursor-not-allowed"
          }`}
        >
          <span>Search {AMAZON_REGIONS[selectedRegion].flag}</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Tag status */}
      <div className="mt-3">
        {!affiliateTag ? (
          <p className="text-yellow-400 text-xs">
            &#9888; No affiliate tag saved for {AMAZON_REGIONS[selectedRegion].name}.{" "}
            <a href="/settings" className="underline hover:text-yellow-300">
              Add in Settings
            </a>
          </p>
        ) : (
          <p className="text-slate-400/50 text-xs">
            Using tag: <code className="text-slate-400 bg-white/5/50 px-1 rounded">{affiliateTag}</code>
          </p>
        )}
      </div>
    </div>
  );
}
