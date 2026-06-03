export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll("files");
    const fileList = files.filter((f): f is File => f instanceof File);
    if (fileList.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const utapi = new UTApi();
    const results = await utapi.uploadFiles(fileList);

    const urls: string[] = [];
    const errors: string[] = [];
    for (const r of results as any[]) {
      if (r?.data?.url) urls.push(r.data.url);
      if (r?.error?.message) errors.push(r.error.message);
    }

    if (urls.length === 0) {
      return NextResponse.json({ error: "Upload failed", errors }, { status: 500 });
    }

    return NextResponse.json({ urls, errors });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Upload error" }, { status: 500 });
  }
}
