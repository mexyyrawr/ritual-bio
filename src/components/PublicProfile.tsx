"use client";

import { useState } from "react";
import { useReadContract } from "wagmi";
import { RITUAL_BIO_ADDRESS, RITUAL_BIO_ABI } from "@/lib/contract";
import { getLinkIconComponent, getLinkLabel, RitualLogo } from "@/components/LinkIcons";
import Link from "next/link";

interface PublicProfileProps {
  address: `0x${string}`;
}

export function PublicProfile({ address }: PublicProfileProps) {
  const { data: profile, isLoading } = useReadContract({
    address: RITUAL_BIO_ADDRESS,
    abi: RITUAL_BIO_ABI,
    functionName: "getProfile",
    args: [address],
  });

  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(`https://ritual-bio.vercel.app/${address}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-6xl">😕</div>
        <h1 className="text-2xl font-bold text-white">Profile Not Found</h1>
        <p className="text-gray-400">
          {address.slice(0, 6)}...{address.slice(-4)} belum punya profile.
        </p>
        <Link
          href="/"
          className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm transition-colors"
        >
          Buat Profile
        </Link>
      </div>
    );
  }

  const [name, bio, avatarUrl, links, updatedAt] = profile as [string, string, string, string[], bigint];
  const date = new Date(Number(updatedAt) * 1000);
  const showAvatar = avatarUrl && !imgError;

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6">
      {/* Back button */}
      <Link
        href="/"
        className="text-sm text-gray-500 hover:text-gray-300 mb-6 inline-block"
      >
        ← Back
      </Link>

      {/* Profile Card */}
      <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-6 text-center">
        {/* Avatar */}
        {showAvatar ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-20 h-20 rounded-full object-cover border-2 border-green-500/30 mx-auto mb-4"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-green-600/20 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-green-300">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Name */}
        <h1 className="text-2xl font-bold text-white mb-2">{name}</h1>

        {/* Address */}
        <p className="text-xs text-gray-500 mb-4 font-mono">
          {address.slice(0, 6)}...{address.slice(-4)}
        </p>

        {/* Bio */}
        {bio && (
          <p className="text-gray-300 text-sm mb-6 leading-relaxed">
            {bio}
          </p>
        )}

        {/* Links with real SVG logos */}
        {links.length > 0 && (
          <div className="space-y-3">
            {links.map((link, i) => {
              const IconComponent = getLinkIconComponent(link);
              const label = getLinkLabel(link);
              return (
                <a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors group"
                >
                  <div className="shrink-0 w-8 h-8 bg-gray-600/50 rounded-md flex items-center justify-center text-gray-300 group-hover:text-white transition-colors">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-sm text-gray-300 group-hover:text-white truncate transition-colors">
                      {link.replace(/^https?:\/\/(www\.)?/, "").slice(0, 40)}
                    </p>
                  </div>
                  <span className="text-gray-500 group-hover:text-gray-300 text-xs shrink-0">
                    ↗
                  </span>
                </a>
              );
            })}
          </div>
        )}

        {/* Updated */}
        <p className="text-xs text-gray-600 mt-6">
          Updated: {date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Copy Link */}
      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 text-sm text-gray-400 font-mono truncate">
          ritual-bio.vercel.app/{address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <button
          onClick={copyLink}
          className="px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm font-medium transition-colors shrink-0"
        >
          {copied ? "✓" : "Copy"}
        </button>
      </div>
      <p className="text-xs text-gray-600 mt-1 text-center">
        Tempel link ini di bio social media lo 🔗
      </p>

      {/* Footer with Ritual logo */}
      <div className="text-center mt-8 flex items-center justify-center gap-2">
        <RitualLogo className="w-5 h-5" />
        <p className="text-xs text-gray-700">
          Powered by{" "}
          <span className="text-green-400">Ritual Bio</span>
          {" "}on Ritual Chain
        </p>
      </div>
    </div>
  );
}
