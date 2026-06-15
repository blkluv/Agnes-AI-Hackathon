"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BRIEF_STEPS,
  DEMO_PRODUCT,
  SELLING_STYLE_LABELS,
  TARGET_BUYER_LABELS,
  type BriefStatus,
  type BriefStepEvent,
  type Category,
  type ChannelCopy,
  type ProductInput,
  type SellingPlan,
  type TrendSignal,
  type TrendSource,
  type ImageSource,
  type VideoSource,
} from "@/lib/types";
import { getDemoHeroFallback, getDemoVideoFallback } from "@/lib/media";

type StepState = "pending" | "active" | "complete";

interface BriefState {
  trendSignal?: TrendSignal;
  trendSource?: TrendSource;
  sellingPlan?: SellingPlan;
  hookLine?: string;
  script?: string;
  channelCopy?: ChannelCopy;
  heroImageUrl?: string;
  imageSource?: ImageSource;
  hookVideoUrl?: string;
  videoSource?: VideoSource;
  briefStatus?: BriefStatus;
  usedDemoBrief?: boolean;
}

const INITIAL_FORM: ProductInput = { ...DEMO_PRODUCT };

function getStepStates(activeIndex: number, isGenerating: boolean): StepState[] {
  return BRIEF_STEPS.map((_, index) => {
    if (!isGenerating && activeIndex < 0) return "pending";
    if (index < activeIndex) return "complete";
    if (index === activeIndex) return "active";
    return "pending";
  });
}

function SourceBadge({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-2.5 py-1 text-xs font-medium text-muted">
      {label}: <span className="text-foreground">{value}</span>
    </span>
  );
}

function HeroImagePanel({ src }: { src: string }) {
  const [displaySrc, setDisplaySrc] = useState(src);

  useEffect(() => {
    setDisplaySrc(src);
  }, [src]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={displaySrc}
      alt="Hero product"
      className="max-h-80 rounded-xl border border-border object-cover"
      onError={() => {
        if (displaySrc !== getDemoHeroFallback()) {
          setDisplaySrc(getDemoHeroFallback());
        }
      }}
    />
  );
}

function HookVideoPanel({ src }: { src: string }) {
  const [displaySrc, setDisplaySrc] = useState(src);

  useEffect(() => {
    setDisplaySrc(src);
  }, [src]);

  return (
    <video
      key={displaySrc}
      src={displaySrc}
      controls
      playsInline
      className="w-full rounded-xl border border-border"
      onError={() => {
        if (displaySrc !== getDemoVideoFallback()) {
          setDisplaySrc(getDemoVideoFallback());
        }
      }}
    />
  );
}

export function TasteSellApp() {
  const [form, setForm] = useState<ProductInput>(INITIAL_FORM);
  const [brief, setBrief] = useState<BriefState>({});
  const [agnesLive, setAgnesLive] = useState<boolean | null>(null);
  const [activeStep, setActiveStep] = useState(-1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "hook" | "script" | "tiktok" | "shopee" | "whatsapp" | "image" | "video"
  >("hook");

  const stepStates = useMemo(
    () => getStepStates(activeStep, isGenerating),
    [activeStep, isGenerating],
  );

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data: { agnesConfigured?: boolean }) =>
        setAgnesLive(Boolean(data.agnesConfigured)),
      )
      .catch(() => setAgnesLive(false));
  }, []);

  async function handleGenerate() {
    setIsGenerating(true);
    setError(null);
    setBrief({});
    setActiveStep(0);

    try {
      const response = await fetch("/api/shop-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to generate Shop Brief");
      }

      if (!response.body) {
        throw new Error("No response stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";

        for (const chunk of chunks) {
          const line = chunk.trim();
          if (!line.startsWith("data:")) continue;

          const event = JSON.parse(line.slice(5).trim()) as BriefStepEvent;
          applyEvent(event);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  }

  function applyEvent(event: BriefStepEvent) {
    if (event.step === "done") {
      setActiveStep(BRIEF_STEPS.length);
      setBrief((prev) => ({
        ...prev,
        briefStatus: (event.data?.briefStatus as BriefStatus) ?? "complete",
        usedDemoBrief: Boolean(event.data?.usedDemoBrief),
      }));
      return;
    }

    if (typeof event.step === "number") {
      setActiveStep(event.step);
      const data = event.data ?? {};

      setBrief((prev) => ({
        ...prev,
        ...(data.trendSignal ? { trendSignal: data.trendSignal as TrendSignal } : {}),
        ...(data.trendSource ? { trendSource: data.trendSource as TrendSource } : {}),
        ...(data.sellingPlan ? { sellingPlan: data.sellingPlan as SellingPlan } : {}),
        ...(data.hookLine ? { hookLine: data.hookLine as string } : {}),
        ...(data.script ? { script: data.script as string } : {}),
        ...(data.channelCopy ? { channelCopy: data.channelCopy as ChannelCopy } : {}),
        ...(data.heroImageUrl ? { heroImageUrl: data.heroImageUrl as string } : {}),
        ...(data.imageSource ? { imageSource: data.imageSource as ImageSource } : {}),
        ...(data.hookVideoUrl ? { hookVideoUrl: data.hookVideoUrl as string } : {}),
        ...(data.videoSource ? { videoSource: data.videoSource as VideoSource } : {}),
      }));

      if (event.step === 4 && data.heroImageUrl) {
        setActiveTab("image");
      }

      if (event.step === 5 && data.hookVideoUrl) {
        setActiveTab("video");
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-medium text-accent">TasteSell by Agnes</p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Your daily Shop Brief
            </h1>
            {agnesLive === true ? (
              <p className="mt-1 text-xs text-green-700">Agnes API connected</p>
            ) : agnesLive === false ? (
              <p className="mt-1 text-xs text-amber-700">
                Fallback mode — add API key to .env.local
              </p>
            ) : null}
          </div>
          <p className="max-w-sm text-right text-sm text-muted">
            Trend → Selling Plan → Content Bundle for TikTok, Shopee, and WhatsApp
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-2">
        <section className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Product</h2>
            <div className="space-y-4">
              <label className="block space-y-1 text-sm">
                <span className="font-medium">Name</span>
                <input
                  className="w-full rounded-xl border border-border px-3 py-2"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="font-medium">Price</span>
                <input
                  className="w-full rounded-xl border border-border px-3 py-2"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="font-medium">Category</span>
                <select
                  className="w-full rounded-xl border border-border px-3 py-2"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value as Category })
                  }
                >
                  <option value="skincare">Skincare</option>
                  <option value="fashion">Fashion</option>
                  <option value="food">Food</option>
                </select>
              </label>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGenerating ? "Generating Shop Brief..." : "Generate Shop Brief"}
              </button>
              {error ? (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Brief Steps</h2>
            <ol className="space-y-3">
              {BRIEF_STEPS.map((label, index) => {
                const state = stepStates[index];
                return (
                  <li
                    key={label}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${
                      state === "active"
                        ? "bg-accent-soft text-foreground"
                        : state === "complete"
                          ? "text-foreground"
                          : "text-muted"
                    }`}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-xs font-semibold">
                      {state === "complete" ? "✓" : index + 1}
                    </span>
                    <span>{label}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold">Shop Brief</h2>
              {brief.briefStatus ? (
                <SourceBadge label="Brief Status" value={brief.briefStatus} />
              ) : null}
              {brief.trendSource ? (
                <SourceBadge label="Trend Source" value={brief.trendSource} />
              ) : null}
              {brief.imageSource ? (
                <SourceBadge label="Image Source" value={brief.imageSource} />
              ) : null}
              {brief.videoSource ? (
                <SourceBadge label="Video Source" value={brief.videoSource} />
              ) : null}
              {brief.usedDemoBrief ? (
                <SourceBadge label="Mode" value="demo brief" />
              ) : null}
            </div>

            {!brief.trendSignal && !isGenerating ? (
              <p className="text-sm text-muted">
                Rina, Jakarta, zero reviews — generate a Shop Brief to see trend,
                selling plan, and content appear here.
              </p>
            ) : null}

            {brief.trendSignal ? (
              <div className="mb-6 rounded-xl border border-border bg-background p-4">
                <h3 className="mb-2 font-semibold">Trend Signal</h3>
                <p className="mb-3 text-sm text-muted">{brief.trendSignal.summary}</p>
                <ul className="space-y-2 text-sm">
                  {brief.trendSignal.trends.map((trend) => (
                    <li
                      key={trend.hashtag}
                      className="rounded-lg border border-border bg-white p-3"
                    >
                      <p className="font-medium">{trend.format}</p>
                      <p className="text-accent">{trend.hashtag}</p>
                      <p className="text-muted">{trend.whyWinning}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {brief.sellingPlan ? (
              <div className="mb-6 rounded-xl border border-border bg-background p-4">
                <h3 className="mb-2 font-semibold">Selling Plan</h3>
                <div className="mb-2 flex flex-wrap gap-2 text-sm">
                  <SourceBadge
                    label="Style"
                    value={SELLING_STYLE_LABELS[brief.sellingPlan.sellingStyle]}
                  />
                  <SourceBadge
                    label="Buyer"
                    value={TARGET_BUYER_LABELS[brief.sellingPlan.targetBuyer]}
                  />
                </div>
                <p className="text-sm leading-6 text-muted">
                  <span className="font-medium text-foreground">Why this works: </span>
                  {brief.sellingPlan.whyThisWorks}
                </p>
              </div>
            ) : null}

            {brief.hookLine || brief.channelCopy ? (
              <div className="rounded-xl border border-border bg-background p-4">
                <h3 className="mb-3 font-semibold">Content Bundle</h3>
                <div className="mb-4 flex flex-wrap gap-2">
                  {(
                    [
                      ["hook", "Hook Line"],
                      ["script", "Script"],
                      ["tiktok", "TikTok"],
                      ["shopee", "Shopee"],
                      ["whatsapp", "WhatsApp"],
                      ["image", "Image"],
                      ["video", "Hook Video"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveTab(id)}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        activeTab === id
                          ? "bg-accent text-white"
                          : "border border-border bg-white text-muted"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="min-h-40 text-sm leading-6 text-foreground">
                  {activeTab === "hook" && (
                    <p className="text-lg font-semibold">{brief.hookLine}</p>
                  )}
                  {activeTab === "script" && (
                    <pre className="whitespace-pre-wrap font-sans">{brief.script}</pre>
                  )}
                  {activeTab === "tiktok" && (
                    <pre className="whitespace-pre-wrap font-sans">
                      {brief.channelCopy?.tiktok}
                    </pre>
                  )}
                  {activeTab === "shopee" && (
                    <div className="space-y-3">
                      <p className="font-semibold">{brief.channelCopy?.shopee.title}</p>
                      <pre className="whitespace-pre-wrap font-sans">
                        {brief.channelCopy?.shopee.description}
                      </pre>
                    </div>
                  )}
                  {activeTab === "whatsapp" && (
                    <pre className="whitespace-pre-wrap font-sans">
                      {brief.channelCopy?.whatsapp}
                    </pre>
                  )}
                  {activeTab === "image" && brief.heroImageUrl ? (
                    <HeroImagePanel src={brief.heroImageUrl} />
                  ) : activeTab === "image" ? (
                    <p className="text-muted">Generating hero image...</p>
                  ) : null}
                  {activeTab === "video" && brief.hookVideoUrl ? (
                    <HookVideoPanel src={brief.hookVideoUrl} />
                  ) : activeTab === "video" ? (
                    <p className="text-muted">Generating hook video...</p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}
