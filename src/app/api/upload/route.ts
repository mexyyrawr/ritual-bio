import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Forward to freeimage.host
    const uploadForm = new FormData();
    uploadForm.append("key", "6d207e02198a847aa98d0a2a901485a5");
    uploadForm.append("action", "upload");
    uploadForm.append("source", file);
    uploadForm.append("format", "json");

    const res = await fetch("https://freeimage.host/api/1/upload", {
      method: "POST",
      body: uploadForm,
    });

    const data = await res.json();

    if (data.status_code !== 200 || !data.image?.url) {
      return NextResponse.json(
        { error: "Upload failed", detail: data },
        { status: 502 }
      );
    }

    // Return clean URL
    const url = data.image.url.replace(/\\\//g, "/");
    return NextResponse.json({ url });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Upload failed" },
      { status: 500 }
    );
  }
}