"use client";

import React from "react";
import Link from "next/link";
import { Category } from "@/types/menu";
import {
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Bookmark,
  Pizza,
} from "lucide-react";

export type BookTheme = "emerald" | "crimson" | "sapphire" | "terracotta";

interface BookControlsProps {
  currentPage: number;
  totalPages: number;
  onNext: () => void;
  onPrev: () => void;
  onJumpToCategory: (targetIndex: number) => void;
  categories: any[];
  isMobile: boolean;
  pageDefinitions?: Array<{
    type: string;
    title?: string;
    category?: any;
    pageNumber?: number;
  }>;
}

export function BookControls({
  currentPage,
  totalPages,
  onNext,
  onPrev,
  onJumpToCategory,
  categories,
  isMobile,
  pageDefinitions,
}: BookControlsProps) {
  const isFirst = currentPage === 0;
  const isLast = isMobile ? currentPage >= totalPages - 1 : currentPage >= totalPages - 2;

  const currentSpread = Math.floor(currentPage / 2);

  const getTitle = () => {
    if (pageDefinitions && pageDefinitions[currentPage]) {
      if (isMobile) {
        return pageDefinitions[currentPage].title || `Page ${currentPage + 1}`;
      }
      const leftPage = pageDefinitions[currentSpread * 2];
      const rightPage = pageDefinitions[currentSpread * 2 + 1];
      if (leftPage && rightPage) {
        return `Pages ${currentSpread * 2 + 1} & ${currentSpread * 2 + 2} • ${leftPage.title || ""} & ${rightPage.title || ""}`;
      }
    }
    if (isMobile) {
      return `Page ${currentPage + 1}`;
    }
    return `Pages ${currentPage + 1} & ${currentPage + 2}`;
  };

  const getSubtitle = () => {
    if (isMobile) {
      return `Page ${currentPage + 1} of ${totalPages} • Max 4 Items Per Page`;
    }
    return "2-Page Open Menu Spread • Max 4 Items Per Page";
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-1.5 pt-1 z-20 relative select-none px-2">
      {/* Bottom Bar: Prev / Next Buttons + Page Indicator */}
      <div className="flex items-center justify-between w-full bg-[#0d1612]/95 border border-yellow-500/40 rounded-xl p-1.5 sm:p-2 backdrop-blur-xl shadow-2xl">
        {/* Turn Prev Button */}
        <button
          type="button"
          onClick={onPrev}
          disabled={isFirst}
          className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-stone-900/80 hover:bg-stone-800 text-yellow-300 border border-yellow-500/30 text-xs font-bold transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer active:scale-95 shadow-sm font-sans shrink-0"
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Page Title & Indicator */}
        <div className="flex items-center gap-1.5 text-center min-w-0 px-1">
          <Bookmark className="w-3.5 h-3.5 text-yellow-400 hidden sm:block shrink-0" />
          <div className="space-y-0.5 min-w-0">
            <div className="font-bold text-[11px] sm:text-xs text-yellow-200 font-serif truncate max-w-[280px] sm:max-w-md">
              {getTitle()}
            </div>
            <div className="text-[8.5px] sm:text-[9.5px] text-yellow-300/80 font-medium font-sans">
              {getSubtitle()}
            </div>
          </div>
        </div>

        {/* Turn Next Button */}
        <button
          type="button"
          onClick={onNext}
          disabled={isLast}
          className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-lg catchy-theme-btn text-xs font-bold transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-md font-sans shrink-0"
          aria-label="Next Page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Category Ribbon Jumper */}
      <div className="flex items-center gap-1 overflow-x-auto max-w-full py-0.5 px-0.5 custom-scrollbar text-xs">
        {isMobile ? (
          <>
            <button
              onClick={() => onJumpToCategory(0)}
              className={`px-2.5 py-1 rounded-md border text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer font-serif shrink-0 ${currentPage === 0
                ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-stone-950 border-yellow-300 shadow-xs"
                : "bg-stone-950/80 border-yellow-500/20 text-yellow-100/80 hover:text-yellow-300"
                }`}
            >
              Cover
            </button>
            {pageDefinitions?.slice(1, -1).map((pageDef, idx) => (
              <button
                key={`mob-btn-${idx}`}
                onClick={() => onJumpToCategory(idx + 1)}
                className={`px-2.5 py-1 rounded-md border text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer font-serif shrink-0 ${currentPage === idx + 1
                  ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-stone-950 border-yellow-300 shadow-xs"
                  : "bg-stone-950/80 border-yellow-500/20 text-yellow-100/80 hover:text-yellow-300"
                  }`}
              >
                {pageDef.title || `Page ${idx + 2}`}
              </button>
            ))}
            <button
              onClick={() => onJumpToCategory(totalPages - 1)}
              className={`px-2.5 py-1 rounded-md border text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer font-serif shrink-0 ${currentPage === totalPages - 1
                ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-stone-950 border-yellow-300 shadow-xs"
                : "bg-stone-950/80 border-yellow-500/20 text-yellow-100/80 hover:text-yellow-300"
                }`}
            >
              Contact
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onJumpToCategory(0)}
              className={`px-3 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer font-serif ${currentSpread === 0
                ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-stone-950 border-yellow-300 shadow-sm"
                : "bg-stone-950/80 border-yellow-500/20 text-yellow-100/80 hover:text-yellow-300 hover:border-yellow-500/50"
                }`}
            >
              Cover & Starters
            </button>

            <button
              onClick={() => onJumpToCategory(1)}
              className={`px-3 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer font-serif ${currentSpread === 1
                ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-stone-950 border-yellow-300 shadow-sm"
                : "bg-stone-950/80 border-yellow-500/20 text-yellow-100/80 hover:text-yellow-300 hover:border-yellow-500/50"
                }`}
            >
              Veg Pizzas
            </button>

            <button
              onClick={() => onJumpToCategory(2)}
              className={`px-3 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer font-serif ${currentSpread === 2
                ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-stone-950 border-yellow-300 shadow-sm"
                : "bg-stone-950/80 border-yellow-500/20 text-yellow-100/80 hover:text-yellow-300 hover:border-yellow-500/50"
                }`}
            >
              Non-Veg & Pastas
            </button>

            <button
              onClick={() => onJumpToCategory(3)}
              className={`px-3 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer font-serif ${currentSpread === 3
                ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-stone-950 border-yellow-300 shadow-sm"
                : "bg-stone-950/80 border-yellow-500/20 text-yellow-100/80 hover:text-yellow-300 hover:border-yellow-500/50"
                }`}
            >
              Desserts & Info
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function TopBarNav({
  currentView = "menu",
}: {
  currentView?: "menu" | "admin";
}) {
  return (
    <div className="fixed top-2.5 right-2.5 sm:top-3 sm:right-3 z-50 flex items-center gap-2">
      {currentView === "menu" ? (
        <Link
          href="/admin"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-950/90 border border-yellow-500/40 text-yellow-200 hover:text-white hover:border-yellow-400 backdrop-blur-xl text-xs font-bold shadow-xl transition-all active:scale-95 font-sans"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-yellow-400" />
          <span>Admin</span>
        </Link>
      ) : (
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-stone-950 border border-yellow-200 text-xs font-black backdrop-blur-xl shadow-xl transition-all font-sans"
        >
          <Pizza className="w-3.5 h-3.5" />
          <span>3D Menu</span>
        </Link>
      )}
    </div>
  );
}
