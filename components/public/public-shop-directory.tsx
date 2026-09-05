"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Shop } from "@/types/shop";
import {
  Store,
  BookOpen,
  Sparkles,
  Phone,
  Clock,
  Search,
  Lock,
  Utensils,
  Eye,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

interface PublicShopDirectoryProps {
  initialShops: Shop[];
}

const DEFAULT_COVER_BY_SHOP: Record<string, string> = {
  "pizza-world": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
  "royal-chinese": "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80",
  "royal-chinese2": "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80",
  "mumbai-vadapav": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
  "delhi-pakodi": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
};

export function PublicShopDirectory({ initialShops }: PublicShopDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const SHOPS_PER_PAGE = 6;

  // Only display non-archived shops publicly
  const activeShops = useMemo(() => {
    return initialShops.filter((s) => !s.isDeleted);
  }, [initialShops]);

  // Filter shops by search query
  const filteredShops = useMemo(() => {
    if (!searchQuery.trim()) return activeShops;
    const q = searchQuery.toLowerCase().trim();
    return activeShops.filter((s) => {
      const matchName = s.name.toLowerCase().includes(q);
      const matchCuisine = s.cuisineType.toLowerCase().includes(q);
      const matchTagline = (s.tagline || "").toLowerCase().includes(q);
      const matchPhone = (s.phone || "").toLowerCase().includes(q);
      const matchOwner = (s.ownerName || "").toLowerCase().includes(q);
      return matchName || matchCuisine || matchTagline || matchPhone || matchOwner;
    });
  }, [activeShops, searchQuery]);

  // Reset page when search query changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredShops.length / SHOPS_PER_PAGE));
  const currentPageClamped = Math.min(page, totalPages);
  const paginatedShops = useMemo(() => {
    const start = (currentPageClamped - 1) * SHOPS_PER_PAGE;
    return filteredShops.slice(start, start + SHOPS_PER_PAGE);
  }, [filteredShops, currentPageClamped, SHOPS_PER_PAGE]);

  // Visual theme styling helper
  const getThemeGradients = (theme: string) => {
    switch (theme) {
      case "amber":
        return {
          cardBg: "from-[#1a0f08] via-[#120804] to-[#0a0402]",
          border: "border-amber-500/30 hover:border-amber-400/70",
          accent: "text-amber-300",
          badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        };
      case "ruby":
        return {
          cardBg: "from-[#1f0a0d] via-[#140608] to-[#0a0304]",
          border: "border-red-500/30 hover:border-red-400/70",
          accent: "text-red-300",
          badge: "bg-red-500/20 text-red-300 border-red-500/30",
        };
      case "emerald":
      default:
        return {
          cardBg: "from-[#0a1a11] via-[#06120b] to-[#030906]",
          border: "border-emerald-500/30 hover:border-yellow-400/70",
          accent: "text-yellow-300",
          badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        };
    }
  };

  // Safe cover image helper
  const getShopCover = (shop: Shop) => {
    if (DEFAULT_COVER_BY_SHOP[shop.id]) {
      return DEFAULT_COVER_BY_SHOP[shop.id];
    }
    const itemWithValidImg = shop.items.find(
      (i) => i.image && i.image.startsWith("http") && !i.image.includes("vegecravings.com")
    );
    return (
      itemWithValidImg?.image ||
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80"
    );
  };

  return (
    <div className="min-h-screen bg-[#070302] text-[#f7f2ea] font-sans relative overflow-x-hidden selection:bg-amber-500 selection:text-stone-950">
      {/* Background Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-yellow-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-[500px] h-[400px] bg-orange-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0c0604]/90 backdrop-blur-md border-b border-orange-500/20 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-400 via-amber-400 to-yellow-500 text-stone-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
              <Store className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-black text-amber-200 font-serif tracking-tight block leading-tight">
                Digital Menu Studio
              </span>
              <span className="text-[10px] text-stone-400 hidden sm:block">
                Interactive 3D & 4D Restaurant Directory
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative px-4 sm:px-8 pt-8 sm:pt-12 pb-6 text-center max-w-4xl mx-auto space-y-3.5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold font-sans">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Next-Gen Interactive Dining Menus</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-200 to-yellow-400 font-serif tracking-tight leading-tight">
          Explore Registered Shops
        </h1>

        <p className="text-xs sm:text-sm text-stone-300/90 max-w-2xl mx-auto font-normal leading-relaxed">
          Select any registered restaurant below to experience their **Ultra-Realistic 3D Flipbook Menu** or **Sensory 4D Grid View** with real-time food parallax and steam simulation.
        </p>

        {/* Search Bar */}
        <div className="pt-2 max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by restaurant name, cuisine, or specialty..."
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl bg-stone-900/90 border border-orange-500/30 focus:border-amber-400 text-xs sm:text-sm text-stone-100 placeholder:text-stone-500 shadow-xl outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-white cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Registered Shops Cards Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pb-16 space-y-6">
        <div className="flex items-center justify-between border-b border-orange-500/20 pb-3">
          <h2 className="text-sm sm:text-base font-bold text-amber-200 font-serif flex items-center gap-2">
            <Store className="w-4 h-4 text-amber-400" />
            <span>Featured Dining Establishments ({filteredShops.length})</span>
          </h2>
          <span className="text-xs text-stone-400 font-sans">
            Page {currentPageClamped} of {totalPages}
          </span>
        </div>

        {paginatedShops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {paginatedShops.map((shop) => {
              const themeStyle = getThemeGradients(shop.theme || "emerald");
              const coverImage = getShopCover(shop);

              return (
                <div
                  key={shop.id}
                  className={`group relative rounded-3xl bg-gradient-to-b ${themeStyle.cardBg} border ${themeStyle.border} shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden`}
                >
                  {/* Card Header Media */}
                  <div className="relative aspect-[16/9] w-full bg-stone-950 overflow-hidden">
                    <Image
                      src={coverImage}
                      alt={shop.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      priority={paginatedShops.indexOf(shop) < 3}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0402] via-[#0a0402]/40 to-transparent" />

                    {/* Top Floating Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border backdrop-blur-md shadow-md ${themeStyle.badge}`}>
                        {shop.cuisineType}
                      </span>

                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-950/80 border border-yellow-400/40 text-yellow-300 text-[10px] font-bold backdrop-blur-md shadow-md">
                        <Eye className="w-3 h-3 text-yellow-400" />
                        <span>{shop.visitorsCount || 0} Visitors</span>
                      </span>
                    </div>

                    {/* Established Badge */}
                    <div className="absolute bottom-2 left-3 text-[11px] text-stone-300 font-sans">
                      Est. {shop.establishedYear || "2021"} • {shop.ownerName || "Master Chef"}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-xl sm:text-2xl font-black text-amber-100 font-serif tracking-tight group-hover:text-yellow-200 transition-colors">
                        {shop.name}
                      </h3>

                      <p className="text-xs text-stone-300/80 line-clamp-2 leading-relaxed">
                        {shop.tagline}
                      </p>

                      {/* Timings & Contact */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-400 pt-1">
                        <div className="flex items-center gap-1 bg-stone-900/90 px-2 py-0.5 rounded-lg border border-stone-800">
                          <Clock className="w-3 h-3 text-yellow-400" />
                          <span>{shop.timings}</span>
                        </div>
                        <a
                          href={`tel:${shop.phone}`}
                          className="flex items-center gap-1 bg-stone-900/90 px-2 py-0.5 rounded-lg border border-stone-800 text-yellow-300 hover:text-white transition-colors"
                        >
                          <Phone className="w-3 h-3 text-yellow-400" />
                          <span>{shop.phone}</span>
                        </a>
                      </div>

                      {/* Quality Highlights */}
                      {shop.features && shop.features.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {shop.features.slice(0, 3).map((feat, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-stone-900/80 border border-stone-800 text-stone-300"
                            >
                              ✦ {feat}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2 border-t border-orange-500/20">
                      {/* Primary Action: 3D Flipbook */}
                      <Link
                        href={`/menu/${shop.id}`}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-stone-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-98"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Open 3D Flipbook Menu</span>
                        <ChevronRight className="w-4 h-4 stroke-[3]" />
                      </Link>

                      {/* Secondary Action: 4D Grid View */}
                      <Link
                        href={`/menu/${shop.id}?view=grid`}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-800 hover:border-amber-400/50 text-amber-200 hover:text-white font-bold text-xs transition-all active:scale-98"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                        <span>Open 4D Grid View ({shop.items.length} Dishes)</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center space-y-3 bg-stone-900/40 border border-orange-500/20 rounded-2xl max-w-md mx-auto">
            <Utensils className="w-8 h-8 text-amber-400/50 mx-auto" />
            <h3 className="text-sm font-bold text-amber-200 font-serif">
              No Registered Shops Found
            </h3>
            <p className="text-xs text-stone-400">
              No dining establishments match your search criteria.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold cursor-pointer"
            >
              Reset Search
            </button>
          </div>
        )}

        {/* Public Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-orange-500/20">
            <div className="text-xs text-stone-400">
              Showing <strong className="text-amber-300">{(currentPageClamped - 1) * SHOPS_PER_PAGE + 1}</strong> to{" "}
              <strong className="text-amber-300">
                {Math.min(currentPageClamped * SHOPS_PER_PAGE, filteredShops.length)}
              </strong>{" "}
              of <strong className="text-amber-300">{filteredShops.length}</strong> shops
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPageClamped === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-900/90 border border-stone-800 text-stone-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${currentPageClamped === pageNum
                    ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-stone-950 shadow-md font-black"
                    : "bg-stone-900/80 border border-stone-800 text-stone-400 hover:text-white"
                    }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPageClamped === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-900/90 border border-stone-800 text-stone-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
