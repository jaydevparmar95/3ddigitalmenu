"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useShop } from "@/context/shop-context";
import { Shop, ShopMenuItem, ShopCategory } from "@/types/shop";
import {
  CoverStartPage,
  CategoryPage,
  BackContactPage,
} from "@/components/book/book-page";
import { BookControls } from "@/components/book/book-controls";
import { MenuGridView } from "@/components/book/menu-grid-view";
import { BookOpen, LayoutGrid, ArrowLeft } from "lucide-react";

// Dynamically load HTMLFlipBook without SSR
const HTMLFlipBook = dynamic(() => import("react-pageflip"), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-4xl aspect-[16/10] max-h-[70vh] pizzeria-leather rounded-2xl flex items-center justify-center text-yellow-300 font-serif shadow-2xl">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin" />
        <span className="text-sm tracking-widest font-bold text-yellow-200 font-serif">
          Opening 3D Digital Menu...
        </span>
      </div>
    </div>
  ),
}) as any;

const ITEMS_PER_PAGE = 4; // Strict maximum 4 items per page rule

interface PageDefinition {
  type: "cover" | "category" | "back";
  category?: ShopCategory;
  items?: ShopMenuItem[];
  title?: string;
  pageNumber?: number;
}

export function MenuBook({ shopId }: { shopId?: string }) {
  const { getShopById, activeShop, isLoaded } = useShop();
  const bookRef = useRef<any>(null);
  const [viewMode, setViewMode] = useState<"book" | "grid">("book");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  // Sync viewMode from URL query param ?view=grid or ?view=book
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get("view");
      if (viewParam === "grid") {
        setViewMode("grid");
      } else if (viewParam === "book") {
        setViewMode("book");
      }
    }
  }, []);

  // Resolve current shop: either by shopId prop or activeShop fallback
  const currentShop: Shop = useMemo(() => {
    if (shopId) {
      const found = getShopById(shopId);
      if (found) return found;
    }
    return activeShop;
  }, [shopId, getShopById, activeShop]);

  useEffect(() => {
    setMounted(true);
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkViewport();
    window.addEventListener("resize", checkViewport);

    // Record real-time unique visitor count in MySQL (Deduplicated per browser & mobile device)
    if (currentShop?.id) {
      let visitorId = "";
      try {
        visitorId = localStorage.getItem("digital_menu_browser_visitor_id") || "";
      } catch { }

      // Cookie check for mobile webviews
      if (!visitorId && typeof document !== "undefined") {
        const match = document.cookie.match(/(?:^|; )digital_menu_vid=([^;]*)/);
        if (match) visitorId = decodeURIComponent(match[1]);
      }

      if (!visitorId) {
        visitorId = `vid_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        try {
          localStorage.setItem("digital_menu_browser_visitor_id", visitorId);
        } catch { }
        if (typeof document !== "undefined") {
          document.cookie = `digital_menu_vid=${visitorId}; path=/; max-age=31536000; SameSite=Lax`;
        }
      }

      const localKey = `visited_shop_${currentShop.id}`;
      let hasVisited = false;
      try {
        hasVisited = Boolean(localStorage.getItem(localKey));
      } catch { }

      if (!hasVisited && typeof document !== "undefined") {
        hasVisited = document.cookie.includes(`${localKey}=1`);
      }

      if (!hasVisited) {
        fetch(`/api/shops/${currentShop.id}/visit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.success) {
              try {
                localStorage.setItem(localKey, Date.now().toString());
              } catch { }
              if (typeof document !== "undefined") {
                document.cookie = `${localKey}=1; path=/; max-age=86400; SameSite=Lax`;
              }
            }
          })
          .catch(() => { });
      }
    }

    return () => window.removeEventListener("resize", checkViewport);
  }, [currentShop?.id]);

  // Keyboard navigation for 3D Book
  useEffect(() => {
    if (viewMode !== "book") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!bookRef.current) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        bookRef.current.pageFlip()?.flipNext();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        bookRef.current.pageFlip()?.flipPrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode]);

  // Generate paginated pages strictly adhering to MAX 4 ITEMS PER PAGE
  const generatedPages: PageDefinition[] = useMemo(() => {
    const pages: PageDefinition[] = [];

    // Page 0: Shop-Specific Cover Start Page
    pages.push({ type: "cover", title: `${currentShop.name} Cover` });

    let runningPageNumber = 2;

    currentShop.categories.forEach((cat) => {
      const catItems = currentShop.items.filter((item) => item.category === cat.id);
      if (catItems.length === 0) {
        // Empty category still gets 1 clean page
        pages.push({
          type: "category",
          category: cat,
          items: [],
          title: cat.name,
          pageNumber: runningPageNumber++,
        });
      } else {
        // Split items into chunks of at most 4 items per page
        for (let i = 0; i < catItems.length; i += ITEMS_PER_PAGE) {
          const chunk = catItems.slice(i, i + ITEMS_PER_PAGE);
          const isContinuation = i > 0;
          const pageTitle = isContinuation ? `${cat.name} (Part ${Math.floor(i / ITEMS_PER_PAGE) + 1})` : cat.name;

          pages.push({
            type: "category",
            category: { ...cat, name: pageTitle },
            items: chunk,
            title: pageTitle,
            pageNumber: runningPageNumber++,
          });
        }
      }
    });

    // Final Page: Contact & Timings Page
    pages.push({ type: "back", title: "Information & Contact" });

    // In 2-page spread mode on desktop, ensure even number of total pages
    if (!isMobile && pages.length % 2 !== 0) {
      pages.push({ type: "back", title: "Information & Contact" });
    }

    return pages;
  }, [currentShop, isMobile]);

  const totalPages = generatedPages.length;

  const handleNext = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip()?.flipNext();
    }
  };

  const handlePrev = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip()?.flipPrev();
    }
  };

  const handleJumpToCategory = (targetPage: number) => {
    if (bookRef.current) {
      bookRef.current.pageFlip()?.flip(targetPage);
    }
  };

  const onPageFlip = (e: any) => {
    setCurrentPage(e.data);
  };

  if (!isLoaded || !mounted) {
    return (
      <div className="h-[100dvh] w-screen pizzeria-ambient flex items-center justify-center text-yellow-300 font-serif">
        <span>Opening {currentShop?.name || "Digital Menu"}...</span>
      </div>
    );
  }

  return (
    <div className={`theme-${currentShop.theme || "emerald"}`}>
      {/* Option 2: Grid View Option */}
      {viewMode === "grid" ? (
        <div className="relative min-h-screen">
          {/* Top Sticky Navigation Bar for Grid View */}
          <div className="sticky top-0 z-50 bg-[#06120b]/95 backdrop-blur-md border-b border-yellow-500/20 px-3 py-2 sm:px-6 shadow-xl flex items-center justify-between">
            {/* Mobile-Optimized Go Back Button */}
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900/90 hover:bg-stone-800 border border-yellow-500/40 hover:border-yellow-400 text-yellow-300 hover:text-white text-xs font-bold shadow-md transition-all active:scale-95 font-sans cursor-pointer"
              title="Go Back to All Shop"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
              <span className="hidden sm:inline">All Shops</span>
              <span className="sm:hidden font-semibold">Back</span>
            </Link>

            {/* View Switcher Pill */}
            <div className="bg-stone-950/90 border border-yellow-500/40 p-0.5 sm:p-1 rounded-full shadow-lg flex items-center gap-0.5 sm:gap-1 font-sans text-xs">
              <button
                type="button"
                onClick={() => setViewMode("book")}
                className="flex items-center gap-1 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full font-bold text-stone-300 hover:text-yellow-200 transition-all cursor-pointer text-[10.5px] sm:text-xs"
              >
                <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>3D Flipbook</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className="flex items-center gap-1 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full font-black bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-stone-950 shadow-md transition-all cursor-pointer text-[10.5px] sm:text-xs"
              >
                <LayoutGrid className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>4D Grid</span>
              </button>
            </div>
          </div>

          <MenuGridView shop={currentShop} />
        </div>
      ) : (
        /* Option 1: 3D Book Menu Option (Maximized for mobile space utilization) */
        <div className="h-[100dvh] max-h-[100dvh] w-screen pizzeria-ambient flex flex-col justify-between pt-1 pb-3 sm:py-2.5 sm:px-4 relative overflow-hidden transition-colors duration-500">
          {/* Background ambient lighting */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[450px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

          {/* Unified Top Header Bar for 3D View (Back Button + Switcher Pill) */}
          <div className="z-30 w-full max-w-5xl mx-auto flex items-center justify-between px-2.5 sm:px-4 pt-1 pb-0.5 shrink-0">
            {/* Mobile-Optimized Go Back Button */}
            <Link
              href="/"
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-[#09150e]/95 hover:bg-stone-900 border border-yellow-500/40 hover:border-yellow-400 text-yellow-300 hover:text-white backdrop-blur-xl text-[11px] sm:text-xs font-bold shadow-2xl transition-all active:scale-95 font-sans cursor-pointer"
              title="Go Back to All Shops"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
              <span className="hidden sm:inline">All Shops</span>
              <span className="sm:hidden font-semibold">Back</span>
            </Link>

            {/* Top Floating View Mode Switcher Pill */}
            <div className="bg-[#09150e]/95 border border-yellow-500/40 p-0.5 sm:p-1 rounded-full backdrop-blur-xl shadow-2xl flex items-center gap-0.5 sm:gap-1 font-sans text-xs">
              <button
                type="button"
                onClick={() => setViewMode("book")}
                className="flex items-center gap-1 px-2.5 sm:px-4 py-1 rounded-full font-black bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-stone-950 shadow-md transition-all cursor-pointer text-[10.5px] sm:text-xs"
              >
                <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>3D Flipbook</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className="flex items-center gap-1 px-2.5 sm:px-4 py-1 rounded-full font-bold text-stone-300 hover:text-yellow-200 transition-all cursor-pointer text-[10.5px] sm:text-xs"
              >
                <LayoutGrid className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>4D Grid</span>
              </button>
            </div>
          </div>

          {/* 3D Book Stage - Enlarged on Mobile to fully utilize top & bottom vertical space */}
          <div className="flex-1 flex items-center justify-center my-auto w-full max-w-full sm:max-w-5xl mx-auto overflow-hidden px-1 sm:px-2">
            <div className="relative flex items-center justify-center w-full max-w-full">
              <div className="book-wrapper-shadow rounded-2xl max-w-full">
                {/* HTMLFlipBook Component with Robust Mobile Folding & Gestures */}
                <HTMLFlipBook
                  key={`${currentShop.id}-${isMobile ? "mob" : "desk"}`}
                  ref={bookRef}
                  width={isMobile ? 410 : 450}
                  height={isMobile ? 720 : 610}
                  size="stretch"
                  minWidth={isMobile ? 330 : 280}
                  maxWidth={isMobile ? 500 : 500}
                  minHeight={isMobile ? 620 : 400}
                  maxHeight={isMobile ? 860 : 650}
                  maxShadowOpacity={0.5}
                  showCover={true}
                  mobileScrollSupport={true}
                  clickEventForward={true}
                  swipeDistance={20}
                  flippingTime={500}
                  usePortrait={isMobile}
                  startPage={0}
                  drawShadow={true}
                  useMouseEvents={true}
                  autoSize={true}
                  onFlip={onPageFlip}
                  className="rounded-2xl overflow-hidden touch-manipulation"
                  style={{ margin: "0 auto" }}
                >
                  {generatedPages.map((pageDef, idx) => {
                    if (pageDef.type === "cover") {
                      return <CoverStartPage key={`cover-${idx}`} shop={currentShop} />;
                    }
                    if (pageDef.type === "back") {
                      return (
                        <BackContactPage
                          key={`back-${idx}`}
                          shop={currentShop}
                          onReopen={() => handleJumpToCategory(0)}
                        />
                      );
                    }
                    return (
                      <CategoryPage
                        key={`cat-page-${idx}`}
                        category={pageDef.category!}
                        items={pageDef.items || []}
                        pageNumber={pageDef.pageNumber || idx + 1}
                        shopName={currentShop.name}
                        isRightPage={idx % 2 !== 0}
                      />
                    );
                  })}
                </HTMLFlipBook>
              </div>
            </div>
          </div>

          {/* Catchy Bottom Book Controls */}
          <div className="shrink-0 pb-3 sm:pb-1 w-full max-w-full px-2 sm:px-4">
            <BookControls
              currentPage={currentPage}
              totalPages={totalPages}
              onNext={handleNext}
              onPrev={handlePrev}
              onJumpToCategory={handleJumpToCategory}
              categories={currentShop.categories as any}
              isMobile={isMobile}
              pageDefinitions={generatedPages}
            />

            {/* Mobile Layout Only: Developer Website & Contact Us Bar */}
            {isMobile && (
              <div className="mt-2 pt-1.5 pb-1 border border-yellow-500/20 bg-stone-950/70 rounded-lg backdrop-blur-md flex items-center justify-between px-3 text-[10.5px] text-stone-300 font-sans select-none shadow-md">
                <div className="flex items-center gap-1.5">
                  <span className="text-yellow-400 font-bold">Developer:</span>
                  <a
                    href="https://digitalmenustudio.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stone-200 hover:text-yellow-300 underline font-medium"
                  >
                    Website
                  </a>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-stone-400">Contact:</span>
                  <a
                    href="tel:+919876543210"
                    className="font-bold text-yellow-300 hover:text-white bg-stone-900/90 px-2 py-0.5 rounded border border-yellow-500/30"
                  >
                    +91 98765 43210
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
