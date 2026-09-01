"use client";

import React, { forwardRef, useState } from "react";
import Image from "next/image";
import { MenuItem, Category } from "@/types/menu";
import { Shop, ShopMenuItem, ShopCategory } from "@/types/shop";
import { formatCurrency } from "@/lib/utils";
import { Pizza, Award, UtensilsCrossed } from "lucide-react";

// Safe HD Image component with 3D hover animation and fallback
function SafeDishImage({ src, alt }: { src: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(
    src ? (src.includes("?") ? `${src}&w=400&q=90` : `${src}?auto=format&fit=crop&w=400&q=90`) : "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=90"
  );
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden shrink-0 border border-stone-300 shadow-2xs bg-stone-100 mt-0.5 group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] group-hover:scale-110 group-hover:-rotate-1 transition-all duration-300 ease-out">
      <Image
        src={hasError ? "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=90" : imgSrc}
        alt={alt}
        fill
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-115"
        sizes="40px"
        quality={90}
        onError={() => {
          setHasError(true);
          setImgSrc("https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=90");
        }}
      />
    </div>
  );
}

// Standard Indian Food Regulatory Symbols: Veg (Green) & Non-Veg (Red)
export function FoodTypeBadge({ isVeg }: { isVeg: boolean }) {
  if (isVeg) {
    return (
      <span
        className="inline-flex items-center justify-center w-3 h-3 rounded-xs border border-emerald-600 bg-white p-0.5 shrink-0 group-hover:scale-110 transition-transform duration-200"
        title="100% Vegetarian"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center w-3 h-3 rounded-xs border border-red-700 bg-white p-0.5 shrink-0 group-hover:scale-110 transition-transform duration-200"
      title="Non-Vegetarian"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-red-700" />
    </span>
  );
}

// 1. FRONT COVER PAGE (Dynamic Shop-Wise Cover in Title Case)
export const CoverStartPage = forwardRef<
  HTMLDivElement,
  { shop?: Shop; style?: React.CSSProperties }
>(({ shop, style }, ref) => {
  const shopName = shop?.name || "Pizza World";
  const tagline = shop?.tagline || "Artisanal Woodfired Kitchen";
  const estYear = shop?.establishedYear || "2021";
  const features = shop?.features && shop.features.length > 0
    ? shop.features
    : [
        "48-Hour Slow Fermented Sourdough",
        "100% Real Dairy Mozzarella",
        "Stone Baked Hot at 450°C",
      ];

  return (
    <div
      ref={ref}
      style={style}
      data-density="soft"
      className="w-full h-full menu-parchment p-2 sm:p-2.5 flex flex-col select-none relative overflow-hidden rounded-2xl"
    >
      {/* Spine crease shadow on right edge of left page */}
      <div className="absolute top-0 right-0 bottom-0 w-6 spine-crease-right pointer-events-none z-20" />

      {/* Outer Border Box */}
      <div className="w-full h-full border-2 border-stone-600/80 rounded-xl p-1 flex flex-col justify-between">
        {/* Inner Hairline Border Box with Corner Rosettes */}
        <div className="w-full h-full border border-amber-600/50 rounded-lg p-3 sm:p-4 flex flex-col justify-between relative overflow-hidden">
          {/* Corner Rosettes */}
          <div className="absolute top-1.5 left-1.5 text-amber-700/60 text-[9px] pointer-events-none">❖</div>
          <div className="absolute top-1.5 right-1.5 text-amber-700/60 text-[9px] pointer-events-none">❖</div>
          <div className="absolute bottom-1.5 left-1.5 text-amber-700/60 text-[9px] pointer-events-none">❖</div>
          <div className="absolute bottom-1.5 right-1.5 text-amber-700/60 text-[9px] pointer-events-none">❖</div>

          {/* Top Header Badge in Title Case */}
          <div className="text-center pt-0.5 relative z-10 shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 border border-amber-600/30 text-amber-900 text-[9px] font-bold font-sans tracking-wide shadow-2xs">
              <Award className="w-3 h-3 text-amber-700" />
              <span>Est. {estYear} • Handcrafted Daily</span>
            </div>
          </div>

          {/* Centerpiece Crest & Brand Identity */}
          <div className="text-center space-y-2 my-auto relative z-10 px-1">
            {/* Golden Shop Emblem */}
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 mx-auto group cursor-pointer">
              <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-md group-hover:scale-125 transition-transform duration-500" />
              <div className="relative w-full h-full rounded-full border-2 border-amber-600/70 flex items-center justify-center bg-gradient-to-b from-amber-50 to-stone-100 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Pizza className="w-7 h-7 sm:w-8 sm:h-8 text-amber-700 drop-shadow-2xs" />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-0.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#0f172a] font-serif leading-none">
                {shopName}
              </h1>
              <p className="text-[10px] sm:text-[11px] text-stone-600 font-bold font-sans tracking-wide">
                {tagline}
              </p>
            </div>

            {/* Decorative Divider */}
            <div className="flex items-center justify-center gap-2 max-w-[140px] mx-auto py-0.5">
              <div className="h-px bg-amber-600/40 flex-1" />
              <span className="text-amber-700 text-[9px]">❖</span>
              <div className="h-px bg-amber-600/40 flex-1" />
            </div>

            {/* 3 Quality Highlights */}
            <div className="space-y-0.5 text-[9.5px] sm:text-[10px] text-stone-700 font-medium font-sans max-w-xs mx-auto">
              {features.slice(0, 3).map((f, i) => (
                <div key={i} className="flex items-center justify-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-amber-600" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Food Regulatory Legend & Tagline */}
          <div className="relative z-10 pb-0.5 border-t border-stone-200 pt-1 flex flex-col items-center gap-0.5 shrink-0">
            <div className="flex items-center justify-center gap-4 text-[9px] font-semibold text-stone-700 font-sans">
              <div className="flex items-center gap-1">
                <FoodTypeBadge isVeg={true} />
                <span>100% Vegetarian</span>
              </div>
              <div className="flex items-center gap-1">
                <FoodTypeBadge isVeg={false} />
                <span>Non-Vegetarian</span>
              </div>
            </div>
            <span className="text-[8px] text-stone-400 font-sans">
              Dine-In • Takeaway • Fast Delivery
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
CoverStartPage.displayName = "CoverStartPage";

// 2. CATEGORY DISHES PAGE (Clean Title Case, Structurally Contained Inside Border)
export const CategoryPage = forwardRef<
  HTMLDivElement,
  {
    category: Category | ShopCategory;
    items: MenuItem[] | ShopMenuItem[];
    pageNumber: number;
    shopName?: string;
    isRightPage?: boolean;
    style?: React.CSSProperties;
  }
>(({ category, items, pageNumber, shopName = "Pizza World", isRightPage = true, style }, ref) => {
  return (
    <div
      ref={ref}
      style={style}
      data-density="soft"
      className="w-full h-full menu-parchment p-2 sm:p-2.5 flex flex-col select-none relative overflow-hidden rounded-2xl"
    >
      {/* Spine crease shadow */}
      <div
        className={`absolute top-0 bottom-0 w-6 pointer-events-none z-20 ${
          isRightPage ? "left-0 spine-crease-left" : "right-0 spine-crease-right"
        }`}
      />

      {/* Outer Border Box */}
      <div className="w-full h-full border-2 border-stone-400/80 rounded-xl p-1 flex flex-col justify-between">
        {/* Inner Hairline Border Box */}
        <div className="w-full h-full border border-stone-300/70 rounded-lg p-2 sm:p-2.5 flex flex-col justify-between overflow-hidden">
          {/* Clean Category Header in Title Case */}
          <div className="text-center pb-1 border-b border-stone-200 shrink-0">
            <h2 className="text-xs sm:text-sm font-black tracking-wide text-[#0f172a] font-serif leading-tight">
              {category.name}
            </h2>
            <div className="w-8 h-0.5 bg-amber-600/50 mx-auto mt-0.5 rounded-full" />
          </div>

          {/* Dish Listings: Guaranteed Max 4 Items Inside Border */}
          <div className="flex-1 flex flex-col justify-evenly py-0.5 gap-0.5 min-h-0">
            {items.map((item) => (
              <div
                key={item.id}
                className="group flex items-start gap-2 p-1 rounded-lg transition-all duration-300 ease-out cursor-pointer hover:bg-amber-500/10 hover:shadow-xs border border-transparent hover:border-amber-400/30"
              >
                {/* Highlighted Dish Photography Thumbnail */}
                {item.image && (
                  <SafeDishImage src={item.image} alt={item.name} />
                )}

                {/* Dish Info Column */}
                <div className="flex-1 min-w-0 space-y-0.2">
                  {/* Title + Price Row */}
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex items-start gap-1 flex-1 min-w-0">
                      <div className="pt-0.5">
                        <FoodTypeBadge isVeg={item.isVeg} />
                      </div>
                      <span className="font-bold text-[10px] sm:text-[11px] text-[#0f172a] group-hover:text-emerald-800 transition-colors duration-200 font-serif leading-tight break-words">
                        {item.name}
                        {item.isBestseller && (
                          <span className="text-[7.5px] text-amber-600 font-bold font-sans ml-1 group-hover:scale-125 inline-block transition-transform duration-200" title="Bestseller">
                            ★
                          </span>
                        )}
                        {item.isSpicy && (
                          <span className="text-[7.5px] text-red-600 font-bold font-sans ml-1 group-hover:scale-125 inline-block transition-transform duration-200" title="Spicy">
                            🌶
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Price in Rupees */}
                    <span className="font-black text-[10.5px] sm:text-[11.5px] text-emerald-800 group-hover:text-emerald-950 group-hover:scale-105 shrink-0 font-sans pl-1 transition-all duration-200">
                      {formatCurrency(item.price)}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-[8.5px] sm:text-[9px] text-stone-500 group-hover:text-stone-700 leading-tight font-sans line-clamp-2 pl-3.5 transition-colors duration-200">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="py-4 text-center text-xs text-stone-500 italic font-medium font-sans">
                No items in this section yet. Add from Admin Dashboard!
              </div>
            )}
          </div>

          {/* Page Number & Footer */}
          <div className="pt-1 border-t border-stone-200 flex items-center justify-between text-[8px] text-stone-500 font-sans font-medium shrink-0">
            <span>{shopName}</span>
            <span className="font-bold text-[#0f172a]">
              Page {pageNumber}
            </span>
            <span className="text-emerald-700 font-semibold">100% Fresh Daily</span>
          </div>
        </div>
      </div>
    </div>
  );
});
CategoryPage.displayName = "CategoryPage";

// 3. BACK SPREAD / CONTACT PAGE (Dynamic Shop Contact Details)
export const BackContactPage = forwardRef<
  HTMLDivElement,
  { shop?: Shop; onReopen?: () => void; style?: React.CSSProperties }
>(({ shop, onReopen, style }, ref) => {
  const shopName = shop?.name || "Pizza World";
  const tagline = shop?.tagline || "Dine-In • Takeaway • Delivery";
  const timings = shop?.timings || "11:00 AM – 11:30 PM (All 7 Days)";
  const phone = shop?.phone || "+91 98765 43210";

  return (
    <div
      ref={ref}
      style={style}
      data-density="soft"
      className="w-full h-full menu-parchment p-2 sm:p-2.5 flex flex-col select-none relative overflow-hidden rounded-2xl"
    >
      <div className="absolute top-0 left-0 bottom-0 w-6 spine-crease-left pointer-events-none z-20" />

      {/* Outer Border Box */}
      <div className="w-full h-full border-2 border-stone-400/80 rounded-xl p-1 flex flex-col justify-between">
        {/* Inner Hairline Border Box */}
        <div className="w-full h-full border border-stone-300/70 rounded-lg p-3 sm:p-4 flex flex-col justify-between overflow-hidden">
          <div className="text-center space-y-1 pt-0.5 shrink-0">
            <div className="w-8 h-8 rounded-full border border-amber-600/40 mx-auto flex items-center justify-center bg-amber-50 shadow-2xs hover:scale-110 hover:rotate-6 transition-all duration-300 cursor-pointer">
              <Pizza className="w-4 h-4 text-amber-700" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-[#0f172a] font-serif">
              {shopName}
            </h2>
            <p className="text-[8.5px] tracking-wide text-stone-500 font-semibold font-sans">
              {tagline}
            </p>
            <div className="w-8 h-0.5 bg-amber-600/50 mx-auto rounded-full" />
          </div>

          <div className="text-center space-y-1 my-auto px-2 font-sans">
            <p className="text-[9.5px] sm:text-[10px] text-stone-700 leading-snug font-medium">
              Timings: {timings}
              <br />
              For Table Booking & Party Orders:
              <br />
              <strong className="text-emerald-800 text-xs sm:text-sm font-bold hover:underline cursor-pointer">
                {phone}
              </strong>
            </p>
          </div>

          <div className="text-center pb-0.5 shrink-0">
            <button
              type="button"
              onClick={onReopen}
              className="px-3.5 py-1 rounded-full catchy-theme-btn text-[10px] font-bold shadow-md cursor-pointer font-sans hover:scale-105 transition-transform duration-200 active:scale-95"
            >
              ↺ Back to Start
            </button>
          </div>

          <div className="text-center text-[7.5px] sm:text-[8px] text-stone-400 font-sans pb-0.5 shrink-0">
            Thank you for dining with {shopName}!
          </div>
        </div>
      </div>
    </div>
  );
});
BackContactPage.displayName = "BackContactPage";
