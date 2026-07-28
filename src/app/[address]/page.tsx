"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { RITUAL_BIO_ADDRESS, RITUAL_BIO_ABI } from "@/lib/contract";
import { PublicProfile } from "@/components/PublicProfile";

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export default function ProfilePage() {
  const params = useParams();
  const rawParam = params.address as string;
  const [resolvedAddress, setResolvedAddress] = useState<`0x${string}` | null>(null);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState(false);

  const isAddress = !!rawParam && ADDRESS_REGEX.test(rawParam);

  // If it's an address, use it directly
  useEffect(() => {
    if (isAddress) {
      setResolvedAddress(rawParam as `0x${string}`);
    } else if (rawParam) {
      // Treat as username — resolve to address
      setResolving(true);
      setResolveError(false);
      setResolvedAddress(null);
    }
  }, [rawParam, isAddress]);

  // Read contract to resolve username → address (only when not an address)
  const { data: resolvedAddr, isError } = useReadContract({
    address: RITUAL_BIO_ADDRESS,
    abi: RITUAL_BIO_ABI,
    functionName: "resolveUsername",
    args: rawParam && !isAddress ? [rawParam] : undefined,
    query: { enabled: !!rawParam && !isAddress },
  });

  useEffect(() => {
    if (!isAddress && rawParam) {
      if (isError) {
        setResolveError(true);
        setResolving(false);
      } else if (resolvedAddr !== undefined && resolvedAddr !== null) {
        const addr = resolvedAddr as `0x${string}`;
        if (addr && addr !== "0x0000000000000000000000000000000000000000") {
          setResolvedAddress(addr);
        } else {
          setResolveError(true);
        }
        setResolving(false);
      }
    }
  }, [resolvedAddr, isError, isAddress, rawParam]);

  // Invalid address format (and not a plausible username)
  if (!rawParam) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-6xl">❌</div>
        <h1 className="text-2xl font-bold text-white">Invalid Address</h1>
        <p className="text-gray-400">Invalid address.</p>
      </div>
    );
  }

  if (!isAddress && resolving) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Resolving username...</div>
      </div>
    );
  }

  if (!isAddress && resolveError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-6xl">❌</div>
        <h1 className="text-2xl font-bold text-white">Profile Not Found</h1>
        <p className="text-gray-400">
          Username &quot;{rawParam}&quot; not found.
        </p>
      </div>
    );
  }

  if (!resolvedAddress) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading profile...</div>
      </div>
    );
  }

  return <PublicProfile address={resolvedAddress} />;
}
