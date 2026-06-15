const PROXY_HOST_SUFFIXES = [
  "agnes-ai.com",
  "agnes-ai.space",
  "aliyuncs.com",
  "amazonaws.com",
  "cloudfront.net",
];

export function isExternalMediaUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

function isAllowedProxyHost(hostname: string): boolean {
  return PROXY_HOST_SUFFIXES.some(
    (suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`),
  );
}

export function toDisplayMediaUrl(url: string): string {
  if (!isExternalMediaUrl(url)) {
    return url;
  }

  try {
    const parsed = new URL(url);
    if (!isAllowedProxyHost(parsed.hostname)) {
      return url;
    }
  } catch {
    return url;
  }

  return `/api/proxy-media?url=${encodeURIComponent(url)}`;
}

export function getDemoHeroFallback(): string {
  return "/demo-hero.png";
}

export function getDemoVideoFallback(): string {
  return "/demo-hook.mp4";
}
