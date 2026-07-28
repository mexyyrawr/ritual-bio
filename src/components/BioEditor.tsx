"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { RITUAL_BIO_ADDRESS, RITUAL_BIO_ABI } from "@/lib/contract";
import { getLinkIconComponent, getLinkLabel, RitualLogo } from "@/components/LinkIcons";
import { uploadImage } from "@/lib/upload";
import Link from "next/link";

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

export function BioEditor() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [links, setLinks] = useState<string[]>([""]);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  // Username availability check state
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Read existing profile
  const { data: profile, refetch } = useReadContract({
    address: RITUAL_BIO_ADDRESS,
    abi: RITUAL_BIO_ABI,
    functionName: "getProfile",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Load existing profile into form
  useEffect(() => {
    if (profile) {
      const [pUsername, pName, pBio, pAvatarUrl, pLinks] = profile as unknown as [string, string, string, string, string[]];
      if (pName || pUsername) {
        setUsername(pUsername || "");
        setName(pName);
        setBio(pBio);
        setAvatarUrl(pAvatarUrl || "");
        setLinks(pLinks.length > 0 ? [...pLinks] : [""]);
      }
    }
  }, [profile]);

  // Read contract: isUsernameAvailable
  const { data: availableData } = useReadContract({
    address: RITUAL_BIO_ADDRESS,
    abi: RITUAL_BIO_ABI,
    functionName: "isUsernameAvailable",
    args: username && USERNAME_REGEX.test(username) ? [username] : undefined,
    query: { enabled: !!username && USERNAME_REGEX.test(username) },
  });

  // Debounced username availability check
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!username) {
      setUsernameStatus("idle");
      return;
    }

    const normalized = username.toLowerCase();

    if (!USERNAME_REGEX.test(normalized)) {
      setUsernameStatus("invalid");
      return;
    }

    setUsernameStatus("checking");

    debounceRef.current = setTimeout(() => {
      // availableData is updated by useReadContract when args change
      if (availableData !== undefined && availableData !== null) {
        setUsernameStatus(availableData ? "available" : "taken");
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [username, availableData]);

  // Write contract
  const { writeContract, data: txHash } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isSuccess) {
      setStatus("success");
      refetch();
      setTimeout(() => setStatus("idle"), 3000);
    }
  }, [isSuccess, refetch]);

  const handleSave = () => {
    if (!name.trim()) {
      setErrorMsg("Name required");
      return;
    }

    // Validate username if provided
    if (username && !USERNAME_REGEX.test(username.toLowerCase())) {
      setErrorMsg("Username: 3-20 chars, lowercase a-z, 0-9, underscore");
      return;
    }

    if (username && usernameStatus === "taken") {
      setErrorMsg("Username is already taken");
      return;
    }

    setStatus("saving");
    setErrorMsg("");

    const cleanLinks = links.filter((l) => l.trim().length > 0);

    writeContract(
      {
        address: RITUAL_BIO_ADDRESS,
        abi: RITUAL_BIO_ABI,
        functionName: "setProfile",
        args: [username.trim().toLowerCase(), name.trim(), bio.trim(), avatarUrl.trim(), cleanLinks],
      },
      {
        onError: (err) => {
          setStatus("error");
          setErrorMsg(err.message.slice(0, 200));
        },
      }
    );
  };

  const addLink = () => {
    if (links.length < 20) setLinks([...links, ""]);
  };

  const removeLink = (index: number) => {
    if (links.length > 1) {
      setLinks(links.filter((_, i) => i !== index));
    }
  };

  const updateLink = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  // Determine profile slug: username if set, otherwise address
  const profileSlug = username.trim() ? username.trim().toLowerCase() : address;
  const profileUrl = `https://ritual-bio.vercel.app/${profileSlug}`;

  const copyProfileLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");
    try {
      const url = await uploadImage(file);
      setAvatarUrl(url);
    } catch (err: any) {
      setUploadError(err?.message?.slice(0, 120) || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Not connected
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
        <div className="mb-6"><RitualLogo className="w-16 h-16 mx-auto" /></div>
        <h1 className="text-3xl font-bold text-white">Ritual Bio</h1>
        <p className="text-gray-400 text-center max-w-md">
          On-chain profile / Linktree for Ritual Chain. One link for all your socials.
        </p>
        <button
          onClick={() => connect({ connector: connectors[0] })}
          className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <RitualLogo className="w-7 h-7" />
          Ritual Bio
        </h1>
        <div className="flex items-center gap-3">
          <Link
            href={`/${profileSlug}`}
            className="text-xs text-green-400 hover:text-green-300"
          >
            View Public Profile →
          </Link>
          <button
            onClick={() => disconnect()}
            className="text-xs text-gray-500 hover:text-gray-300 bg-gray-800 px-3 py-1 rounded"
          >
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </button>
        </div>
      </div>

      {/* Share Link */}
      <div className="mb-6 p-3 bg-green-900/20 border border-green-700/30 rounded-lg flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-green-300 mb-0.5">Your profile link</p>
          <p className="text-sm text-gray-300 truncate font-mono">
            ritual-bio.vercel.app/{profileSlug ? `${profileSlug.slice(0, 12)}${profileSlug.length > 12 ? "..." : ""}` : "..."}
          </p>
        </div>
        <button
          onClick={copyProfileLink}
          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-xs text-white font-medium transition-colors shrink-0"
        >
          {copied ? "✓ Copied!" : "Copy"}
        </button>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Avatar */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Profile Photo</label>
          <div className="flex gap-3 items-start">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar preview"
                className="w-16 h-16 rounded-full object-cover border-2 border-green-500/30 shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center shrink-0">
                <span className="text-2xl text-gray-600">👤</span>
              </div>
            )}
            <div className="flex-1">
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? "⏳ Uploading..." : "📁 Upload Photo"}
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl("")}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 text-sm transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="Or paste image URL"
                maxLength={500}
                className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition-colors text-sm"
              />
              <p className="text-xs text-gray-600 mt-1">
                {uploading ? "Uploading to IPFS..." : "Upload from device or paste a URL"}
              </p>
              {uploadError && (
                <p className="text-xs text-red-400 mt-1">❌ {uploadError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Username (for your profile link)</label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="tuan"
              maxLength={20}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition-colors pr-10"
            />
            {/* Availability indicator */}
            {usernameStatus === "available" && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 text-lg">✓</span>
            )}
            {usernameStatus === "taken" && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 text-lg">✕</span>
            )}
            {usernameStatus === "checking" && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">⏳</span>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-1">
            3-20 chars, lowercase a-z, 0-9, underscore
          </p>
          {usernameStatus === "taken" && (
            <p className="text-xs text-red-400 mt-1">❌ Username is already taken</p>
          )}
          {usernameStatus === "invalid" && (
            <p className="text-xs text-red-400 mt-1">❌ Invalid format</p>
          )}
          {usernameStatus === "available" && (
            <p className="text-xs text-green-400 mt-1">✓ Username is available!</p>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={64}
            className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell the world about yourself..."
            maxLength={500}
            rows={3}
            className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition-colors resize-none"
          />
          <p className="text-xs text-gray-600 mt-1">{bio.length}/500</p>
        </div>

        {/* Links */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Links ({links.length}/20)
          </label>
          <div className="space-y-2">
            {links.map((link, i) => {
              const IconComponent = link ? getLinkIconComponent(link) : RitualLogo;
              return (
                <div key={i} className="flex gap-2 items-center">
                  <div className="shrink-0 w-10 h-10 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center text-gray-400">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => updateLink(i, e.target.value)}
                    placeholder="https://twitter.com/you"
                    maxLength={500}
                    className="flex-1 p-3 bg-gray-800 rounded-lg border border-gray-700 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition-colors"
                  />
                  {links.length > 1 && (
                    <button
                      onClick={() => removeLink(i)}
                      className="px-3 bg-red-900/30 hover:bg-red-900/50 rounded-lg text-red-400 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {links.length < 20 && (
            <button
              onClick={addLink}
              className="mt-2 text-sm text-green-400 hover:text-green-300 transition-colors"
            >
              + Add Link
            </button>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={status === "saving" || isConfirming || !name.trim() || (!!username && usernameStatus === "taken") || (!!username && usernameStatus === "invalid")}
          className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {status === "saving" || isConfirming
            ? "⏳ Saving on-chain..."
            : status === "success"
              ? "✅ Saved!"
              : "💾 Save Profile"}
        </button>

        {/* Error */}
        {errorMsg && (
          <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
            <p className="text-red-400 text-sm">❌ {errorMsg}</p>
          </div>
        )}

        {/* Tx Hash */}
        {txHash && (
          <p className="text-xs text-gray-600 text-center">
            Tx:{" "}
            <a
              href={`https://explorer.ritualfoundation.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              {txHash.slice(0, 18)}...
            </a>
          </p>
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-700 mt-8 text-center">
        ⚠️ Data is stored on-chain on Ritual Chain. It cannot be deleted without calling deleteProfile().
      </p>
    </div>
  );
}
