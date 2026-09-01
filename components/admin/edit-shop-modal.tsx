"use client";

import React, { useState, useEffect } from "react";
import { Shop } from "@/types/shop";
import {
  Store,
  X,
  Phone,
  Clock,
  Utensils,
  User,
  CheckCircle,
  Lock,
  Edit,
} from "lucide-react";

interface EditShopModalProps {
  shop: Shop | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (shopId: string, updatedData: Partial<Shop>) => void;
}

export function EditShopModal({
  shop,
  isOpen,
  onClose,
  onSave,
}: EditShopModalProps) {
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [timings, setTimings] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [establishedYear, setEstablishedYear] = useState("");
  const [theme, setTheme] = useState<"emerald" | "crimson" | "sapphire" | "terracotta">("emerald");
  const [featuresInput, setFeaturesInput] = useState("");

  useEffect(() => {
    if (shop) {
      setName(shop.name || "");
      setTagline(shop.tagline || "");
      setOwnerName(shop.ownerName || "");
      setPhone(shop.phone || "+91 ");
      setTimings(shop.timings || "");
      setCuisineType(shop.cuisineType || "");
      setEstablishedYear(shop.establishedYear || "2021");
      setTheme(shop.theme || "emerald");
      setFeaturesInput((shop.features || []).join(", "));
    }
  }, [shop, isOpen]);

  if (!isOpen || !shop) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedFeatures = featuresInput
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);

    onSave(shop.id, {
      name: name.trim(),
      tagline: tagline.trim(),
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      timings: timings.trim(),
      cuisineType: cuisineType.trim(),
      establishedYear: establishedYear.trim(),
      theme,
      features: parsedFeatures.length > 0 ? parsedFeatures : shop.features,
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
            <Edit className="w-3 h-3" />
            <span>Edit Restaurant Profile</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-yellow-200 font-serif tracking-tight">
            Edit Shop: {shop.name}
          </h2>
          <p className="text-[11px] text-stone-300 font-sans">
            Update shop details, operating hours, and tagline. Changes sync directly to the MySQL database.
          </p>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden mt-3">
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Disabled Unique Alphanumeric ID */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-yellow-200 font-sans flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Unique ID (Locked)</span>
                </label>
                <input
                  type="text"
                  value={shop.id}
                  disabled={true}
                  readOnly={true}
                  className="w-full px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-700 text-amber-300 text-xs font-mono font-bold tracking-wider cursor-not-allowed select-all opacity-80"
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
                  className="w-full px-3 py-1.5 rounded-xl bg-stone-900/90 border border-yellow-500/30 text-white text-xs font-sans focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            {/* Operating Hours & Year */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-yellow-200 font-sans flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Operating Hours
                </label>
                <input
                  type="text"
                  value={timings}
                  onChange={(e) => setTimings(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-stone-900/90 border border-yellow-500/30 text-white text-xs font-sans focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-yellow-200 font-sans">
                  Established Year
                </label>
                <input
                  type="text"
                  value={establishedYear}
                  onChange={(e) => setEstablishedYear(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-stone-900/90 border border-yellow-500/30 text-white text-xs font-sans focus:outline-none focus:border-yellow-400"
                />
              </div>
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
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-stone-950 font-black text-xs shadow-lg hover:scale-102 transition-transform cursor-pointer font-sans"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Save Changes to MySQL</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
