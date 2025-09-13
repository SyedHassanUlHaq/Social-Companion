import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "";

  const apiUrl = `https://librivox.org/api/feed/audiobooks/?format=json&extended=1&title=${encodeURIComponent(
    title
  )}`;

  const res = await fetch(apiUrl);
  const data = await res.json();

  return NextResponse.json(data);
}
