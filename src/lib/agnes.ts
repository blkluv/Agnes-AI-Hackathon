import OpenAI from "openai";
import type { Category, ProductInput, TrendSignal } from "./types";

const TEXT_TIMEOUT_MS = 25_000;
const IMAGE_TIMEOUT_MS = 45_000;
const VIDEO_POLL_TIMEOUT_MS = 60_000;
const VIDEO_POLL_INTERVAL_MS = 3_000;

export function getAgnesClient() {
  const apiKey = process.env.AGNES_API_KEY;
  const baseURL = process.env.AGNES_BASE_URL ?? "https://apihub.agnes-ai.com/v1";

  if (!apiKey) {
    return null;
  }

  return new OpenAI({ apiKey, baseURL, timeout: TEXT_TIMEOUT_MS });
}

export function isAgnesConfigured() {
  return Boolean(process.env.AGNES_API_KEY);
}

function getApiConfig() {
  const apiKey = process.env.AGNES_API_KEY;
  const baseURL = process.env.AGNES_BASE_URL ?? "https://apihub.agnes-ai.com/v1";

  if (!apiKey) {
    throw new Error("Agnes API not configured");
  }

  return { apiKey, baseURL };
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  label: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${timeoutMs}ms`)),
      timeoutMs,
    );
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function chatJson<T>(
  client: OpenAI,
  system: string,
  user: string,
  model = "agnes-2.0-flash",
): Promise<T> {
  const response = await withTimeout(
    client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
    TEXT_TIMEOUT_MS,
    `Agnes chat (${model})`,
  );

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from Agnes");
  }

  return JSON.parse(content) as T;
}

export async function fetchLiveTrendSignal(
  category: Category,
): Promise<TrendSignal> {
  const client = getAgnesClient();
  if (!client) {
    throw new Error("Agnes API not configured");
  }

  return chatJson<TrendSignal>(
    client,
    "You are a TikTok commerce trend analyst for Southeast Asia. Return valid JSON only.",
    `What are the top 3 trending content formats and hashtags for ${category} sellers in Indonesia this week?
Return JSON: { "summary": string, "trends": [{ "format": string, "hashtag": string, "whyWinning": string }] }`,
  );
}

export async function generateSellingPlan(
  product: ProductInput,
  trendSignal: TrendSignal,
) {
  const client = getAgnesClient();
  if (!client) {
    throw new Error("Agnes API not configured");
  }

  return chatJson<{
    sellingStyle: "top-pick" | "key-ingredient" | "life-change";
    targetBuyer:
      | "quality-focused"
      | "status-seeker"
      | "budget-prestige"
      | "luxury-buyer";
    whyThisWorks: string;
  }>(
    client,
    "You are a taste economy strategist for SEA e-commerce sellers. Return valid JSON only.",
    `Product: ${product.name}
Price: ${product.price}
Category: ${product.category}
Trending formats this week: ${JSON.stringify(trendSignal.trends)}

Pick the best Selling Style (top-pick, key-ingredient, or life-change) and Target Buyer (quality-focused, status-seeker, budget-prestige, luxury-buyer).
Return JSON: { "sellingStyle": string, "targetBuyer": string, "whyThisWorks": string }`,
  );
}

export async function generateChannelCopy(
  product: ProductInput,
  sellingPlan: {
    sellingStyle: string;
    targetBuyer: string;
    whyThisWorks: string;
  },
) {
  const client = getAgnesClient();
  if (!client) {
    throw new Error("Agnes API not configured");
  }

  return chatJson<{
    hookLine: string;
    script: string;
    channelCopy: {
      tiktok: string;
      shopee: { title: string; description: string };
      whatsapp: string;
    };
  }>(
    client,
    "You are a bilingual Bahasa Indonesia content creator for TikTok Shop sellers. Return valid JSON only. Write punchy, taste-native copy.",
    `Product: ${product.name}
Price: ${product.price}
Selling Style: ${sellingPlan.sellingStyle}
Target Buyer: ${sellingPlan.targetBuyer}
Why this works: ${sellingPlan.whyThisWorks}

Generate JSON:
{
  "hookLine": "3-second opener in Bahasa",
  "script": "15-second filming guide with [shot directions]",
  "channelCopy": {
    "tiktok": "caption with hashtags",
    "shopee": { "title": "listing title", "description": "listing description" },
    "whatsapp": "short sharing caption"
  }
}`,
  );
}

export async function generateHeroImage(
  product: ProductInput,
  sellingStyle: string,
): Promise<string> {
  const client = getAgnesClient();
  if (!client) {
    throw new Error("Agnes API not configured");
  }

  const prompt = `Cinematic product hero image for ${product.name}, ${sellingStyle} selling style, clean beauty product photography, soft natural light, premium e-commerce aesthetic`;

  const response = await withTimeout(
    client.images.generate({
      model: "agnes-image-2.1-flash",
      prompt,
      n: 1,
      size: "1024x1024",
    }),
    IMAGE_TIMEOUT_MS,
    "Agnes image generation",
  );

  const item = response.data?.[0];
  const url = item?.url;
  if (url) return url;

  const b64 = item?.b64_json;
  if (b64) return `data:image/png;base64,${b64}`;

  throw new Error("No image returned from Agnes-Image");
}

interface VideoCreateResponse {
  taskId?: string;
  videoId?: string;
  id?: string;
  data?: { taskId?: string; videoId?: string; id?: string };
}

interface VideoPollResponse {
  status?: string;
  state?: string;
  video_url?: string;
  videoUrl?: string;
  url?: string;
  output?: { url?: string; video_url?: string };
  data?: {
    status?: string;
    state?: string;
    video_url?: string;
    videoUrl?: string;
    url?: string;
  };
}

function extractVideoId(payload: VideoCreateResponse): string | null {
  return (
    payload.videoId ??
    payload.taskId ??
    payload.id ??
    payload.data?.videoId ??
    payload.data?.taskId ??
    payload.data?.id ??
    null
  );
}

function extractVideoUrl(payload: VideoPollResponse): string | null {
  return (
    payload.video_url ??
    payload.videoUrl ??
    payload.url ??
    payload.output?.url ??
    payload.output?.video_url ??
    payload.data?.video_url ??
    payload.data?.videoUrl ??
    payload.data?.url ??
    null
  );
}

function isVideoReady(payload: VideoPollResponse): boolean {
  const status = (
    payload.status ??
    payload.state ??
    payload.data?.status ??
    payload.data?.state ??
    ""
  ).toLowerCase();

  return ["succeeded", "success", "completed", "done", "finished"].includes(
    status,
  );
}

async function pollVideoResult(
  baseURL: string,
  apiKey: string,
  videoId: string,
): Promise<string> {
  const started = Date.now();

  while (Date.now() - started < VIDEO_POLL_TIMEOUT_MS) {
    const pollUrls = [
      `${baseURL}/videos/${videoId}`,
      `${baseURL}/agnesapi?video_id=${videoId}`,
    ];

    for (const pollUrl of pollUrls) {
      const response = await fetch(pollUrl, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (!response.ok) continue;

      const payload = (await response.json()) as VideoPollResponse;
      const url = extractVideoUrl(payload);
      if (url) return url;
      if (isVideoReady(payload)) {
        throw new Error("Video marked ready but no URL returned");
      }
    }

    await new Promise((resolve) => setTimeout(resolve, VIDEO_POLL_INTERVAL_MS));
  }

  throw new Error("Video generation timed out while polling");
}

export async function generateHookVideo(
  product: ProductInput,
  hookLine: string,
): Promise<string> {
  const { apiKey, baseURL } = getApiConfig();

  const prompt = `10-second cinematic product hook video for ${product.name}. Opening hook: ${hookLine}. Close-up product bottle, warm golden lighting, soft camera push-in, premium skincare aesthetic.`;

  const createResponse = await withTimeout(
    fetch(`${baseURL}/videos`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "agnes-video-v2.0",
        prompt,
        height: 720,
        width: 1280,
        num_frames: 61,
        frame_rate: 24,
      }),
    }),
    TEXT_TIMEOUT_MS,
    "Agnes video create",
  );

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    throw new Error(`Video create failed: ${createResponse.status} ${errorText}`);
  }

  const created = (await createResponse.json()) as VideoCreateResponse;
  const videoId = extractVideoId(created);

  if (!videoId) {
    throw new Error("No video task id returned from Agnes-Video");
  }

  return pollVideoResult(baseURL, apiKey, videoId);
}
