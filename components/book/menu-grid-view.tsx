"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Shop, ShopMenuItem, ShopCategory } from "@/types/shop";
import { FoodTypeBadge } from "@/components/book/book-page";
import { Food4DInteractiveCanvas } from "@/components/book/food-4d-interactive-canvas";
import { Modal } from "@/components/ui/modal";
import {
  Search,
  Phone,
  Clock,
  Flame,
  Star,
  Utensils,
  Sparkles,
  ChevronUp,
  MessageCircle,
  Eye,
} from "lucide-react";

interface MenuGridViewProps {
  shop: Shop;
}

export function MenuGridView({ shop }: MenuGridViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dietaryFilter, setDietaryFilter] = useState<"all" | "veg" | "non-veg">("all");
  const [bestsellerOnly, setBestsellerOnly] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [inspectedItem, setInspectedItem] = useState<ShopMenuItem | null>(null);

  // Monitor scroll for Back to Top button (throttled to 100ms)
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          setShowScrollTop(window.scrollY > 300);
          ticking = false;
        });
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(catId);
    if (catId === "all") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const el = document.getElementById(`cat-section-${catId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // Filter items based on search, category, veg/non-veg, and bestsellers
  const filteredItems = useMemo(() => {
    return shop.items.filter((item) => {
      // Category filter (used when not in full category view)
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }

      // Dietary filter
      if (dietaryFilter === "veg" && !item.isVeg) return false;
      if (dietaryFilter === "non-veg" && item.isVeg) return false;

      // Bestseller filter
      if (bestsellerOnly && !item.isBestseller) return false;

      // Search filter (name or description)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        return matchName || matchDesc;
      }

      return true;
    });
  }, [shop.items, selectedCategory, dietaryFilter, bestsellerOnly, searchQuery]);

  // Group items by categories when "all" is selected and no search
  const categoriesWithItems = useMemo(() => {
    if (searchQuery.trim() || dietaryFilter !== "all" || bestsellerOnly) {
      return null;
    }

    return shop.categories
      .map((cat) => ({
        category: cat,
        items: shop.items.filter((item) => item.category === cat.id),
      }))
      .filter((group) => group.items.length > 0);
  }, [shop.categories, shop.items, searchQuery, dietaryFilter, bestsellerOnly]);

  return (
    <div className={`min-h-screen w-full pizzeria-ambient theme-${shop.theme || "emerald"} text-[#f7f2ea] font-sans pb-24 touch-pan-y`}>
      {/* Top Ambient Light Flare */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-yellow-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Restaurant Hero Banner (Compact) */}
      <header className="relative border-b border-yellow-500/20 bg-[#08130d]/80 backdrop-blur-md pt-3.5 sm:pt-5 pb-3.5 sm:pb-4 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="space-y-1">
              <div className="flex items-center flex-wrap gap-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-[10px] font-bold font-sans">
                  {shop.cuisineType}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-stone-900 border border-stone-700 text-stone-300 text-[10px] font-sans">
                  Est. {shop.establishedYear || "2021"}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black font-sans flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Interactive 4D Menu Enabled</span>
                </span>
              </div>

              <h1 className="text-xl sm:text-3xl font-black text-yellow-200 font-serif tracking-tight">
                {shop.name}
              </h1>

              <p className="text-[11px] sm:text-xs text-yellow-100/80 font-medium">
                {shop.tagline}
              </p>
            </div>

            {/* Quick Contact & Timings Pill */}
            <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-1.5 text-xs text-stone-300">
              <a
                href={`tel:${shop.phone}`}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-900/90 border border-yellow-500/30 text-yellow-300 hover:text-white transition-colors text-xs"
              >
                <Phone className="w-3 h-3 text-yellow-400" />
                <span className="font-bold">{shop.phone}</span>
              </a>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-900/90 border border-stone-800 text-stone-300 text-[10px]">
                <Clock className="w-3 h-3 text-yellow-400" />
                <span>{shop.timings}</span>
              </div>
            </div>
          </div>

          {/* 3 Quality Highlights */}
          {shop.features && shop.features.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-yellow-500/15">
              {shop.features.map((feat, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-yellow-500/10 border border-yellow-500/25 text-yellow-200 text-[10px] font-medium"
                >
                  <Sparkles className="w-2.5 h-2.5 text-yellow-400" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 space-y-5">
        {/* Sticky Search & Filter Toolbar */}
        <div className="sticky top-12 sm:top-14 z-30 bg-[#09150e]/95 border border-yellow-500/30 rounded-xl p-2.5 sm:p-3.5 backdrop-blur-xl shadow-2xl space-y-2.5">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-yellow-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dishes by name or ingredients..."
                className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-stone-900/90 border border-yellow-500/30 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-yellow-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-stone-400 hover:text-white cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Dietary & Bestseller Toggles */}
            <div className="flex items-center flex-wrap gap-1.5">
              <div className="flex items-center bg-stone-900/90 p-0.5 rounded-lg border border-stone-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => setDietaryFilter("all")}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    dietaryFilter === "all"
                      ? "bg-yellow-500 text-stone-950 shadow-xs"
                      : "text-stone-400 hover:text-white"
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setDietaryFilter("veg")}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    dietaryFilter === "veg"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-stone-400 hover:text-emerald-400"
                  }`}
                >
                  <FoodTypeBadge isVeg={true} />
                  <span>Veg</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDietaryFilter("non-veg")}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    dietaryFilter === "non-veg"
                      ? "bg-red-700 text-white shadow-xs"
                      : "text-stone-400 hover:text-red-400"
                  }`}
                >
                  <FoodTypeBadge isVeg={false} />
                  <span>Non-Veg</span>
                </button>
              </div>

              {/* Bestseller Filter Button */}
              <button
                type="button"
                onClick={() => setBestsellerOnly(!bestsellerOnly)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                  bestsellerOnly
                    ? "bg-amber-500 text-stone-950 border-amber-400 shadow-xs"
                    : "bg-stone-900/90 border-stone-800 text-stone-300 hover:text-amber-300"
                }`}
              >
                <Star className={`w-3 h-3 ${bestsellerOnly ? "fill-stone-950" : "text-amber-400"}`} />
                <span>Bestsellers</span>
              </button>
            </div>
          </div>

          {/* Category Horizontal Scroll Pills (Click to Smooth Scroll) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar text-[11px]">
            <button
              type="button"
              onClick={() => handleCategoryClick("all")}
              className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                selectedCategory === "all"
                  ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-stone-950 shadow-md font-black"
                  : "bg-stone-900/80 border border-stone-800 text-stone-300 hover:text-yellow-200"
              }`}
            >
              All Categories ({shop.items.length})
            </button>

            {shop.categories.map((cat) => {
              const catCount = shop.items.filter((it) => it.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    selectedCategory === cat.id
                      ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-stone-950 shadow-md font-black"
                      : "bg-stone-900/80 border border-stone-800 text-stone-300 hover:text-yellow-200"
                  }`}
                >
                  {cat.name} ({catCount})
                </button>
              );
            })}
          </div>
        </div>

        {/* View Mode 1: Grouped by Category (when viewing all without search) */}
        {categoriesWithItems ? (
          <div className="space-y-8">
            {categoriesWithItems.map(({ category, items }) => (
              <section
                key={category.id}
                id={`cat-section-${category.id}`}
                className="space-y-3 scroll-mt-44 sm:scroll-mt-48"
              >
                <div className="flex items-center justify-between border-b border-yellow-500/20 pb-1.5">
                  <div className="space-y-0.5">
                    <h2 className="text-lg sm:text-xl font-black text-yellow-200 font-serif">
                      {category.name}
                    </h2>
                    {category.description && (
                      <p className="text-[11px] text-stone-400">{category.description}</p>
                    )}
                  </div>
                  <span className="text-[11px] text-yellow-300 font-bold bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">
                    {items.length} {items.length === 1 ? "Dish" : "Dishes"}
                  </span>
                </div>

                {/* Compact Grid: 2 columns on mobile, 3-6 columns on larger screens */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3.5">
                  {items.map((item) => (
                    <CompactDishCard
                      key={item.id}
                      item={item}
                      onInspect={() => setInspectedItem(item)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          /* View Mode 2: Filtered / Search Grid */
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] text-stone-400">
              <span>
                Showing <strong className="text-yellow-300">{filteredItems.length}</strong> dishes
              </span>
            </div>

            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3.5">
                {filteredItems.map((item) => (
                  <CompactDishCard
                    key={item.id}
                    item={item}
                    onInspect={() => setInspectedItem(item)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center space-y-2.5 bg-stone-900/40 border border-yellow-500/20 rounded-xl">
                <Utensils className="w-8 h-8 text-yellow-400/40 mx-auto" />
                <h3 className="text-sm font-bold text-yellow-200 font-serif">
                  No Dishes Found
                </h3>
                <p className="text-xs text-stone-400 max-w-xs mx-auto">
                  No items match your search or filter criteria. Try clearing search or resetting filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setDietaryFilter("all");
                    setBestsellerOnly(false);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-yellow-500 text-stone-950 text-xs font-bold cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={handleScrollToTop}
          className="fixed bottom-5 right-5 z-50 p-2.5 rounded-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-stone-950 shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer border border-yellow-200"
          title="Scroll back to top"
          aria-label="Scroll back to top"
        >
          <ChevronUp className="w-4 h-4 stroke-[3]" />
        </button>
      )}

      {/* 4D Dish Inspection & Culinary Studio Modal */}
      {inspectedItem && (
        <Modal
          isOpen={Boolean(inspectedItem)}
          onClose={() => setInspectedItem(null)}
          maxWidth="md"
        >
          <div className="space-y-4 pt-1">
            {/* Interactive 4D Stage in Modal */}
            <div className="rounded-2xl overflow-hidden border border-yellow-500/30 shadow-2xl">
              <Food4DInteractiveCanvas item={inspectedItem} />
            </div>

            {/* Dish Info Header */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <FoodTypeBadge isVeg={Boolean(inspectedItem.isVeg)} />
                    <span className="text-xs font-bold text-stone-300">
                      {inspectedItem.isVeg ? "100% Vegetarian" : "Non-Vegetarian Specialty"}
                    </span>
                    {inspectedItem.isBestseller && (
                      <span className="px-2 py-0.5 rounded bg-amber-500 text-stone-950 text-[10px] font-black">
                        ★ Bestseller
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-yellow-200 font-serif">
                    {inspectedItem.name}
                  </h3>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xl sm:text-2xl font-black text-yellow-400 font-serif">
                    ₹{inspectedItem.price}
                  </div>
                  <span className="text-[10px] text-stone-400">Taxes Included</span>
                </div>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed font-sans bg-stone-900/60 p-3 rounded-xl border border-stone-800">
                {inspectedItem.description}
              </p>
            </div>

            {/* Culinary Highlights Meter */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-stone-900/80 border border-yellow-500/15">
                <span className="text-[10px] text-stone-400 block">Freshness</span>
                <span className="text-xs font-bold text-emerald-400">100% Handcrafted</span>
              </div>
              <div className="p-2 rounded-lg bg-stone-900/80 border border-yellow-500/15">
                <span className="text-[10px] text-stone-400 block">Spice Level</span>
                <span className="text-xs font-bold text-amber-400">
                  {inspectedItem.isSpicy ? "🌶🌶 Spicy Kick" : "🌿 Mild & Savory"}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-stone-900/80 border border-yellow-500/15">
                <span className="text-[10px] text-stone-400 block">Preparation</span>
                <span className="text-xs font-bold text-yellow-300">Fresh To Order</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-yellow-500/20">
              <a
                href={`tel:${shop.phone}`}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-stone-950 font-black text-xs shadow-lg hover:scale-102 active:scale-98 transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>Call to Order (Table Inquiry)</span>
              </a>

              <button
                type="button"
                onClick={() => setInspectedItem(null)}
                className="px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-300 text-xs font-bold hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Compact, Sleek Dish Card Component with Interactive 4D Canvas Engine
function CompactDishCard({
  item,
  onInspect,
}: {
  item: ShopMenuItem;
  onInspect?: () => void;
}) {
  return (
    <div
      onClick={onInspect}
      className="group bg-[#0e1b13]/90 border border-yellow-500/25 hover:border-yellow-400/70 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between cursor-pointer active:scale-98"
    >
      {/* 4D Realistic Interactive Animated Food View */}
      <Food4DInteractiveCanvas item={item} onInspect={onInspect} />

      {/* Card Info (Compact Spacing & Fonts) */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between space-y-2">
        <div className="space-y-0.5">
          <div className="flex items-start justify-between gap-1">
            <h4 className="text-xs sm:text-sm font-bold text-white font-serif group-hover:text-yellow-200 transition-colors line-clamp-1">
              {item.name}
            </h4>
            <Eye className="w-3 h-3 text-yellow-400/50 group-hover:text-yellow-300 shrink-0 mt-0.5 transition-colors" />
          </div>

          <p className="text-[10px] sm:text-[11px] text-stone-300/80 line-clamp-2 leading-tight font-sans">
            {item.description}
          </p>
        </div>

        {/* Price Row */}
        <div className="flex items-center justify-between pt-1.5 border-t border-yellow-500/15">
          <div className="text-xs sm:text-sm font-black text-yellow-300 font-serif">
            ₹{item.price}
          </div>

          <span className="text-[8.5px] sm:text-[9.5px] font-bold text-stone-400 font-sans truncate max-w-[70px] sm:max-w-none">
            {item.isVeg ? "Veg" : "Non-Veg"}
          </span>
        </div>
      </div>
    </div>
  );
}
