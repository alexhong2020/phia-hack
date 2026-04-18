"use client";

import Image from "next/image";
import { Bodoni_Moda } from "next/font/google";
import { Toaster } from "sonner";
import {
  EllipsisVertical,
  Layers3,
  Maximize,
  Minus,
  MoreHorizontal,
  RotateCcw,
  ThumbsDown,
  ThumbsUp,
  Undo2,
  ZoomIn,
  Camera,
} from "lucide-react";
import {
  RiArrowRightSLine,
  RiBatteryFill,
  RiBookmarkLine,
  RiCake2Line,
  RiCloseCircleLine,
  RiDiamondLine,
  RiEyeOffLine,
  RiEyeLine,
  RiGift2Fill,
  RiHomeLine,
  RiImageLine,
  RiLink,
  RiMacFill,
  RiNotification2Fill,
  RiNotification2Line,
  RiPlayFill,
  RiPriceTag3Line,
  RiQuestionLine,
  RiSearch2Line,
  RiSearchLine,
  RiSettingsLine,
  RiShare2Line,
  RiShirtLine,
  RiShoppingBagFill,
  RiShoppingBagLine,
  RiSignalWifi3Fill,
  RiSmartphoneFill,
  RiUser3Line,
  RiUser4Line,
  RiFireLine,
  RiMagicLine,
  RiSparklingFill,
  RiHistoryLine,
} from "@remixicon/react";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import brandsData from "@/db/brands.json";
import curatedData from "@/db/curated.json";
import exploreFeedData from "@/db/explore_feed.json";
import searchData from "@/db/search.json";
import trendingData from "@/db/trending.json";
import trendsData from "@/db/trends.json";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type ViewState = {
  x: number;
  y: number;
  scale: number;
};

type PreviewStage = "idle" | "splash" | "feed";
type PreviewTab = "Explore" | "For You" | "Trending";

type ExploreCard = {
  id: string;
  entityType: string;
  variant: string;
  name: string;
  primaryBrandName: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  detailRows: Array<{ label: string; value: string }>;
  linkUrl: string;
};

type FeedItem = {
  id?: string | null;
  variant?: string | null;
  entityType?: string | null;
  product?: {
    name?: string | null;
    description?: string | null;
    priceUsd?: string | number | null;
    productUrl?: string | null;
    imgUrl?: string | null;
    additionalImgUrls?: string[] | null;
    primaryBrandName?: string | null;
    sourceDisplayName?: string | null;
    domain?: string | null;
    colorString?: string | null;
    sizeDisplayName?: string | null;
    gender?: string | null;
  } | null;
  outfit?: {
    title?: string | null;
    description?: string | null;
    imgUrl?: string | null;
    imgUrls?: string[] | null;
    isFeatured?: boolean | null;
    isPublished?: boolean | null;
    order?: number | null;
    products?: Array<{
      itemName?: string | null;
      brand?: string | null;
      price?: string | number | null;
      linkToProduct?: string | null;
      imageLink?: string | null;
    }> | null;
  } | null;
  editorial?: {
    title?: string | null;
    headline?: string | null;
    description?: string | null;
    imgUrl?: string | null;
    imageUrl?: string | null;
    url?: string | null;
  } | null;
};

type FeedImport = {
  data?: {
    exploreFeed?: {
      sections?: Array<{
        data?: {
          items?: FeedItem[];
        };
      }>;
    };
  };
};

type CuratedCard = {
  id: string;
  name: string;
  imageUrl: string;
};

type TrendCard = {
  id: string;
  name: string;
  brand: string;
  imageUrl: string;
  linkUrl: string;
};

type TrendingCollectionCard = {
  id: string;
  title: string;
  imageUrl: string;
  products: Array<{
    id: string;
    name: string;
    brand: string;
    imageUrl: string;
    linkUrl: string;
  }>;
};

type CuratedImport = {
  data?: {
    curatedTypes?: Array<{
      typeId?: string | null;
      name?: string | null;
      imgUrl?: string | null;
    }>;
  };
};

type TrendsImport = {
  data?: {
    trendingProducts?: Array<{
      productId?: string | null;
      itemName?: string | null;
      brand?: string | null;
      imageLink?: string | null;
      linkToProduct?: string | null;
    }>;
  };
};

type TrendingImport = {
  data?: {
    outfits?: Array<{
      outfitId?: string | null;
      title?: string | null;
      imgUrl?: string | null;
      products?: Array<{
        productId?: string | null;
        itemName?: string | null;
        brand?: string | null;
        imageLink?: string | null;
        linkToProduct?: string | null;
      }> | null;
    }>;
  };
};

type TrendingBrandListItem = {
  id: string;
  name: string;
  logoUrl: string;
  brandUrl: string;
  visitCount: number;
  trendingRank: number;
};

type SearchLookCard = {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
};

type SearchBrandCard = {
  id: string;
  name: string;
  imageUrl: string;
  brandUrl: string;
};

type SearchImport = {
  data?: {
    popularSearches?: Array<{
      rank?: string | number | null;
      category?: string | null;
      imgUrl?: string | null;
      query?: string | null;
    }>;
  };
};

type BrandsImport = {
  data?: {
    trendingBrands?: Array<{
      id?: string | null;
      name?: string | null;
      imgUrl?: string | null;
      logoUrl?: string | null;
      brandUrl?: string | null;
      visitCount?: number | null;
      trendingRank?: number | null;
    }>;
  };
};

const DEFAULT_VIEW: ViewState = {
  x: 0,
  y: 0,
  scale: 1,
};

const MIN_SCALE = 0.75;
const MAX_SCALE = 1.65;
const DOT_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 22 22'%3E%3Ccircle cx='11' cy='11' r='1' fill='%235F5C6C' /%3E%3C/svg%3E\")";
const PREVIEW_TABS: PreviewTab[] = ["Explore", "For You", "Trending"];
const TREND_SAMPLE_SIZE = 5;
const TRENDING_BRANDS_LIMIT = 27;
const SEARCH_LOOK_LIMIT = 8;
const SEARCH_BRAND_LIMIT = 8;
const TREND_ROTATION_SEED = Date.now();
const TRENDING_VIEWS_SEED = Date.now();
const TRENDING_BRANDS_RANK_SEED = Date.now();
const SEARCH_BRAND_SEED = Date.now();
const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

function seededNumberFromString(seed: string, min: number, max: number) {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index);
    hash |= 0;
  }

  const span = max - min + 1;
  return min + (Math.abs(hash) % span);
}

function formatPrice(value: string | number | null | undefined) {
  if (value == null || value === "") {
    return "";
  }

  const parsed = Number(value);
  if (Number.isFinite(parsed)) {
    return `$${parsed.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }

  return String(value);
}

function formatVisitCount(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "0 visits";
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}K visits`;
  }

  return `${Math.round(value)} visits`;
}

function safeDomain(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

function formatStatusTime(date: Date) {
  const hours = date.getHours() % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function clampScale(scale: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

function isSameView(a: ViewState, b: ViewState) {
  return a.x === b.x && a.y === b.y && a.scale === b.scale;
}

function WorkspaceControlButton({
  active = false,
  className,
  ...props
}: React.ComponentProps<typeof Button> & {
  active?: boolean;
}) {
  return (
    <Button
      variant="outline"
      size="icon-sm"
      className={cn(
        "h-10 w-10 rounded-xl border-white/10 bg-white/5 text-zinc-200 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur hover:bg-white/10 hover:text-white",
        active && "border-white/16 bg-black/40 text-white",
        className,
      )}
      {...props}
    />
  );
}

function ExplorePreviewScreen({
  items,
  curatedTypes,
  trendItems,
  trendingBrands,
  searchLookCards,
  searchBrandCards,
  trendingCollections,
  activeTab,
  onTabChange,
  topRoundedClassName,
  showStatusBar = false,
}: {
  items: ExploreCard[];
  curatedTypes: CuratedCard[];
  trendItems: TrendCard[];
  trendingBrands: TrendingBrandListItem[];
  searchLookCards: SearchLookCard[];
  searchBrandCards: SearchBrandCard[];
  trendingCollections: TrendingCollectionCard[];
  activeTab: PreviewTab;
  onTabChange: (tab: PreviewTab) => void;
  topRoundedClassName?: string;
  showStatusBar?: boolean;
}) {
  type PreviewBottomNav = "home" | "search" | "shop" | "saved" | "profile";
  type SavedMode = "Wishlists" | "Items" | "Brands";
  const tabItems = activeTab === "Explore" ? items : [];
  const trendCarouselRef = useRef<HTMLDivElement | null>(null);
  const [activeTrendSlide, setActiveTrendSlide] = useState(0);
  const [activeBottomNav, setActiveBottomNav] =
    useState<PreviewBottomNav>("home");
  const [activeSavedMode, setActiveSavedMode] =
    useState<SavedMode>("Wishlists");
  const [selectedSignalItem, setSelectedSignalItem] =
    useState<TrendCard | null>(null);

  // Social Fitting Room State
  const [activeFitCheckIdx, setActiveFitCheckIdx] = useState(0);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [fitCheckSessions, setFitCheckSessions] = useState([
    { id: "1", brand: "BROOKS", productName: "Ghost 16", price: "$140.00", userPic: "pic1", isAiEnhanced: false, votes: { cop: 12, drop: 2 }, comments: [{ user: "Kaylie", text: "Matches the Duke vibe perfectly. COP!!" }] },
    { id: "2", brand: "ADIDAS", productName: "Samba OG", price: "$100.00", userPic: "pic2", isAiEnhanced: false, votes: { cop: 45, drop: 3 }, comments: [{ user: "Quante", text: "Classic. Can't go wrong." }] },
    { id: "3", brand: "BRAVES", productName: "Home Jersey", price: "$175.00", userPic: "pic3", isAiEnhanced: false, votes: { cop: 8, drop: 15 }, comments: [] },
    { id: "4", brand: "PATAGONIA", productName: "¼-Zip", price: "$139.00", userPic: "pic4", isAiEnhanced: false, votes: { cop: 22, drop: 1 }, comments: [] },
    { id: "5", brand: "NIKE", productName: "Tech Fleece", price: "$145.00", userPic: "pic5", isAiEnhanced: false, votes: { cop: 30, drop: 12 }, comments: [{ user: "Adam", text: "The fit looks a bit oversized." }] },
  ]);

  const currentFitCheck = fitCheckSessions[activeFitCheckIdx];

  const handleAiEnhance = () => {
    setIsEnhancing(true);
    setTimeout(() => {
      const updated = [...fitCheckSessions];
      updated[activeFitCheckIdx].isAiEnhanced = true;
      setFitCheckSessions(updated);
      setIsEnhancing(false);
    }, 1800);
  };

  const handleVote = (type: "cop" | "drop") => {
    const updated = [...fitCheckSessions];
    updated[activeFitCheckIdx].votes[type] += 1;
    setFitCheckSessions(updated);
  };

  const [statusTime, setStatusTime] = useState(() =>
    formatStatusTime(new Date()),
  );

  useEffect(() => {
    if (!showStatusBar) {
      return;
    }

    const updateTime = () => {
      setStatusTime(formatStatusTime(new Date()));
    };

    updateTime();
    const timer = window.setInterval(updateTime, 30_000);

    return () => {
      window.clearInterval(timer);
    };
  }, [showStatusBar]);

  const handleTabSelection = (tab: PreviewTab) => {
    onTabChange(tab);

    if (tab === "Trending") {
      setActiveTrendSlide(0);
      trendCarouselRef.current?.scrollTo({ left: 0, behavior: "auto" });
    }
  };

  const handleTrendCarouselScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const slideWidth = 260 + 12;
    const nextIndex = Math.round(event.currentTarget.scrollLeft / slideWidth);
    const clampedIndex = Math.max(
      0,
      Math.min(nextIndex, Math.max(0, trendingCollections.length - 1)),
    );
    setActiveTrendSlide(clampedIndex);
  };

  const goToTrendSlide = (index: number) => {
    const slideWidth = 260 + 12;
    trendCarouselRef.current?.scrollTo({
      left: index * slideWidth,
      behavior: "smooth",
    });
    setActiveTrendSlide(index);
  };

  const handleBottomNavSelection = (target: PreviewBottomNav) => {
    setActiveBottomNav(target);

    if (target !== "home") {
      setSelectedSignalItem(null);
    }
  };

  return (
    <div
      className={cn(
        "relative h-full overflow-y-auto bg-[#ECECEC] text-[#101010]",
        topRoundedClassName,
      )}
    >
      <div
        className={cn(
          "sticky top-0 z-20 bg-[#ECECEC]/96 px-4 pt-3 pb-1 backdrop-blur",
          topRoundedClassName,
        )}
      >
        {showStatusBar ? (
          <div className="flex items-center justify-between px-1.5 text-[11px] font-semibold text-black/85">
            <span>{statusTime}</span>

            <div className="mr-0.5 flex items-center gap-1.5">
              <RiBatteryFill className="size-3.5" />
              <RiSignalWifi3Fill className="size-3.5" />
            </div>
          </div>
        ) : null}

        {activeBottomNav === "search" ? (
          <>
            <div
              className={cn("flex items-center gap-3", showStatusBar && "mt-5")}
            >
              <button
                type="button"
                className="flex h-10 flex-1 items-center rounded-full bg-[#E7E7E7] px-3 text-left"
                aria-label="Search"
              >
                <RiSearchLine className="size-4 text-black/55" />
                <span className="ml-2 text-[13px] font-medium tracking-[-0.01em] text-black/60">
                  Paste URL or search
                </span>
              </button>

              <button
                type="button"
                aria-label="Upload image"
                className="flex size-10 items-center justify-center rounded-full bg-[#E7E7E7] text-black/65"
              >
                <RiImageLine className="size-4" />
              </button>
            </div>

            <div className="mt-5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex w-max gap-2.5 pr-2">
                <button
                  type="button"
                  className="flex min-w-[52px] flex-col items-center text-black/65"
                >
                  <RiShirtLine className="size-4" />
                  <span className="mt-0.5 text-[10px]">Outfits</span>
                </button>

                <button
                  type="button"
                  className="flex min-w-[58px] flex-col items-center text-black/65"
                >
                  <RiImageLine className="size-4" />
                  <span className="mt-0.5 text-[10px]">Upload pic</span>
                </button>

                <button
                  type="button"
                  className="flex min-w-[68px] flex-col items-center text-black/65"
                >
                  <RiCake2Line className="size-4" />
                  <span className="mt-0.5 text-[10px]">Celebrations</span>
                </button>

                <button
                  type="button"
                  className="flex min-w-[48px] flex-col items-center text-black/65"
                >
                  <RiPriceTag3Line className="size-4" />
                  <span className="mt-0.5 text-[10px]">Sales</span>
                </button>

                <button
                  type="button"
                  className="flex min-w-[58px] flex-col items-center text-black/65"
                >
                  <RiBookmarkLine className="size-4" />
                  <span className="mt-0.5 text-[10px]">Favorites</span>
                </button>

                <button
                  type="button"
                  className="flex min-w-[50px] flex-col items-center text-black/65"
                >
                  <RiDiamondLine className="size-4" />
                  <span className="mt-0.5 text-[10px]">Luxury</span>
                </button>
              </div>
            </div>
          </>
        ) : activeBottomNav === "saved" ? (
          <div className={cn("pt-1", showStatusBar && "pt-6")}>
            <div className="flex items-center justify-between">
              <h2
                className={cn(
                  bodoniModa.className,
                  "text-[20px] leading-[0.95] tracking-[-0.02em] text-black",
                )}
              >
                Your saved
              </h2>

              <button
                type="button"
                aria-label="Create"
                className="flex size-9 items-center justify-center rounded-full bg-[#E7E7E7] text-black/50"
              >
                <span aria-hidden="true" className="text-[20px] leading-none">
                  +
                </span>
              </button>
            </div>

            <div className="mt-2.5 rounded-full bg-[#E7E7E7] p-0.5">
              {(["Wishlists", "Items", "Brands"] as SavedMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setActiveSavedMode(mode)}
                  className={cn(
                    "h-8 w-1/3 rounded-full text-[12px] font-medium tracking-[-0.01em]",
                    activeSavedMode === mode
                      ? "bg-[#DDDDDD] text-black shadow-[0_4px_10px_rgba(0,0,0,0.08)]"
                      : "text-black/62",
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        ) : activeBottomNav === "profile" ? (
          <div className={cn(showStatusBar ? "mt-2 h-2" : "h-2")} />
        ) : activeBottomNav === "shop" ? (
          <div className="flex flex-col h-full bg-[#FDFDFD]">
            {/* Header: Social Context */}
            <header className="px-6 py-4 bg-white border-b flex justify-between items-center">
              <div className="flex flex-col">
                <h2 className="text-xl font-black italic tracking-tighter">PHIA</h2>
                <div className="flex items-center gap-1.5 text-[10px] text-green-600 font-bold uppercase tracking-widest">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  6 Friends Voting
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" className="p-2 bg-zinc-100 rounded-full active:scale-90 transition-transform">
                  <RiHistoryLine className="size-5 text-zinc-600" />
                </button>
                <button type="button" className="p-2 bg-zinc-100 rounded-full active:scale-90 transition-transform">
                  <RiShare2Line className="size-5 text-zinc-600" />
                </button>
              </div>
            </header>

            {/* Social Feed: The "Fit Check" */}
            <main className="relative flex-1 p-4 flex flex-col justify-center">
              <div className={cn(
                "relative w-full aspect-[3/4] rounded-[40px] overflow-hidden shadow-2xl transition-all duration-700",
                currentFitCheck.isAiEnhanced ? "ring-4 ring-indigo-400 ring-offset-4" : "bg-zinc-200"
              )}>

                {/* Image Placeholder Layer */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-300">
                  {isEnhancing ? (
                    <div className="flex flex-col items-center gap-3">
                      <RiSparklingFill className="size-10 text-indigo-500 animate-bounce" />
                      <p className="text-xs font-black text-indigo-600 uppercase tracking-tighter">Nano Banana AI Rendering...</p>
                    </div>
                  ) : (
                    <span className="text-zinc-500 font-mono text-xl">{currentFitCheck.userPic}</span>
                  )}

                  {/* AI Label */}
                  {currentFitCheck.isAiEnhanced && !isEnhancing && (
                    <div className="absolute top-6 left-6 bg-indigo-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1.5 shadow-xl animate-in fade-in zoom-in">
                      <RiMagicLine className="size-3" /> AI GENERATED PDP
                    </div>
                  )}
                </div>

                {/* AI MAGIC BUTTON */}
                {!currentFitCheck.isAiEnhanced && !isEnhancing && (
                  <button
                    type="button"
                    onClick={handleAiEnhance}
                    className="absolute top-6 right-6 group flex items-center gap-2 bg-black/30 backdrop-blur-xl border border-white/20 p-2.5 rounded-full hover:bg-indigo-600 transition-all overflow-hidden max-w-[44px] hover:max-w-[200px]"
                  >
                    <RiMagicLine className="size-6 text-white" />
                    <span className="text-[11px] font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">AI Studio Glow-up</span>
                  </button>
                )}

                {/* PRODUCT OVERLAY */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/80 backdrop-blur-2xl p-4 rounded-3xl border border-white/40 flex justify-between items-center shadow-xl">
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{currentFitCheck.brand}</p>
                      <p className="text-sm font-bold text-black leading-tight">{currentFitCheck.productName}</p>
                      <p className="text-sm font-semibold text-zinc-600 italic">{currentFitCheck.price}</p>
                    </div>
                    <button type="button" className="bg-black text-white px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-tighter active:scale-95 transition-transform">
                      Cop Now
                    </button>
                  </div>
                </div>

                {/* INSTAGRAM INTERACTION OVERLAY */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-5">
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => handleVote("cop")}
                      className={cn(
                        "size-12 rounded-full flex items-center justify-center text-white transition-all active:scale-75 shadow-lg",
                        currentFitCheck.votes.cop > 0
                          ? "bg-green-500 border-2 border-white"
                          : "bg-black/60 border border-white/40 hover:bg-green-500"
                      )}
                    >
                      <ThumbsUp className="size-6 fill-current" />
                    </button>
                    <span className="text-[10px] font-black text-white mt-1.5 drop-shadow-lg tracking-tighter">{currentFitCheck.votes.cop}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => handleVote("drop")}
                      className={cn(
                        "size-12 rounded-full flex items-center justify-center text-white transition-all active:scale-75 shadow-lg",
                        currentFitCheck.votes.drop > 0
                          ? "bg-red-500 border-2 border-white"
                          : "bg-black/60 border border-white/40 hover:bg-red-500"
                      )}
                    >
                      <ThumbsDown className="size-6 fill-current" />
                    </button>
                    <span className="text-[10px] font-black text-white mt-1.5 drop-shadow-lg tracking-tighter">{currentFitCheck.votes.drop}</span>
                  </div>
                  <button type="button" className="size-12 rounded-full bg-black/60 border border-white/40 flex items-center justify-center text-white shadow-lg">
                    <MoreHorizontal className="size-6" />
                  </button>
                </div>
              </div>

              {/* Progress Slider */}
              <div className="flex justify-center gap-2 mt-8">
                {fitCheckSessions.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveFitCheckIdx(i)}
                    className={cn(
                      "h-1.5 transition-all duration-300 rounded-full",
                      i === activeFitCheckIdx ? "w-10 bg-black" : "w-1.5 bg-zinc-200 hover:bg-zinc-400"
                    )}
                  />
                ))}
              </div>
            </main>

            {/* Comment Section Peek */}
            <footer className="bg-white px-6 pt-2 pb-6 rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.04)] border-t">
              <div className="w-12 h-1 bg-zinc-200 rounded-full mx-auto my-3" />
              <div className="flex items-start gap-3">
                <div className="size-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs border border-indigo-200">K</div>
                <div className="flex-1 space-y-1">
                  <p className="text-[12px] leading-snug">
                    <span className="font-bold text-black mr-2">Kaylie</span>
                    Matches the Duke vibe perfectly. COP!!
                  </p>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">2m ago • Reply</p>
                </div>
              </div>
            </footer>
          </div>
        ) : (
          <>
            <div
              className={cn(
                "flex items-center",
                showStatusBar ? "mt-8 gap-1.5" : "gap-1.5",
              )}
            >
              <Image
                src="/phia-light.svg"
                alt="Phia"
                width={96}
                height={34}
                className="h-auto w-12"
              />

              <div className="ml-auto flex items-center gap-1.5">
                <button
                  type="button"
                  className="flex h-7 items-center gap-1 rounded-full bg-black px-2.5 text-white shadow-[0_6px_18px_rgba(0,0,0,0.2)]"
                >
                  <RiGift2Fill className="size-3" color="rgba(255,255,255,1)" />
                  <span className="text-[9px] font-semibold tracking-tight">
                    Win a Birkin
                  </span>
                </button>

                <div className="flex items-center rounded-full bg-white px-0.75 py-0.5 shadow-[0_8px_20px_rgba(0,0,0,0.06)]">
                  <button
                    type="button"
                    className="flex size-6 items-center justify-center rounded-full text-black/90"
                    aria-label="Notifications"
                  >
                    <RiNotification2Line className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    className="flex size-6 items-center justify-center rounded-full text-black/90"
                    aria-label="Search"
                  >
                    <RiSearch2Line className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4">
              {PREVIEW_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabSelection(tab)}
                  className={cn(
                    "border-b-2 text-sm font-medium",
                    activeTab === tab
                      ? "border-black text-black"
                      : "border-transparent text-black/45",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="px-2.5 pb-20">
        {activeBottomNav === "saved" ? (
          <div className="space-y-3 pt-2">
            {activeSavedMode === "Wishlists" ? (
              <>
                <article className="relative overflow-hidden rounded-[20px] bg-[#EFEFEF] px-3 py-4">
                  {searchBrandCards[0]?.imageUrl ? (
                    <div className="pointer-events-none absolute -left-4 top-7 size-14 overflow-hidden rounded-[16px] opacity-30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={searchBrandCards[0].imageUrl}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}

                  {searchBrandCards[1]?.imageUrl ? (
                    <div className="pointer-events-none absolute -right-3 top-7 size-14 overflow-hidden rounded-[16px] opacity-30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={searchBrandCards[1].imageUrl}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}

                  {searchBrandCards[2]?.imageUrl ? (
                    <div className="pointer-events-none absolute left-8 -bottom-4 size-14 overflow-hidden rounded-[16px] opacity-25">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={searchBrandCards[2].imageUrl}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}

                  <h3
                    className={cn(
                      bodoniModa.className,
                      "relative z-10 mx-auto max-w-[220px] text-center text-[14px] leading-[1.05] tracking-[-0.02em] text-black/76",
                    )}
                  >
                    Create &amp; share wishlists for your best finds
                  </h3>

                  <div className="relative z-10 mt-3 flex justify-center">
                    <button
                      type="button"
                      className="rounded-[14px] bg-black px-5 py-1.5 text-[11px] font-medium text-white"
                    >
                      + Create wishlist
                    </button>
                  </div>
                </article>

                <section>
                  <h3
                    className={cn(
                      bodoniModa.className,
                      "text-[14px] leading-none tracking-[-0.02em] text-black",
                    )}
                  >
                    Editor&apos;s picks
                  </h3>

                  {trendItems[0] ? (
                    <article className="relative mt-2.5 overflow-hidden rounded-[18px] bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={trendItems[0].imageUrl}
                        alt={trendItems[0].name}
                        loading="lazy"
                        className="h-[200px] w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.64),rgba(0,0,0,0.18),transparent)]" />
                      <div className="absolute inset-x-4 bottom-4">
                        <p
                          className={cn(
                            bodoniModa.className,
                            "text-[12px] leading-[1.02] text-white",
                          )}
                        >
                          {trendItems[0].name}
                        </p>
                        <button
                          type="button"
                          className="mt-1 rounded-[12px] border border-white/90 px-3 py-0.5 text-[9px] font-medium text-white"
                        >
                          Shop this list
                        </button>
                      </div>
                    </article>
                  ) : (
                    <div className="mt-3 flex h-40 items-center justify-center rounded-2xl bg-white text-sm text-black/50">
                      No editor picks available.
                    </div>
                  )}
                </section>
              </>
            ) : activeSavedMode === "Items" ? (
              <section>
                <h3
                  className={cn(
                    bodoniModa.className,
                    "text-[14px] leading-none tracking-[-0.02em] text-black",
                  )}
                >
                  Saved items
                </h3>

                {trendItems.length > 0 ? (
                  <div className="mt-3 columns-2 gap-2 [column-fill:_balance]">
                    {trendItems.slice(0, 8).map((item) => (
                      <article
                        key={`${item.id}-saved-item`}
                        className="mb-2 break-inside-avoid rounded-xl bg-white p-0.75"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          loading="lazy"
                          className="h-auto w-full rounded-[12px]"
                        />
                        <div className="px-1.5 pb-1.5 pt-1">
                          <p className="text-[9px] font-semibold leading-tight text-black">
                            {item.name}
                          </p>
                          <p className="mt-0.5 text-[9px] text-black/65">
                            {item.brand || "Phia"}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 flex h-40 items-center justify-center rounded-2xl bg-white text-sm text-black/50">
                    No saved items yet.
                  </div>
                )}
              </section>
            ) : (
              <section>
                <h3
                  className={cn(
                    bodoniModa.className,
                    "text-[14px] leading-none tracking-[-0.02em] text-black",
                  )}
                >
                  Saved brands
                </h3>

                {searchBrandCards.length > 0 ? (
                  <div className="mt-3 grid grid-cols-2 gap-2.5">
                    {searchBrandCards.slice(0, 8).map((brand) => (
                      <article
                        key={`${brand.id}-saved-brand`}
                        className="relative h-[78px] overflow-hidden rounded-[14px] bg-white"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={brand.imageUrl}
                          alt={brand.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/28" />
                        <p className="absolute inset-0 flex items-center justify-center px-2 text-center text-[9px] font-semibold uppercase tracking-[0.08em] text-white">
                          {brand.name}
                        </p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 flex h-40 items-center justify-center rounded-2xl bg-white text-sm text-black/50">
                    No saved brands yet.
                  </div>
                )}
              </section>
            )}
          </div>
        ) : activeBottomNav === "profile" ? (
          <div className="space-y-4 pt-3">
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                aria-label="Help"
                className="flex size-10 items-center justify-center rounded-full bg-[#E7E7E7] text-black/85"
              >
                <RiQuestionLine className="size-5" />
              </button>

              <button
                type="button"
                aria-label="Settings"
                className="flex size-10 items-center justify-center rounded-full bg-[#E7E7E7] text-black/85"
              >
                <RiSettingsLine className="size-5" />
              </button>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative size-26 overflow-hidden rounded-[22px] bg-[#6EA43D]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/profile.jpeg"
                  alt="Shreyansh Saurabh"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>

              <h2
                className={cn(
                  bodoniModa.className,
                  "mt-3 text-[22px] leading-none tracking-[-0.02em] text-black",
                )}
              >
                Shreyansh Saurabh
              </h2>

              <button
                type="button"
                className="mt-3 rounded-2xl bg-[#E1E1E1] px-6 py-2 text-[10px] font-medium text-black/55"
              >
                Edit profile
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <article className="rounded-[16px] bg-[#EFEFEF] p-3 shadow-[0_8px_22px_rgba(0,0,0,0.06)]">
                <p className="text-[9px] font-medium leading-[1.15] text-black/68">
                  Price drop
                  <br />
                  alerts
                </p>

                <div className="mt-2 flex items-end justify-between">
                  <span className="rounded-xl bg-[#E4E4E4] px-2 py-1 text-[8px] text-black/35">
                    No updates
                  </span>
                  <RiNotification2Line className="size-8 text-black/22" />
                </div>
              </article>

              <article className="rounded-[16px] bg-[#EFEFEF] p-3 shadow-[0_8px_22px_rgba(0,0,0,0.06)]">
                <p className="text-[9px] font-medium leading-[1.15] text-black/68">
                  Your link
                  <br />
                  history
                </p>

                <div className="mt-2 flex items-end justify-between">
                  <span className="inline-flex items-center gap-1 rounded-xl bg-[#E4E4E4] px-2 py-1 text-[8px] text-black/35">
                    <span className="size-1.5 rounded-full bg-[#F95E60]" />3 new
                  </span>
                  <RiLink className="size-8 text-black/22" />
                </div>
              </article>

              <article className="rounded-[16px] bg-[#EFEFEF] p-3 shadow-[0_8px_22px_rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-1.5">
                  {searchBrandCards.slice(0, 4).map((brand) => (
                    <div
                      key={`${brand.id}-profile`}
                      className="size-7 overflow-hidden rounded-[9px] border border-white/70"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={brand.imageUrl}
                        alt={brand.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>

                <p className="mt-3 text-[9px] font-medium text-black/68">
                  Edit your brands
                </p>
              </article>

              <article className="rounded-[16px] bg-[#EFEFEF] p-3 shadow-[0_8px_22px_rgba(0,0,0,0.06)]">
                <div className="inline-flex items-center overflow-hidden rounded-[10px] border border-black/10 bg-[#E3E3E3]">
                  <span className="px-2 py-1 text-[9px] font-medium text-black/70">
                    M
                  </span>
                  <span className="border-l border-black/12 px-2 py-1 text-[9px] font-medium text-black/70">
                    W
                  </span>
                </div>

                <p className="mt-3 text-[9px] font-medium text-black/68">
                  Gender preferences
                </p>
              </article>
            </div>

            <article className="rounded-[22px] bg-[linear-gradient(170deg,#1A357E_0%,#7C8491_100%)] p-4 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[28px] leading-none">0</span>
                    <span className="inline-flex size-6 items-center justify-center rounded-full bg-white/30 text-[14px] font-medium">
                      p
                    </span>
                  </div>
                  <p className="mt-2 text-[8px] text-white/92">
                    Phia points available
                  </p>
                </div>

                <button
                  type="button"
                  className="rounded-full border border-white/45 bg-white/35 px-4 py-2 text-[8px] font-medium text-white"
                >
                  Track my points
                </button>
              </div>
            </article>

            <article className="rounded-[20px] bg-[linear-gradient(120deg,#3C5DAA_0%,#182C5E_70%,#10224D_100%)] p-4 text-white">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-medium">Give feedback</p>
                <button
                  type="button"
                  className="rounded-[16px] border border-white/55 bg-white/20 px-3 py-1.5 text-[8px] font-medium text-white"
                >
                  Text us
                </button>
              </div>
            </article>
          </div>
        ) : activeBottomNav === "search" ? (
          <div className="space-y-5 pt-2">
            <section className="rounded-[20px] bg-[#F2F2F2] p-3">
              <h2
                className={cn(
                  bodoniModa.className,
                  "text-[16px] leading-[1.05] tracking-[-0.02em] text-black",
                )}
              >
                Search by look
              </h2>

              {searchLookCards.length > 0 ? (
                <div className="mt-3 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <div className="flex w-max gap-3 pr-2">
                    {searchLookCards.map((item) => (
                      <article
                        key={item.id}
                        className="relative h-[150px] w-[214px] shrink-0 overflow-hidden rounded-[14px] bg-white"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />

                        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.56),rgba(0,0,0,0.1),transparent)]" />

                        <div className="absolute inset-x-4 bottom-4">
                          <p
                            className={cn(
                              bodoniModa.className,
                              "overflow-hidden text-[12px] leading-[1.05] text-white [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]",
                            )}
                          >
                            {item.title}
                          </p>
                          <button
                            type="button"
                            className="mt-1.5 rounded-[12px] border border-white/90 px-2.5 py-0.5 text-[10px] font-medium text-white"
                          >
                            See the list
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex h-28 items-center justify-center rounded-2xl bg-white text-sm text-black/50">
                  No search looks available.
                </div>
              )}
            </section>

            <section className="rounded-[20px] bg-[#F2F2F2] p-3">
              <div className="flex items-center justify-between gap-3">
                <h2
                  className={cn(
                    bodoniModa.className,
                    "text-[16px] leading-[1.05] tracking-[-0.02em] text-black",
                  )}
                >
                  Search by brand
                </h2>

                <button
                  type="button"
                  aria-label="Open brand search"
                  className="flex size-6 items-center justify-center rounded-full bg-[#E5E5E5] text-black/70"
                >
                  <RiArrowRightSLine className="size-3.5" />
                </button>
              </div>

              {searchBrandCards.length > 0 ? (
                <div className="mt-3 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <div className="grid w-max auto-cols-[145px] grid-flow-col grid-rows-2 gap-3 pr-2">
                    {searchBrandCards.map((brand) => (
                      <article
                        key={brand.id}
                        className="relative h-[86px] overflow-hidden rounded-[16px] bg-white"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={brand.imageUrl}
                          alt={brand.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/28" />
                        <p className="absolute inset-0 flex items-center justify-center px-2 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-white">
                          {brand.name}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex h-24 items-center justify-center rounded-2xl bg-white text-sm text-black/50">
                  No brands available.
                </div>
              )}
            </section>
          </div>
        ) : activeTab === "For You" ? (
          <div className="pt-4">
            <h2
              className={cn(
                bodoniModa.className,
                "text-[16px] leading-[1.05] tracking-[-0.02em] text-black",
              )}
            >
              Browse styles
            </h2>

            {curatedTypes.length > 0 ? (
              <div className="mt-5 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex w-max gap-3 pr-2">
                  {curatedTypes.map((item) => (
                    <article
                      key={item.id}
                      className="relative h-[230px] w-[165px] shrink-0 overflow-hidden rounded-t-[90px] rounded-b-[16px] bg-white"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />

                      <div className="absolute inset-0 bg-black/18" />

                      <div className="absolute inset-0 flex items-center justify-center px-4">
                        <p className="text-center font-serif text-[20px] leading-[1.08] tracking-[-0.01em] text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]">
                          {item.name}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-4 flex h-32 items-center justify-center rounded-2xl bg-white text-sm text-black/50">
                No curated styles available.
              </div>
            )}

            <div className="mt-7">
              <div className="flex items-center justify-between gap-3">
                <h3
                  className={cn(
                    bodoniModa.className,
                    "text-[16px] leading-[1.1] tracking-[-0.02em] text-black",
                  )}
                >
                  Suggested{" "}
                  <span className="text-[#1F9D55]">&quot;Signals&quot;</span>{" "}
                  for you
                </h3>

                <span className="rounded-full bg-[#1F9D55] px-2 py-1 text-[8px] font-semibold tracking-[0.08em] text-white">
                  NEW
                </span>
              </div>

              <p className="text-[11px] text-black/58">
                Based on your recent activity
              </p>

              {trendItems.length > 0 ? (
                <div className="mt-3 columns-2 gap-2 [column-fill:_balance]">
                  {trendItems.map((item) => (
                    <article key={item.id} className="mb-2 break-inside-avoid">
                      <a
                        href={item.linkUrl || undefined}
                        target={item.linkUrl ? "_blank" : undefined}
                        rel={item.linkUrl ? "noreferrer" : undefined}
                        className="block"
                      >
                        <div className="relative rounded-2xl bg-white p-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            loading="lazy"
                            className="h-auto w-full rounded-[14px] bg-[#EFEFEF]"
                          />

                          <span className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-[#E8E8E8] text-black/55">
                            <RiBookmarkLine className="size-4" />
                          </span>
                        </div>
                      </a>

                      <div className="flex items-center gap-3 px-1.5 py-1.5 text-black/58">
                        <button type="button" aria-label="Like">
                          <ThumbsUp className="size-3.5" />
                        </button>
                        <button type="button" aria-label="Dislike">
                          <ThumbsDown className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label="More"
                          className="ml-auto -m-2 inline-flex size-8 items-center justify-center rounded-full text-black/58 hover:bg-black/5"
                          onClick={() => setSelectedSignalItem(item)}
                        >
                          <EllipsisVertical className="size-3.5" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-3 flex h-28 items-center justify-center rounded-2xl bg-white text-sm text-black/50">
                  No suggested signals available.
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "Trending" ? (
          <div className="pt-4">
            <h2
              className={cn(
                bodoniModa.className,
                "text-[16px] leading-[1.05] tracking-[-0.02em] text-black",
              )}
            >
              Top trends
            </h2>

            {trendingCollections.length > 0 ? (
              <>
                <div
                  ref={trendCarouselRef}
                  onScroll={handleTrendCarouselScroll}
                  className="mt-4 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                  <div className="flex w-max gap-3 pr-2">
                    {trendingCollections.map((item) => (
                      <article
                        key={item.id}
                        className="relative h-[190px] w-[260px] shrink-0 overflow-hidden rounded-xl bg-white"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />

                        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.58),rgba(0,0,0,0.18),transparent)]" />

                        <div className="absolute inset-x-4 bottom-4">
                          <p
                            className={cn(
                              bodoniModa.className,
                              "text-[14px] leading-[1.02] tracking-[-0.01em] text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]",
                            )}
                          >
                            {item.title}
                          </p>

                          {item.products[0]?.linkUrl ? (
                            <a
                              href={item.products[0].linkUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-flex items-center rounded-md border border-white/90 px-3 py-1.5 text-[11px] font-medium text-white"
                            >
                              See the list
                            </a>
                          ) : (
                            <button
                              type="button"
                              className="mt-2 inline-flex items-center rounded-md border border-white/90 px-3 py-1.5 text-[11px] font-medium text-white"
                            >
                              See the list
                            </button>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-center gap-2">
                  {trendingCollections.map((item, index) => (
                    <button
                      key={`${item.id}-dot`}
                      type="button"
                      aria-label={`Go to trend ${index + 1}`}
                      onClick={() => goToTrendSlide(index)}
                      className={cn(
                        "h-1.5 w-1.5 rounded-full transition-colors",
                        activeTrendSlide === index ? "bg-black" : "bg-black/25",
                      )}
                    />
                  ))}
                </div>

                <div className="mt-7">
                  <div className="flex items-center justify-between gap-3">
                    <h3
                      className={cn(
                        bodoniModa.className,
                        "text-[16px] leading-[1.05] tracking-[-0.02em] text-black",
                      )}
                    >
                      Trending with phia
                    </h3>

                    <button
                      type="button"
                      aria-label="Open trending with phia"
                      className="flex size-7 items-center justify-center rounded-full bg-[#E5E5E5] text-black/70"
                    >
                      <RiArrowRightSLine className="size-4" />
                    </button>
                  </div>

                  {trendItems.length > 0 ? (
                    <div className="mt-3 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                      <div className="flex w-max gap-3 pr-2">
                        {trendItems.slice(0, 10).map((item, index) => {
                          const viewCount = seededNumberFromString(
                            `${TRENDING_VIEWS_SEED}-${item.id}-${index}`,
                            200,
                            500,
                          );

                          return (
                            <article
                              key={`${item.id}-trending-with-phia`}
                              className="w-[168px] shrink-0"
                            >
                              <a
                                href={item.linkUrl || undefined}
                                target={item.linkUrl ? "_blank" : undefined}
                                rel={item.linkUrl ? "noreferrer" : undefined}
                                className="block"
                              >
                                <div className="relative rounded-[18px] bg-white p-1">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    loading="lazy"
                                    className="h-[216px] w-full rounded-[14px] bg-[#EFEFEF] object-cover"
                                  />

                                  <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-[#ECECEC]/95 px-2 py-1 text-[11px] font-medium text-black/70 shadow-[0_2px_6px_rgba(0,0,0,0.18)]">
                                    <RiEyeLine className="size-3.5" />
                                    {viewCount}
                                  </span>
                                </div>
                              </a>

                              <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.08em] text-black/45">
                                {item.brand || "Phia"}
                              </p>
                              <p className="mt-0.5 overflow-hidden text-[16px] font-medium leading-[1.15] text-black [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                                {item.name}
                              </p>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 flex h-28 items-center justify-center rounded-2xl bg-white text-sm text-black/50">
                      No trending products available.
                    </div>
                  )}
                </div>

                <div className="mt-7">
                  <h3
                    className={cn(
                      bodoniModa.className,
                      "text-[16px] leading-[1.05] tracking-[-0.02em] text-black",
                    )}
                  >
                    Trending brands
                  </h3>

                  {trendingBrands.length > 0 ? (
                    <div className="mt-3 overflow-hidden rounded-[18px] border border-black/10 bg-[#ECECEC]">
                      {trendingBrands.map((brand) => (
                        <article
                          key={brand.id}
                          className="flex items-center gap-3 border-t border-black/10 px-3 py-3 first:border-t-0"
                        >
                          <p className="w-9 shrink-0 text-[18px] font-medium leading-none text-black/65">
                            #{brand.trendingRank}
                          </p>

                          <div className="min-w-0 flex-1">
                            {brand.logoUrl ? (
                              <a
                                href={brand.brandUrl || undefined}
                                target={brand.brandUrl ? "_blank" : undefined}
                                rel={brand.brandUrl ? "noreferrer" : undefined}
                                className="inline-block"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={brand.logoUrl}
                                  alt={brand.name}
                                  loading="lazy"
                                  className="h-5 w-auto max-w-[130px] object-contain grayscale brightness-0"
                                />
                              </a>
                            ) : (
                              <p className="text-[14px] font-semibold uppercase tracking-[0.03em] text-black">
                                {brand.name}
                              </p>
                            )}

                            <p className="mt-1 text-[11px] text-black/55">
                              {formatVisitCount(brand.visitCount)}
                            </p>
                          </div>

                          <button
                            type="button"
                            aria-label={`Save ${brand.name}`}
                            className="flex size-10 items-center justify-center rounded-full bg-[#E8E8E8] text-black/45"
                          >
                            <RiBookmarkLine className="size-4" />
                          </button>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 flex h-28 items-center justify-center rounded-2xl bg-white text-sm text-black/50">
                      No trending brands available.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="mt-4 flex h-28 items-center justify-center rounded-2xl bg-white text-sm text-black/50">
                No top trends available.
              </div>
            )}
          </div>
        ) : tabItems.length > 0 ? (
          <div className="columns-2 gap-2 [column-fill:_balance]">
            {tabItems.map((item) => (
              <article
                key={item.id}
                className="mb-2 break-inside-avoid rounded-2xl bg-white p-1"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  loading="lazy"
                  className="h-auto w-full rounded-[14px]"
                />
                <div className="px-2 pb-2 pt-1.5">
                  <p className="text-[11px] font-semibold leading-tight text-black">
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-black/65">
                    {item.primaryBrandName}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center rounded-2xl bg-white text-sm text-black/50">
            No content in this tab yet.
          </div>
        )}
      </div>

      {selectedSignalItem && activeBottomNav === "home" ? (
        <div className="absolute inset-0 z-40">
          <button
            type="button"
            aria-label="Dismiss signal actions"
            className="absolute inset-0 bg-black/25"
            onClick={() => setSelectedSignalItem(null)}
          />

          <div className="absolute inset-x-0 bottom-0 max-h-[86%] overflow-y-auto rounded-t-[34px] bg-[#F2F2F2] pb-8 pt-2 shadow-[0_-16px_36px_rgba(0,0,0,0.2)]">
            <div className="mx-auto h-1 w-14 rounded-full bg-black/12" />

            <div className="mt-3 px-3">
              <div className="relative overflow-hidden rounded-[30px] bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedSignalItem.imageUrl}
                  alt={selectedSignalItem.name}
                  loading="lazy"
                  className="h-[340px] w-full object-cover opacity-35"
                />

                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setSelectedSignalItem(null)}
                  className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/90 text-[30px] leading-none text-black/80"
                >
                  <span aria-hidden="true">x</span>
                </button>

                <div className="absolute inset-x-0 bottom-8 px-4 text-center">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-black/45">
                    {selectedSignalItem.brand || "Phia"}
                  </p>
                  <p className="mt-4 text-[16px] font-medium leading-tight text-black">
                    Inspired by your recent activity
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 px-4">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#EAEAEA] px-4 py-3 text-[16px] font-medium text-black/70"
              >
                <RiBookmarkLine className="size-4" />
                Save
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#EAEAEA] px-4 py-3 text-[16px] font-medium text-black/70"
              >
                <RiShare2Line className="size-4" />
                Share
              </button>
            </div>

            <div className="mt-4 space-y-3 px-4">
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-3xl bg-[#EAEAEA] px-4 py-4 text-left text-[14px] font-medium text-black/70"
              >
                <ThumbsDown className="size-5" />
                Show less like this
              </button>

              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-3xl bg-[#EAEAEA] px-4 py-4 text-left text-[14px] font-medium text-black/70"
              >
                <ThumbsUp className="size-5" />
                Show more like this
              </button>

              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-3xl bg-[#EAEAEA] px-4 py-4 text-left text-[14px] font-medium text-black/70"
              >
                <RiEyeLine className="size-5" />
                Show more from this store
              </button>

              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-3xl bg-[#EAEAEA] px-4 py-4 text-left text-[14px] font-medium text-black/70"
              >
                <RiEyeOffLine className="size-5" />
                Show less from this store
              </button>

              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-3xl bg-[#EAEAEA] px-4 py-4 text-left text-[14px] font-medium text-black/70"
              >
                <RiCloseCircleLine className="size-5" />
                Report
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] z-50">
        <nav className="flex items-center justify-around bg-white/70 backdrop-blur-2xl border border-white/40 p-2 rounded-[32px] shadow-2xl">
          <button
            type="button"
            onClick={() => handleBottomNavSelection("home")}
            className={cn(
              "flex h-11 flex-1 items-center justify-center rounded-2xl transition-all",
              activeBottomNav === "home"
                ? "bg-white text-blue-600 shadow-lg"
                : "text-black/35",
            )}
            aria-label="Home"
          >
            <RiHomeLine className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => handleBottomNavSelection("search")}
            className={cn(
              "flex h-11 flex-1 items-center justify-center rounded-2xl transition-all",
              activeBottomNav === "search"
                ? "bg-white text-blue-600 shadow-lg"
                : "text-black/35",
            )}
            aria-label="Discover"
          >
            <RiSearchLine className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => handleBottomNavSelection("shop")}
            className={cn(
              "flex h-11 flex-1 items-center justify-center rounded-2xl transition-all relative",
              activeBottomNav === "shop"
                ? "bg-white text-blue-600 shadow-lg"
                : "text-black/35",
            )}
            aria-label="Shop"
          >
            {activeBottomNav === "shop" ? (
              <RiShoppingBagFill className="size-6 text-blue-600" />
            ) : (
              <RiShoppingBagLine className="size-5" />
            )}
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
              2
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleBottomNavSelection("saved")}
            className={cn(
              "flex h-11 flex-1 items-center justify-center rounded-2xl transition-all",
              activeBottomNav === "saved"
                ? "bg-white text-blue-600 shadow-lg"
                : "text-black/35",
            )}
            aria-label="Saved"
          >
            <RiBookmarkLine className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => handleBottomNavSelection("profile")}
            className={cn(
              "flex h-11 flex-1 items-center justify-center rounded-2xl transition-all",
              activeBottomNav === "profile"
                ? "bg-white text-blue-600 shadow-lg"
                : "text-black/35",
            )}
            aria-label="Profile"
          >
            <RiUser4Line className="size-5" />
          </button>
        </nav>
      </div>
    </div>
  );
}

export function PhiaWorkspace() {
  const [deviceView, setDeviceView] = useState<"phone" | "desktop">("phone");
  const [previewStage, setPreviewStage] = useState<PreviewStage>("splash");
  const [activeTab, setActiveTab] = useState<PreviewTab>("Explore");
  const [view, setView] = useState(DEFAULT_VIEW);
  const [history, setHistory] = useState<ViewState[]>([DEFAULT_VIEW]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showGrid] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    pointerX: number;
    pointerY: number;
    startView: ViewState;
  } | null>(null);
  const isPlaying = previewStage !== "idle";

  const exploreCards = useMemo<ExploreCard[]>(() => {
    const sections =
      (exploreFeedData as FeedImport).data?.exploreFeed?.sections ?? [];
    const cards: ExploreCard[] = [];

    for (const section of sections) {
      const items = section.data?.items ?? [];

      for (const item of items) {
        const entityType = item.entityType ?? "UNKNOWN";
        const variant = item.variant ?? "PRIMARY";

        let title = "Untitled";
        let subtitle = "Phia";
        let name = "Untitled";
        let primaryBrandName = "Phia";
        let description = "";
        let imageUrl = "";
        let linkUrl = "";

        const detailRows: Array<{ label: string; value: string }> = [
          { label: "ID", value: item.id ?? "N/A" },
          { label: "Type", value: entityType },
          { label: "Variant", value: variant },
        ];

        if (item.product) {
          name = item.product.name ?? name;
          primaryBrandName = item.product.primaryBrandName ?? primaryBrandName;
          title = item.product.name ?? title;
          subtitle = item.product.primaryBrandName ?? subtitle;
          description = item.product.description ?? "";
          imageUrl =
            item.product.imgUrl ?? item.product.additionalImgUrls?.[0] ?? "";
          linkUrl = item.product.productUrl ?? "";

          const price = formatPrice(item.product.priceUsd);
          if (price) {
            detailRows.push({ label: "Price", value: price });
          }
          if (item.product.primaryBrandName) {
            detailRows.push({
              label: "Brand",
              value: item.product.primaryBrandName,
            });
          }
          if (item.product.sourceDisplayName) {
            detailRows.push({
              label: "Source",
              value: item.product.sourceDisplayName,
            });
          }
          if (item.product.domain) {
            detailRows.push({ label: "Domain", value: item.product.domain });
          }
          if (item.product.colorString) {
            detailRows.push({
              label: "Color",
              value: item.product.colorString,
            });
          }
          if (item.product.sizeDisplayName) {
            detailRows.push({
              label: "Size",
              value: item.product.sizeDisplayName,
            });
          }
          if (item.product.gender) {
            detailRows.push({ label: "Gender", value: item.product.gender });
          }
        } else if (item.outfit) {
          name = item.outfit.title ?? name;
          primaryBrandName = "Outfit";
          title = item.outfit.title ?? "Untitled outfit";
          subtitle = "Outfit";
          description = item.outfit.description ?? "";
          imageUrl =
            item.outfit.imgUrl ??
            item.outfit.imgUrls?.[0] ??
            item.outfit.products?.[0]?.imageLink ??
            "";
          linkUrl = item.outfit.products?.[0]?.linkToProduct ?? "";

          detailRows.push({
            label: "Products",
            value: String(item.outfit.products?.length ?? 0),
          });
          if (item.outfit.order != null) {
            detailRows.push({
              label: "Order",
              value: String(item.outfit.order),
            });
          }
          if (item.outfit.isFeatured != null) {
            detailRows.push({
              label: "Featured",
              value: item.outfit.isFeatured ? "Yes" : "No",
            });
          }
          if (item.outfit.isPublished != null) {
            detailRows.push({
              label: "Published",
              value: item.outfit.isPublished ? "Yes" : "No",
            });
          }

          const outfitBrands = (item.outfit.products ?? [])
            .map((product) => product.brand)
            .filter((brand): brand is string => Boolean(brand));
          if (outfitBrands.length > 0) {
            primaryBrandName = Array.from(new Set(outfitBrands))
              .slice(0, 2)
              .join(" / ");
            subtitle = primaryBrandName;
          }
        } else if (item.editorial) {
          name = item.editorial.title ?? item.editorial.headline ?? name;
          primaryBrandName = "Editorial";
          title =
            item.editorial.title ??
            item.editorial.headline ??
            "Untitled editorial";
          subtitle = "Editorial";
          description = item.editorial.description ?? "";
          imageUrl = item.editorial.imgUrl ?? item.editorial.imageUrl ?? "";
          linkUrl = item.editorial.url ?? "";
        }

        if (!imageUrl) {
          continue;
        }

        if (!linkUrl && item.product?.productUrl) {
          linkUrl = item.product.productUrl;
        }

        if (linkUrl) {
          const hostname = safeDomain(linkUrl);
          if (hostname) {
            detailRows.push({ label: "URL", value: hostname });
          }
        }

        cards.push({
          id: item.id ?? `explore-item-${cards.length}`,
          entityType,
          variant,
          name,
          primaryBrandName,
          title,
          subtitle,
          description,
          imageUrl,
          detailRows,
          linkUrl,
        });
      }
    }

    return cards;
  }, []);

  const curatedCards = useMemo<CuratedCard[]>(() => {
    const curatedTypes =
      (curatedData as CuratedImport).data?.curatedTypes ?? [];
    const cards: CuratedCard[] = [];

    for (const item of curatedTypes) {
      const imageUrl = item.imgUrl ?? "";
      const name = item.name?.trim() ?? "";

      if (!imageUrl || !name) {
        continue;
      }

      cards.push({
        id: item.typeId ?? `curated-${cards.length}`,
        name,
        imageUrl,
      });
    }

    return cards;
  }, []);

  const trendCards = useMemo<TrendCard[]>(() => {
    const products = (trendsData as TrendsImport).data?.trendingProducts ?? [];
    const cards: TrendCard[] = [];

    for (const item of products) {
      const imageUrl = item.imageLink ?? "";
      const name = item.itemName?.trim() ?? "";

      if (!imageUrl || !name) {
        continue;
      }

      cards.push({
        id: item.productId ?? `trend-${cards.length}`,
        name,
        brand: item.brand?.trim() ?? "",
        imageUrl,
        linkUrl: item.linkToProduct ?? "",
      });
    }

    return cards;
  }, []);

  const searchLookCards = useMemo<SearchLookCard[]>(() => {
    const popularSearches =
      (searchData as SearchImport).data?.popularSearches ?? [];

    const cards = popularSearches
      .map((item, index) => {
        const imageUrl = item.imgUrl?.trim() ?? "";
        const title = item.query?.trim() ?? "";
        const category = item.category?.trim() ?? "";
        const numericRank = Number(item.rank);

        return {
          id: `search-look-${index}`,
          imageUrl,
          title,
          category,
          rank: Number.isFinite(numericRank)
            ? numericRank
            : Number.MAX_SAFE_INTEGER,
        };
      })
      .filter((item) => item.imageUrl && item.title)
      .sort((left, right) => left.rank - right.rank)
      .slice(0, SEARCH_LOOK_LIMIT);

    return cards.map((item) => ({
      id: item.id,
      imageUrl: item.imageUrl,
      title: item.title,
      category: item.category,
    }));
  }, []);

  const [searchBrandCards] = useState<SearchBrandCard[]>(() => {
    const brands = (brandsData as BrandsImport).data?.trendingBrands ?? [];
    const cards = brands
      .map((brand, index) => ({
        id: brand.id ?? `search-brand-${index}`,
        name: brand.name?.trim() ?? "",
        imageUrl: brand.imgUrl?.trim() ?? "",
        brandUrl: brand.brandUrl ?? "",
      }))
      .filter((brand) => brand.name && brand.imageUrl);

    if (cards.length <= SEARCH_BRAND_LIMIT) {
      return cards;
    }

    const offset = SEARCH_BRAND_SEED % cards.length;
    const rotated = [...cards.slice(offset), ...cards.slice(0, offset)];
    return rotated.slice(0, SEARCH_BRAND_LIMIT);
  });

  const trendingBrandRows = useMemo<TrendingBrandListItem[]>(() => {
    const brands = (brandsData as BrandsImport).data?.trendingBrands ?? [];
    const usedRanks = new Set<number>();
    const rows: TrendingBrandListItem[] = [];

    for (const brand of brands) {
      const rank = Number(brand.trendingRank);
      if (Number.isFinite(rank) && rank > 0) {
        usedRanks.add(Math.floor(rank));
      }
    }

    for (let index = 0; index < brands.length; index += 1) {
      const brand = brands[index];
      const name = brand.name?.trim() ?? "";

      if (!name) {
        continue;
      }

      const parsedRank = Number(brand.trendingRank);
      let nextRank =
        Number.isFinite(parsedRank) && parsedRank > 0
          ? Math.floor(parsedRank)
          : 0;

      if (!nextRank) {
        let candidate = seededNumberFromString(
          `${TRENDING_BRANDS_RANK_SEED}-${brand.id ?? name}-${index}`,
          1,
          Math.max(brands.length * 20, 500),
        );

        while (usedRanks.has(candidate)) {
          candidate += 1;
        }

        nextRank = candidate;
        usedRanks.add(nextRank);
      }

      const parsedVisitCount = Number(brand.visitCount);

      rows.push({
        id: brand.id ?? `brand-${index}`,
        name,
        logoUrl: brand.logoUrl ?? "",
        brandUrl: brand.brandUrl ?? "",
        visitCount:
          Number.isFinite(parsedVisitCount) && parsedVisitCount > 0
            ? parsedVisitCount
            : 0,
        trendingRank: nextRank,
      });
    }

    rows.sort(
      (left, right) =>
        left.trendingRank - right.trendingRank ||
        left.name.localeCompare(right.name),
    );

    return rows.slice(0, TRENDING_BRANDS_LIMIT);
  }, []);

  const trendingCollections = useMemo<TrendingCollectionCard[]>(() => {
    const outfits = (trendingData as TrendingImport).data?.outfits ?? [];
    const cards: TrendingCollectionCard[] = [];

    for (const item of outfits) {
      const title = item.title?.trim() ?? "";
      const imageUrl = item.imgUrl ?? "";

      if (!title || !imageUrl) {
        continue;
      }

      const products = (item.products ?? [])
        .map((product, index) => ({
          id: product.productId ?? `${item.outfitId ?? "trend"}-${index}`,
          name: product.itemName?.trim() ?? "",
          brand: product.brand?.trim() ?? "",
          imageUrl: product.imageLink ?? "",
          linkUrl: product.linkToProduct ?? "",
        }))
        .filter((product) => product.name || product.linkUrl);

      cards.push({
        id: item.outfitId ?? `trending-${cards.length}`,
        title,
        imageUrl,
        products,
      });
    }

    if (cards.length <= TREND_SAMPLE_SIZE) {
      return cards;
    }

    const offset = TREND_ROTATION_SEED % cards.length;
    const rotatedCards = [...cards.slice(offset), ...cards.slice(0, offset)];
    return rotatedCards.slice(0, TREND_SAMPLE_SIZE);
  }, []);

  const commitView = (nextView: ViewState) => {
    setView(nextView);
    setHistory((previousHistory) => {
      const truncatedHistory = previousHistory.slice(0, historyIndex + 1);
      const lastView = truncatedHistory.at(-1);

      if (lastView && isSameView(lastView, nextView)) {
        return previousHistory;
      }

      const updatedHistory = [...truncatedHistory, nextView];
      setHistoryIndex(updatedHistory.length - 1);
      return updatedHistory;
    });
  };

  const adjustScale = (delta: number) => {
    const nextView = {
      ...view,
      scale: clampScale(Number((view.scale + delta).toFixed(2))),
    };

    commitView(nextView);
  };

  const restoreHistory = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= history.length) {
      return;
    }

    setHistoryIndex(nextIndex);
    setView(history[nextIndex]);
  };

  const handlePointerMove = useEffectEvent((event: PointerEvent) => {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) {
      return;
    }

    const { pointerX, pointerY, startView } = dragRef.current;
    setView({
      ...startView,
      x: startView.x + event.clientX - pointerX,
      y: startView.y + event.clientY - pointerY,
    });
  });

  const handlePointerUp = useEffectEvent((event: PointerEvent) => {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) {
      return;
    }

    const { pointerX, pointerY, startView } = dragRef.current;
    const nextView = {
      ...startView,
      x: startView.x + event.clientX - pointerX,
      y: startView.y + event.clientY - pointerY,
    };

    dragRef.current = null;
    setIsDragging(false);
    commitView(nextView);
  });

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, []);

  useEffect(() => {
    if (previewStage !== "splash") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPreviewStage("feed");
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [previewStage]);

  const handleCanvasPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (
      event.target instanceof HTMLElement &&
      event.target.closest('[data-drag-ignore="true"]')
    ) {
      return;
    }

    dragRef.current = {
      pointerId: event.pointerId,
      pointerX: event.clientX,
      pointerY: event.clientY,
      startView: view,
    };
    setIsDragging(true);
  };

  return (
    <div className="dark min-h-screen bg-[#0E0D12] text-white">
      <Toaster position="bottom-right" richColors theme="dark" />
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
        <SidebarInset className="min-h-screen bg-[#0E0D12] text-white md:m-0 md:rounded-none md:shadow-none">
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 px-4">
              <div className="flex min-w-0 items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-vertical:h-4 data-vertical:self-auto"
                />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">Phia</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Signal</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              <div className="flex items-center justify-center gap-2">
                <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/6 px-1 py-0.5">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className={cn(
                      "h-7 min-w-9 px-2.5 rounded-full text-zinc-400 hover:bg-white/8 hover:text-white",
                      deviceView === "phone" && "bg-white/10 text-white",
                    )}
                    onClick={() => setDeviceView("phone")}
                    aria-pressed={deviceView === "phone"}
                  >
                    <RiSmartphoneFill className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className={cn(
                      "h-7 min-w-9 px-2.5 rounded-full text-zinc-400 hover:bg-white/8 hover:text-white",
                      deviceView === "desktop" && "bg-white/10 text-white",
                    )}
                    onClick={() => setDeviceView("desktop")}
                    aria-pressed={deviceView === "desktop"}
                  >
                    <RiMacFill className="size-4" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  className={cn(
                    "h-8 w-8 rounded-full border border-white/10 bg-white/6 text-zinc-300 hover:bg-white/10 hover:text-white",
                    isPlaying && "border-white/30 bg-white/14 text-white",
                  )}
                  onClick={() =>
                    setPreviewStage((currentValue) =>
                      currentValue === "idle" ? "splash" : "idle",
                    )
                  }
                  aria-label="Play"
                  aria-pressed={isPlaying}
                >
                  <RiPlayFill className="size-4" />
                </Button>
              </div>

              <div className="flex items-center justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-8 w-10 rounded-full border-0 bg-transparent px-2 text-zinc-300 hover:bg-transparent hover:text-white"
                  aria-label="Notifications"
                >
                  <RiNotification2Fill className="size-5" />
                  <span
                    aria-hidden="true"
                    className="absolute top-1 right-2 block size-2 rounded-full bg-red-500 ring-2 ring-[#0E0D12]"
                  />
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-3">
            {deviceView === "phone" ? (
              <section
                className={cn(
                  "relative flex h-[calc(100vh-72px)] min-h-[680px] overflow-hidden rounded-[28px] border border-white/8 bg-[#171717] shadow-[0_30px_80px_rgba(0,0,0,0.45)]",
                  isDragging ? "cursor-grabbing" : "cursor-grab",
                )}
                onPointerDown={handleCanvasPointerDown}
              >
                <div
                  className="absolute -inset-24 transition-transform"
                  style={{
                    transform: `translate(${view.x}px, ${view.y}px)`,
                    transition: isDragging
                      ? "none"
                      : "transform 180ms ease-out",
                  }}
                />
                <div
                  className="absolute -inset-24 transition-opacity"
                  style={
                    showGrid
                      ? {
                        backgroundImage: DOT_PATTERN,
                        backgroundRepeat: "repeat",
                        transform: `translate(${view.x}px, ${view.y}px)`,
                      }
                      : {
                        transform: `translate(${view.x}px, ${view.y}px)`,
                      }
                  }
                />

                <div
                  className="absolute top-1/2 left-5 z-20 flex -translate-y-1/2 cursor-default flex-col items-center gap-3"
                  data-drag-ignore="true"
                >
                  <div className="flex flex-col gap-2 rounded-[18px] border border-white/10 bg-[#16141B]/85 p-2 shadow-[0_20px_40px_rgba(0,0,0,0.35)] backdrop-blur">
                    <WorkspaceControlButton
                      aria-label="Zoom in"
                      onClick={() => adjustScale(0.1)}
                    >
                      <ZoomIn className="size-4" />
                    </WorkspaceControlButton>
                    <WorkspaceControlButton
                      aria-label="Zoom out"
                      onClick={() => adjustScale(-0.1)}
                    >
                      <Minus className="size-4" />
                    </WorkspaceControlButton>
                    <WorkspaceControlButton
                      aria-label="Center canvas"
                      onClick={() => commitView(DEFAULT_VIEW)}
                    >
                      <Maximize className="size-4" />
                    </WorkspaceControlButton>
                    <WorkspaceControlButton
                      aria-label="Undo last view change"
                      disabled={historyIndex === 0}
                      onClick={() => restoreHistory(historyIndex - 1)}
                    >
                      <Undo2 className="size-4" />
                    </WorkspaceControlButton>
                    <WorkspaceControlButton
                      aria-label="Redo last view change"
                      disabled={historyIndex === history.length - 1}
                      onClick={() => restoreHistory(historyIndex + 1)}
                    >
                      <RotateCcw className="size-4 scale-x-[-1]" />
                    </WorkspaceControlButton>
                  </div>

                  <WorkspaceControlButton
                    active={showGuides}
                    aria-label={showGuides ? "Hide guides" : "Show guides"}
                    onClick={() =>
                      setShowGuides((currentValue) => !currentValue)
                    }
                  >
                    <Layers3 className="size-4" />
                  </WorkspaceControlButton>
                </div>

                <div
                  className="relative flex h-full w-full items-center justify-center overflow-hidden px-20 py-8"
                  style={{
                    transform: `translate(${view.x}px, ${view.y}px)`,
                    transition: isDragging
                      ? "none"
                      : "transform 180ms ease-out",
                  }}
                >
                  <div
                    className="relative cursor-default touch-none select-none"
                    data-drag-ignore="true"
                    style={{
                      transform: `scale(${view.scale})`,
                      transition: isDragging
                        ? "none"
                        : "transform 180ms ease-out",
                    }}
                  >
                    <div className="absolute top-1/2 left-1/2 h-[560px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-[64px] bg-black/25 blur-3xl" />

                    <div className="relative h-[620px] w-[305px] rounded-[54px] border border-[#a5917a] bg-[linear-gradient(145deg,#d6c5a8,#5b4d42_34%,#0f0f10_68%,#cfc0a1)] p-[6px] shadow-[0_22px_70px_rgba(0,0,0,0.5)]">
                      <div className="relative h-full w-full overflow-hidden rounded-[48px] border border-black/55 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.18),transparent_32%),linear-gradient(155deg,#8c7c68_0%,#0f0f11_35%,#2b271f_58%,#ece0cf_100%)]">
                        <div className="absolute top-2 left-[-3px] h-18 w-[3px] rounded-full bg-[#c6b69d]" />
                        <div className="absolute top-28 left-[-3px] h-12 w-[3px] rounded-full bg-[#c6b69d]" />
                        <div className="absolute top-44 left-[-3px] h-16 w-[3px] rounded-full bg-[#c6b69d]" />
                        <div className="absolute top-32 right-[-3px] h-20 w-[3px] rounded-full bg-[#c6b69d]" />
                        <div className="absolute top-3 left-1/2 z-30 h-5 w-20 -translate-x-1/2 rounded-full bg-black/90 shadow-[inset_0_-2px_5px_rgba(255,255,255,0.08)]" />

                        {previewStage === "splash" ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-white">
                            <Image
                              src="/phia-light.svg"
                              alt="Phia"
                              width={132}
                              height={132}
                              className="h-auto w-28"
                            />
                          </div>
                        ) : previewStage === "feed" ? (
                          <ExplorePreviewScreen
                            items={exploreCards}
                            curatedTypes={curatedCards}
                            trendItems={trendCards}
                            trendingBrands={trendingBrandRows}
                            searchLookCards={searchLookCards}
                            searchBrandCards={searchBrandCards}
                            trendingCollections={trendingCollections}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            topRoundedClassName="rounded-t-[48px]"
                            showStatusBar
                          />
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_15%,rgba(255,245,220,0.35),transparent_18%),radial-gradient(circle_at_55%_54%,rgba(18,18,18,0.82),transparent_34%),linear-gradient(165deg,#8f806f_0%,#111_33%,#2f2a24_54%,#f2e8d8_100%)] opacity-95" />
                            <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_15%,rgba(255,255,255,0.05)_38%,transparent_52%)]" />

                            {showGuides ? (
                              <>
                                <div className="absolute inset-x-6 top-48 bottom-12 rounded-[30px] border border-dashed border-white/18 bg-black/12" />
                              </>
                            ) : null}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            ) : (
              <section className="relative flex h-[calc(100vh-72px)] min-h-[680px] items-center justify-center overflow-hidden rounded-[28px] border border-white/8 bg-[#171717] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
                <div className="relative w-full max-w-[1024px] rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,#1b1b21_0%,#0f1014_100%)] p-3 shadow-[0_24px_70px_rgba(0,0,0,0.4)]">
                  <div className="mb-3 flex items-center gap-2 rounded-2xl border border-white/8 bg-black/25 px-4 py-2">
                    <span className="size-2 rounded-full bg-[#ff5f57]" />
                    <span className="size-2 rounded-full bg-[#ffbd2e]" />
                    <span className="size-2 rounded-full bg-[#28ca42]" />
                  </div>

                  <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] border border-white/10 bg-[#14151a]">
                    {previewStage === "splash" ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-white">
                        <Image
                          src="/phia-light.svg"
                          alt="Phia"
                          width={160}
                          height={160}
                          className="h-auto w-32"
                        />
                      </div>
                    ) : previewStage === "feed" ? (
                      <ExplorePreviewScreen
                        items={exploreCards}
                        curatedTypes={curatedCards}
                        trendItems={trendCards}
                        trendingBrands={trendingBrandRows}
                        searchLookCards={searchLookCards}
                        searchBrandCards={searchBrandCards}
                        trendingCollections={trendingCollections}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        topRoundedClassName="rounded-t-[20px]"
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_18%,rgba(255,255,255,0.08),transparent_30%),linear-gradient(165deg,#191b23_0%,#12131a_45%,#20222e_100%)]" />
                        {showGuides ? (
                          <div className="absolute inset-8 rounded-2xl border border-dashed border-white/20 bg-black/10" />
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
              </section>
            )}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
