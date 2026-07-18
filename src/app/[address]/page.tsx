"use client";

import { useParams } from "next/navigation";
import { PublicProfile } from "@/components/PublicProfile";

export default function ProfilePage() {
  const params = useParams();
  const address = params.address as string;

  // Validate address
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-6xl">❌</div>
        <h1 className="text-2xl font-bold text-white">Invalid Address</h1>
        <p className="text-gray-400">Address tidak valid.</p>
      </div>
    );
  }

  return <PublicProfile address={address as `0x${string}`} />;
}
