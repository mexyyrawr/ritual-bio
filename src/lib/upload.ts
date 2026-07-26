"use client";

/**
 * Upload image via backend API route (same origin, no CORS issues).
 * Server forwards to freeimage.host and returns the public URL.
 */

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Upload failed (${res.status})`);
  }

  const data = await res.json();
  if (!data.url) throw new Error("No URL returned from upload");
  return data.url;
}