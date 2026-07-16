import { NextRequest, NextResponse } from "next/server";

export const revalidate = 60;
export const dynamic = "force-dynamic";

const OPENSEA_API_BASE = "https://api.opensea.io/api/v2";

function getApiKey(): string {
  const key = process.env.OPENSEA_API_KEY || process.env.NEXT_PUBLIC_OPENSEA_API_KEY;
  if (!key) throw new Error("OpenSea API key not configured");
  return key.replace(/^["']|["']$/g, "").trim();
}

async function proxyOpenSea(method: string, path: string, body?: string): Promise<NextResponse> {
  const apiKey = getApiKey();
  const url = `${OPENSEA_API_BASE}/${path.replace(/^\//, "")}`;

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "X-API-KEY": apiKey,
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body } : {}),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `OpenSea API error: ${res.status} ${res.statusText}`, details: text.slice(0, 500) },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch from OpenSea", details: err.message },
      { status: 502 },
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json({ error: "Missing path query parameter" }, { status: 400 });
  }

  return proxyOpenSea("GET", path);
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json({ error: "Missing path query parameter" }, { status: 400 });
  }

  const body = await request.text().catch(() => undefined);
  return proxyOpenSea("POST", path, body);
}
