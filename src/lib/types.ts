export type Category = "skincare" | "fashion" | "food";

export type SellingStyle = "top-pick" | "key-ingredient" | "life-change";

export type TargetBuyer =
  | "quality-focused"
  | "status-seeker"
  | "budget-prestige"
  | "luxury-buyer";

export type TrendSource = "live" | "cached";
export type VideoSource = "live" | "cached";
export type ImageSource = "live" | "cached";
export type BriefStatus = "complete" | "incomplete";

export interface ProductInput {
  name: string;
  price: string;
  category: Category;
  photo?: string;
}

export interface TrendItem {
  format: string;
  hashtag: string;
  whyWinning: string;
}

export interface TrendSignal {
  trends: TrendItem[];
  summary: string;
}

export interface SellingPlan {
  sellingStyle: SellingStyle;
  targetBuyer: TargetBuyer;
  whyThisWorks: string;
}

export interface ChannelCopy {
  tiktok: string;
  shopee: { title: string; description: string };
  whatsapp: string;
}

export interface ShopBriefData {
  trendSignal: TrendSignal;
  trendSource: TrendSource;
  sellingPlan: SellingPlan;
  hookLine: string;
  script: string;
  channelCopy: ChannelCopy;
  heroImageUrl: string;
  imageSource?: ImageSource;
  hookVideoUrl: string;
  videoSource: VideoSource;
  briefStatus: BriefStatus;
}

export interface BriefStepEvent {
  step: number | "done";
  label: string;
  data?: Record<string, unknown>;
}

export const BRIEF_STEPS = [
  "Scanning trends",
  "Picking selling style",
  "Writing copy",
  "Creating image",
  "Making hook video",
] as const;

export const DEMO_PRODUCT: ProductInput = {
  name: "Vitamin C Brightening Serum",
  price: "Rp 185.000",
  category: "skincare",
};

export const SELLING_STYLE_LABELS: Record<SellingStyle, string> = {
  "top-pick": "Top Pick",
  "key-ingredient": "Key Ingredient",
  "life-change": "Life Change",
};

export const TARGET_BUYER_LABELS: Record<TargetBuyer, string> = {
  "quality-focused": "Quality-focused",
  "status-seeker": "Status-seeker",
  "budget-prestige": "Budget-prestige",
  "luxury-buyer": "Luxury-buyer",
};
