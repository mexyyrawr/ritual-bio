"use client";

import { useReadContract } from "wagmi";
import { RITUAL_BIO_ADDRESS, RITUAL_BIO_ABI } from "@/lib/contract";
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
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm transition-colors"
        >
          Buat Profile
        </Link>
      </div>
    );
  }

  const [name, bio, links, updatedAt] = profile;
  const date = new Date(Number(updatedAt) * 1000);

  // Link icons based on domain
  const getLinkIcon = (url: string) => {
    if (url.includes("twitter.com") || url.includes("x.com")) return "🐦";
    if (url.includes("github.com")) return "💻";
    if (url.includes("discord")) return "💬";
    if (url.includes("telegram") || url.includes("t.me")) return "📱";
    if (url.includes("medium.com")) return "📝";
    if (url.includes("youtube.com")) return "🎥";
    if (url.includes("linkedin.com")) return "💼";
    if (url.includes("instagram.com")) return "📸";
    return "🔗";
  };

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
        {/* Avatar placeholder */}
        <div className="w-20 h-20 rounded-full bg-purple-600/20 border-2 border-purple-500/30 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>

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

        {/* Links */}
        {links.length > 0 && (
          <div className="space-y-3">
            {links.map((link, i) => (
              <a
                key={i}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors group"
              >
                <span className="text-lg">{getLinkIcon(link)}</span>
                <span className="text-sm text-gray-300 group-hover:text-white truncate flex-1">
                  {link.replace(/^https?:\/\/(www\.)?/, "").slice(0, 40)}
                </span>
                <span className="text-gray-500 group-hover:text-gray-300 text-xs">
                  ↗
                </span>
              </a>
            ))}
          </div>
        )}

        {/* Updated */}
        <p className="text-xs text-gray-600 mt-6">
          Updated: {date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Footer */}
      <div className="text-center mt-6">
        <p className="text-xs text-gray-700">
          Powered by{" "}
          <span className="text-purple-400">Ritual Bio</span>
          {" "}on Ritual Chain
        </p>
      </div>
    </div>
  );
}
