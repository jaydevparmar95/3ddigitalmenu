"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  getAIImageOptions,
  generateAIImageUrl,
  detectCuisineFromDishName,
  AIGeneratedImageOption,
} from "@/lib/ai-image";
import { Sparkles, RefreshCw, Check, Search, Wand2, Link as LinkIcon } from "lucide-react";

interface AIImageGenProps {
  name: string;
  description: string;
  category: string;
  currentImageUrl: string;
  onSelectImage: (url: string) => void;
}

export function AIImageGen({
  name,
  description,
  category,
  currentImageUrl,
  onSelectImage,
}: AIImageGenProps) {
  const [options, setOptions] = useState<AIGeneratedImageOption[]>([]);
  const [detectedCuisine, setDetectedCuisine] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [customSearch, setCustomSearch] = useState<string>("");
  const [manualUrl, setManualUrl] = useState<string>("");
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastNameSearchedRef = useRef<string>("");

  // Function to search and generate AI food photography matching the dish name
  const triggerAIImageSearch = (dishName: string, autoSelectFirst: boolean = false) => {
    if (!dishName.trim()) return;
    setIsGenerating(true);
    lastNameSearchedRef.current = dishName.trim();

    try {
      const { options: generated, cuisineTag } = getAIImageOptions(
        dishName,
        description,
        category
      );
      setOptions(generated);
      setDetectedCuisine(cuisineTag);

      // Automatically assign the #1 top matching image if currently empty
      if (autoSelectFirst && (!currentImageUrl || currentImageUrl.includes("pollinations.ai") || currentImageUrl.includes("unsplash.com"))) {
        if (generated[0]?.url) {
          onSelectImage(generated[0].url);
        }
      }
    } catch (err) {
      console.error("AI image generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Real-time automatic trigger when Dish Name or Category changes (Debounced by 450ms)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = name.trim();
    if (trimmed && trimmed.length >= 2 && trimmed !== lastNameSearchedRef.current) {
      debounceTimerRef.current = setTimeout(() => {
        triggerAIImageSearch(trimmed, true);
      }, 450);
    } else if (!trimmed && options.length === 0) {
      // Default placeholder initial setup
      const { options: defaultOpts, cuisineTag } = getAIImageOptions(
        "Signature Dish",
        description,
        category
      );
      setOptions(defaultOpts);
      setDetectedCuisine(cuisineTag);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [name, category]);

  // Manual search / custom query prompt
  const handleCustomSearch = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!customSearch.trim()) return;
    triggerAIImageSearch(customSearch.trim(), true);
  };

  // Manual Direct Image URL input
  const handleApplyManualUrl = () => {
    if (manualUrl.trim()) {
      onSelectImage(manualUrl.trim());
      setShowManualInput(false);
    }
  };

  return (
    <div className="space-y-3 bg-[#0d0705] border border-orange-500/30 rounded-2xl p-3.5 sm:p-4 shadow-xl">
      {/* Engine Header & Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-orange-500/20 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-400 text-stone-950 flex items-center justify-center font-bold shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-black text-amber-300 font-sans tracking-wide flex items-center gap-1.5">
              <span>AI Food Photography Engine</span>
              {isGenerating && (
                <span className="text-[10px] text-amber-400 animate-pulse font-normal">
                  (Analyzing Dish Name...)
                </span>
              )}
            </div>
            {detectedCuisine && (
              <span className="text-[10px] text-emerald-400 font-semibold font-sans">
                ✦ AI Profile: {detectedCuisine}
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => triggerAIImageSearch(name || customSearch || "Chef Specialty", false)}
            disabled={isGenerating}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition-all disabled:opacity-40 cursor-pointer active:scale-95"
          >
            <RefreshCw className={`w-3 h-3 ${isGenerating ? "animate-spin" : ""}`} />
            <span>Regenerate Shots</span>
          </button>

          <button
            type="button"
            onClick={() => setShowManualInput(!showManualInput)}
            className="px-2 py-1 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-white text-[11px] font-medium transition-colors"
            title="Custom Image URL"
          >
            <LinkIcon className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Helper text explaining real-time auto sync */}
      <div className="text-[11px] text-stone-400 flex items-center justify-between">
        <span>
          Real-time AI matches photorealistic culinary plating as you type the dish name:
        </span>
        <span className="text-amber-300/80 font-bold truncate max-w-[150px]">
          &ldquo;{name.trim() || "Type Dish Name Above..."}&rdquo;
        </span>
      </div>

      {/* Manual Custom Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-500" />
          <input
            type="text"
            value={customSearch}
            onChange={(e) => setCustomSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCustomSearch();
              }
            }}
            placeholder="Search custom flavor / styling (e.g. Sizzling Butter Garlic Gravy)..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-stone-900/90 border border-stone-800 focus:border-amber-400 text-xs text-stone-200 placeholder:text-stone-600 outline-none"
          />
        </div>
        <button
          type="button"
          onClick={handleCustomSearch}
          className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold transition-colors cursor-pointer"
        >
          Search
        </button>
      </div>

      {/* Optional Manual Direct Image URL input */}
      {showManualInput && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-900 border border-stone-800">
          <input
            type="url"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="Paste direct food image link (https://...)"
            className="flex-1 bg-transparent text-xs text-stone-200 outline-none"
          />
          <button
            type="button"
            onClick={handleApplyManualUrl}
            className="px-2.5 py-1 rounded-lg bg-amber-500 text-stone-950 font-bold text-xs cursor-pointer"
          >
            Apply URL
          </button>
        </div>
      )}

      {/* 4 Real-time AI Generated & Curated Candidates Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {options.map((opt) => {
          const isSelected = currentImageUrl === opt.url;
          return (
            <div
              key={opt.id}
              onClick={() => onSelectImage(opt.url)}
              className={`group relative aspect-[16/11] rounded-xl overflow-hidden border cursor-pointer transition-all ${
                isSelected
                  ? "border-amber-400 ring-2 ring-amber-400/40 shadow-lg shadow-amber-500/25 scale-102"
                  : "border-stone-800/80 hover:border-amber-400/50 bg-stone-900"
              }`}
            >
              <img
                src={opt.url}
                alt={opt.label}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
                onError={(e) => {
                  // Fallback if image generation is pending
                  (e.target as any).src = "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              {/* Selection Check Badge */}
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center font-black shadow-md text-xs">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}

              {/* Tag Label */}
              <div className="absolute bottom-1.5 left-1.5 right-1.5 text-[9.5px] text-stone-200 font-bold font-sans line-clamp-1 group-hover:text-yellow-200 transition-colors">
                {opt.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
