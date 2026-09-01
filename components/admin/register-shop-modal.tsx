"use client";

import React, { useState, useEffect } from "react";
import { Shop, ShopCategory } from "@/types/shop";
import { useShop } from "@/context/shop-context";
import {
  Store,
  X,
  Phone,
  Clock,
  Utensils,
  User,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Lock,
} from "lucide-react";

interface RegisterShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (
    newShop: Omit<Shop, "id" | "createdAt" | "items"> & { id?: string }
  ) => void;
}

// Generate unique uppercase alphanumeric ID (e.g. SHP-9A8F2K)
export function generateAlphanumericShopId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "SHP-";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function RegisterShopModal({
  isOpen,
  onClose,
  onRegister,
}: RegisterShopModalProps) {
  const { shops } = useShop();

  const [shopId, setShopId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [tagline, setTagline] = useState<string>("");
  const [ownerName, setOwnerName] = useState<string>("");
  const [phone, setPhone] = useState<string>("+91 ");
  const [timings, setTimings] = useState<string>("");
  const [cuisineType, setCuisineType] = useState<string>("");
  const [theme, setTheme] = useState<"emerald" | "crimson" | "sapphire" | "terracotta">("emerald");
  const [categoriesInput, setCategoriesInput] = useState<string>("");
  const [featuresInput, setFeaturesInput] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Rule 5: Open empty form every time, don't fill with previous data
  useEffect(() => {
    if (isOpen) {
      setName("");
      setTagline("");
      setOwnerName("");
      setPhone("+91 ");
      setTimings("");
      setCuisineType("");
      setTheme("emerald");
      setCategoriesInput("");
      setFeaturesInput("");
      setErrorMessage("");

      // Auto-generate unique alphanumeric ID
      let newId = generateAlphanumericShopId();
      while (shops.some((s) => s.id.toLowerCase() === newId.toLowerCase())) {
        newId = generateAlphanumericShopId();
      }
      setShopId(newId);
    }
  }, [isOpen, shops]);

  // Duplicate Unique ID check
  const isDuplicateId = shops.some(
    (s) => s.id.toLowerCase().trim() === shopId.toLowerCase().trim()
  );

  const handleRegenerateId = () => {
    let newId = generateAlphanumericShopId();
    while (shops.some((s) => s.id.toLowerCase() === newId.toLowerCase())) {
      newId = generateAlphanumericShopId();
    }
    setShopId(newId);
    setErrorMessage("");
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isDuplicateId) {
      setErrorMessage("⚠️ This Unique Alphanumeric ID already exists in the database! Please click regenerate.");
      return;
    }

    const parsedCategories: ShopCategory[] = categoriesInput
      .split(",")
      .map((catStr) => catStr.trim())
      .filter(Boolean)
      .map((catName) => ({
        id: catName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: catName,
      }));

    const parsedFeatures = featuresInput
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);

    onRegister({
      id: shopId.trim(),
      name: name.trim(),
      tagline: tagline.trim() || "Authentic Handcrafted Flavors",
      ownerName: ownerName.trim() || "Owner",
      phone: phone.trim() || "+91 98765 43210",
      timings: timings.trim() || "11:00 AM – 11:00 PM (All 7 Days)",
      establishedYear: new Date().getFullYear().toString(),
      cuisineType: cuisineType.trim() || "Authentic Kitchen",
      theme,
      categories:
        parsedCategories.length > 0
          ? parsedCategories
          : [{ id: "starters", name: "Starters & Snacks" }],
      features:
        parsedFeatures.length > 0
          ? parsedFeatures
          : ["Handcrafted Daily", "100% Fresh Ingredients", "Authentic Taste"],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-[#041a10] border-2 border-yellow-500/50 rounded-2xl p-4 sm:p-6 shadow-2xl text-[#f7f2ea] my-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header (Compact) */}
        <div className="space-y-0.5 pb-2 border-b border-yellow-500/20 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-[11px] font-bold font-sans">
            <Store className="w-3 h-3" />
            <span>Admin Control Panel</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-yellow-200 font-serif tracking-tight">
            Register New Shop / Restaurant
          </h2>
          <p className="text-[11px] text-stone-300 font-sans">
            Create an independent 3D Digital Menu profile with auto-generated unique identifier and exclusive QR code.
          </p>
        </div>

        {/* Validation Error Banner */}
        {(errorMessage || isDuplicateId) && (
          <div className="mt-2 p-2.5 rounded-xl bg-red-950/80 border border-red-500 text-red-200 text-xs font-bold flex items-center gap-2 animate-shake shrink-0">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>
              {errorMessage || "⚠️ This Unique Alphanumeric ID already exists! Please click Regenerate."}
            </span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden mt-3">
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Disabled Unique Alphanumeric ID */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-yellow-200 font-sans flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-400" />
                    <span>Unique ID (Auto-Generated)</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleRegenerateId}
                    className="text-[10px] text-amber-400 hover:text-yellow-200 flex items-center gap-0.5 cursor-pointer underline font-sans"
                    title="Generate new unique ID"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>Regenerate</span>
                  </button>
                </label>
                <input
                  type="text"
                  value={shopId}
                  disabled={true}
                  readOnly={true}
                  className={`w-full px-3 py-1.5 rounded-xl bg-stone-950 border text-xs font-mono font-bold tracking-wider cursor-not-allowed select-all ${
                    isDuplicateId
                      ? "border-red-500 text-red-400 bg-red-950/30"
                      : "border-stone-700 text-amber-300 opacity-90"
                  }`}
                />
              </div>

              {/* Shop Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-yellow-200 font-sans flex items-center gap-1">
                  <Store className="w-3 h-3" /> Shop Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Royal Chinese Wok"
                  className="w-full px-3 py-1.5 rounded-xl bg-stone-900/90 border border-yellow-500/30 text-white text-xs font-sans focus:outline-none focus:border-yellow-400"
                />
              </div>

              {/* Owner Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-yellow-200 font-sans flex items-center gap-1">
                  <User className="w-3 h-3" /> Owner / Manager Name
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full px-3 py-1.5 rounded-xl bg-stone-900/90 border border-yellow-500/30 text-white text-xs font-sans focus:outline-none focus:border-yellow-400"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-yellow-200 font-sans flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Contact Phone (+91)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-1.5 rounded-xl bg-stone-900/90 border border-yellow-500/30 text-white text-xs font-sans focus:outline-none focus:border-yellow-400"
                />
              </div>

              {/* Cuisine Type */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-yellow-200 font-sans flex items-center gap-1">
                  <Utensils className="w-3 h-3" /> Cuisine Type
                </label>
                <input
                  type="text"
                  value={cuisineType}
                  onChange={(e) => setCuisineType(e.target.value)}
                  placeholder="e.g. Indo-Chinese, Vadapav, Street Food"
                  className="w-full px-3 py-1.5 rounded-xl bg-stone-900/90 border border-yellow-500/30 text-white text-xs font-sans focus:outline-none focus:border-yellow-400"
                />
              </div>

              {/* Tagline */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-yellow-200 font-sans">
                  Tagline / Speciality
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Authentic Indo-Chinese Kitchen"
                  className="w-full px-3 py-1.5 rounded-xl bg-stone-900/90 border border-yellow-500/30 text-white text-xs font-sans focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            {/* Operating Hours */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-yellow-200 font-sans flex items-center gap-1">
                <Clock className="w-3 h-3" /> Operating Hours
              </label>
              <input
                type="text"
                value={timings}
                onChange={(e) => setTimings(e.target.value)}
                placeholder="e.g. 11:00 AM – 11:00 PM (All 7 Days)"
                className="w-full px-3 py-1.5 rounded-xl bg-stone-900/90 border border-yellow-500/30 text-white text-xs font-sans focus:outline-none focus:border-yellow-400"
              />
            </div>

            {/* Menu Categories */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-yellow-200 font-sans">
                Menu Categories (comma-separated)
              </label>
              <input
                type="text"
                value={categoriesInput}
                onChange={(e) => setCategoriesInput(e.target.value)}
                placeholder="e.g. Soups, Starters, Fried Rice & Noodles, Desserts"
                className="w-full px-3 py-1.5 rounded-xl bg-stone-900/90 border border-yellow-500/30 text-white text-xs font-sans focus:outline-none focus:border-yellow-400"
              />
            </div>

            {/* 3 Quality Highlights */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-yellow-200 font-sans">
                3 Quality Highlights for Cover Page (comma-separated)
              </label>
              <input
                type="text"
                value={featuresInput}
                onChange={(e) => setFeaturesInput(e.target.value)}
                placeholder="e.g. Wok Tossed High Flame, Fresh In-House Dough, 100% Real Dairy Mozzarella"
                className="w-full px-3 py-1.5 rounded-xl bg-stone-900/90 border border-yellow-500/30 text-white text-xs font-sans focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>

          {/* Sticky Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 mt-2 border-t border-stone-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold font-sans transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDuplicateId}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-stone-950 font-black text-xs shadow-lg hover:scale-102 transition-transform cursor-pointer font-sans disabled:opacity-40 disabled:pointer-events-none"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Register & Generate Menu</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
