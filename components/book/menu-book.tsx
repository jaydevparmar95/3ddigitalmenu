"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useShop } from "@/context/shop-context";
import { Shop, ShopMenuItem, ShopCategory } from "@/types/shop";
import {
  CoverStartPage,
  CategoryPage,
  BackContactPage,
} from "@/components/book/book-page";
import { BookControls, TopBarNav } from "@/components/book/book-controls";

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
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

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

    // Record real-time unique visitor count in MySQL (Deduplicated per browser)
    if (currentShop?.id) {
      let visitorId = "";
      try {
        visitorId = localStorage.getItem("digital_menu_browser_visitor_id") || "";
        if (!visitorId) {
          visitorId = `vid_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
          localStorage.setItem("digital_menu_browser_visitor_id", visitorId);
        }
      } catch { }

      const localKey = `visited_shop_${currentShop.id}`;
      if (!localStorage.getItem(localKey)) {
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
            }
          })
          .catch(() => { });
      }
    }

    return () => window.removeEventListener("resize", checkViewport);
  }, [currentShop?.id]);

  // Keyboard navigation
  useEffect(() => {
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
  }, []);

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

    // Final Page: Shop-Specific Back Contact Page
    pages.push({
      type: "back",
      title: "Orders & Info",
      pageNumber: runningPageNumber,
    });

    // Ensure total pages is even for clean 2-page spreads
    if (pages.length % 2 !== 0) {
      const last = pages.pop()!;
      pages.push({
        type: "category",
        category: {
          id: "chef-note",
          name: "Chef's Special Note",
          description: currentShop.tagline,
        },
        items: [],
        title: "Chef's Note",
        pageNumber: runningPageNumber++,
      });
      pages.push(last);
    }

    return pages;
  }, [currentShop]);

  const totalPages = generatedPages.length;

  const handleNext = () => {
    bookRef.current?.pageFlip()?.flipNext();
  };

  const handlePrev = () => {
    bookRef.current?.pageFlip()?.flipPrev();
  };

  const handleJumpToCategory = (targetIndex: number) => {
    if (isMobile) {
      bookRef.current?.pageFlip()?.flip(targetIndex);
    } else {
      const pageTarget = targetIndex * 2;
      bookRef.current?.pageFlip()?.flip(pageTarget);
    }
  };

  const onPageFlip = (e: any) => {
    if (typeof e?.data === "number") {
      setCurrentPage(e.data);
    }
  };

  if (!isLoaded || !mounted) {
    return (
      <div className="h-screen w-screen pizzeria-ambient flex items-center justify-center text-yellow-300 font-serif">
        <span>Opening {currentShop?.name || "Digital Menu"}...</span>
      </div>
    );
  }

  return (
    <div className={`h-screen max-h-screen w-screen pizzeria-ambient theme-${currentShop.theme || "emerald"} flex flex-col justify-between py-2 sm:py-3 px-1.5 sm:px-4 relative overflow-hidden transition-colors duration-500`}>
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[450px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Bar Navigation (Clean with Admin button only) */}
      {/* <TopBarNav currentView="menu" /> */}

      {/* 3D Book Stage - 1 Page Full-Screen on Mobile, 2-Page Spread on Desktop */}
      <div className="flex-1 flex items-center justify-center my-auto w-full max-w-5xl mx-auto overflow-hidden px-1 sm:px-2">
        <div className="relative flex items-center justify-center w-full max-w-full">
          <div className="book-wrapper-shadow rounded-2xl max-w-full">
            {/* HTMLFlipBook Component */}
            <HTMLFlipBook
              key={`${currentShop.id}-${isMobile ? "mob" : "desk"}`}
              ref={bookRef}
              width={isMobile ? 350 : 450}
              height={isMobile ? 540 : 610}
              size="stretch"
              minWidth={isMobile ? 280 : 280}
              maxWidth={isMobile ? 420 : 500}
              minHeight={isMobile ? 440 : 400}
              maxHeight={isMobile ? 620 : 650}
              maxShadowOpacity={0.6}
              showCover={false}
              mobileScrollSupport={false}
              flippingTime={600}
              usePortrait={isMobile}
              startPage={0}
              drawShadow={true}
              useMouseEvents={true}
              onFlip={onPageFlip}
              className="rounded-2xl overflow-hidden"
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
      <div className="shrink-0 pb-1 w-full max-w-full">
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
      </div>
    </div>
  );
}
