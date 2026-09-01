"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  getAIImageOptions,
  generateAIImageUrl,
  generateFoodImagePrompt,
  AIGeneratedImageOption,
} from "@/lib/ai-image";
import { Sparkles, RefreshCw, Check, Wand2 } from "lucide-react";

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
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [showCustomPrompt, setShowCustomPrompt] = useState<boolean>(false);

  // Generate initial image options based on dish name/category
  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const generated = getAIImageOptions(name, description, category);
      setOptions(generated);
      setIsGenerating(false);
    }, 400);
  };

  useEffect(() => {
    if (name.trim()) {
      handleGenerate();
    }
  }, [category]);

  const handleCustomPromptGenerate = () => {
    if (!customPrompt.trim()) return;
    setIsGenerating(true);
    const newSeed = Math.floor(Math.random() * 10000);
    const url = generateAIImageUrl(customPrompt, newSeed);
    const customOption: AIGeneratedImageOption = {
      id: `custom-${Date.now()}`,
      url,
      label: "Custom Prompt AI Render",
      prompt: customPrompt,
    };
    setOptions((prev) => [customOption, ...prev.slice(0, 2)]);
    onSelectImage(url);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-4 bg-stone-950/80 border border-stone-800 rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>AI Food Photography Engine</span>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || !name.trim()}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium transition-colors disabled:opacity-40 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
          <span>Regenerate AI Options</span>
        </button>
      </div>

      <p className="text-xs text-stone-400">
        AI synthesizes photorealistic culinary shots based on &ldquo;{name || "Dish Name"}&rdquo; with Michelin-star slate plating and studio rim lighting.
      </p>

      {/* Selected Image Preview & Candidates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map((opt) => {
          const isSelected = currentImageUrl === opt.url;
          return (
            <div
              key={opt.id}
              onClick={() => onSelectImage(opt.url)}
              className={`group relative aspect-[4/3] rounded-xl overflow-hidden border cursor-pointer transition-all ${
                isSelected
                  ? "border-amber-400 ring-2 ring-amber-400/30 shadow-lg shadow-amber-500/20"
                  : "border-stone-800 hover:border-stone-700 bg-stone-900"
              }`}
            >
              <Image
                src={opt.url}
                alt={opt.label}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="200px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {/* Selection Check Badge */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-md">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}

              <div className="absolute bottom-2 left-2 right-2 text-[10px] text-stone-200 font-medium truncate">
                {opt.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Prompt Toggle */}
      <div className="pt-2 border-t border-stone-800/80">
        {!showCustomPrompt ? (
          <button
            type="button"
            onClick={() => {
              setShowCustomPrompt(true);
              setCustomPrompt(generateFoodImagePrompt(name, description, category));
            }}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Customize AI Culinary Prompt</span>
          </button>
        ) : (
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-stone-300 block">
              Custom AI Generation Prompt
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe plating, textures, and lighting..."
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder:text-stone-500 outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={handleCustomPromptGenerate}
                className="px-3 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs shrink-0 hover:bg-amber-400 transition-colors cursor-pointer"
              >
                Generate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
