"use client";

/**
 * Profile photo upload helper.
 * Primary: web3.storage (IPFS) if NEXT_PUBLIC_WEB3_TOKEN is set.
 * Fallback: catbox.moe (free, no token) for testnet convenience.
 * Returns a public URL string to store in the contract's avatarUrl field.
 */

export async function uploadImage(file: File): Promise<string> {
  const token = (process as any).env?.NEXT_PUBLIC_WEB3_TOKEN as string | undefined;

  if (token) {
    try {
      return await uploadToWeb3(file, token);
    } catch (e) {
      console.warn("web3.storage upload failed, falling back to catbox", e);
    }
  }

  return await uploadToCatbox(file);
}

async function uploadToWeb3(file: File, token: string): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("https://api.web3.storage/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) throw new Error(`web3.storage: ${res.status}`);
  const data = await res.json();
  // web3.storage returns { cid: "..." }
  const cid = data.cid ?? data.value?.cid;
  if (!cid) throw new Error("web3.storage: no cid returned");
  return `https://${cid}.ipfs.w3s.link`;
}

async function uploadToCatbox(file: File): Promise<string> {
  const form = new FormData();
  form.append("reqtype", "fileupload");
  form.append("userhash", ""); // anonymous
  form.append("fileToUpload", file);

  const res = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: form,
  });

  if (!res.ok) throw new Error(`catbox: ${res.status}`);
  const text = await res.text();
  if (!text.startsWith("https://")) throw new Error(`catbox: ${text}`);
  return text.trim();
}
