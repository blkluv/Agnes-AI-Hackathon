import { isExternalMediaUrl } from "@/lib/media";

export const runtime = "nodejs";

const ALLOWED_HOST_SUFFIXES = [
  "agnes-ai.com",
  "agnes-ai.space",
  "aliyuncs.com",
  "amazonaws.com",
  "cloudfront.net",
];

function isAllowedHost(hostname: string): boolean {
  return ALLOWED_HOST_SUFFIXES.some(
    (suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`),
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url");

  if (!url || !isExternalMediaUrl(url)) {
    return Response.json({ error: "Valid media url is required" }, { status: 400 });
  }

  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    return Response.json({ error: "Invalid media url" }, { status: 400 });
  }

  if (!isAllowedHost(parsed.hostname)) {
    return Response.json({ error: "Media host not allowed" }, { status: 403 });
  }

  const upstream = await fetch(url);

  if (!upstream.ok || !upstream.body) {
    return Response.json({ error: "Failed to fetch media" }, { status: 502 });
  }

  const contentType =
    upstream.headers.get("content-type") ?? "application/octet-stream";

  return new Response(upstream.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
