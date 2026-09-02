"use client";

import React, { useState, useEffect } from "react";
import { ShopMenuItem } from "@/types/shop";
import { useShop } from "@/context/shop-context";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { AIImageGen } from "@/components/admin/ai-image-gen";
import { getAIImageOptions } from "@/lib/ai-image";
import { FoodTypeBadge } from "@/components/book/book-page";

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: ShopMenuItem | null;
  shopId?: string;
}

export function ItemFormModal({
  isOpen,
  onClose,
  editItem,
  shopId,
}: ItemFormModalProps) {
  const { activeShop, addItemToShop, updateItemInShop } = useShop();

  const currentShopId = shopId || activeShop?.id || "pizza-world";
  const shopCategories = activeShop?.categories || [];

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(199);
  const [category, setCategory] = useState<string>(shopCategories[0]?.id || "starters");
  const [imageUrl, setImageUrl] = useState("");
  const [isVeg, setIsVeg] = useState<boolean>(true);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isSpicy, setIsSpicy] = useState(false);

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setDescription(editItem.description);
      setPrice(editItem.price);
      setCategory(editItem.category);
      setImageUrl(editItem.image);
      setIsVeg(Boolean(editItem.isVeg));
      setIsBestseller(Boolean(editItem.isBestseller));
      setIsSpicy(Boolean(editItem.isSpicy));
    } else {
      setName("");
      setDescription("");
      setPrice(199);
      setCategory(shopCategories[0]?.id || "starters");
      setIsVeg(true);
      setIsBestseller(false);
      setIsSpicy(false);
      const { options: defaults } = getAIImageOptions("Delicious Food Dish", "", "starters");
      setImageUrl(defaults[0]?.url || "");
    }
  }, [editItem, isOpen, shopCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const dishPayload = {
      name: name.trim(),
      description: description.trim() || "Freshly handcrafted with pure ingredients and traditional spices.",
      price: Number(price),
      category: category || shopCategories[0]?.id || "starters",
      image: imageUrl || "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=90",
      isVeg,
      isBestseller,
      isSpicy,
    };

    if (editItem) {
      updateItemInShop(currentShopId, editItem.id, dishPayload);
    } else {
      addItemToShop(currentShopId, dishPayload);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editItem ? `Edit Item: ${editItem.name}` : `Add New Dish to ${activeShop?.name || "Menu"}`}
      description="Enter dish details, set price in Rupees (₹), and choose or generate AI food photography."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 font-sans">
        {/* Row 1: Name & Food Type (Veg / Non-Veg) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-amber-400">
              Dish / Item Name *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Special Stuffed Paneer Tikka"
              className="bg-[#120804] border-orange-500/40 text-stone-100 placeholder:text-stone-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-amber-400">
              Food Type *
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setIsVeg(true)}
                className={`flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  isVeg
                    ? "bg-emerald-600 border-emerald-400 text-white shadow-md"
                    : "bg-[#180e07] border-stone-700 text-stone-300"
                }`}
              >
                <FoodTypeBadge isVeg={true} />
                <span>Veg</span>
              </button>

              <button
                type="button"
                onClick={() => setIsVeg(false)}
                className={`flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  !isVeg
                    ? "bg-red-700 border-red-400 text-white shadow-md"
                    : "bg-[#180e07] border-stone-700 text-stone-300"
                }`}
              >
                <FoodTypeBadge isVeg={false} />
                <span>Non-Veg</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Category & Price (₹) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-amber-400">
              Menu Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#120804] border border-orange-500/40 rounded-xl px-4 py-2.5 text-sm text-stone-100 outline-none focus:border-amber-400 cursor-pointer"
            >
              {shopCategories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-[#1c0d06] text-stone-100">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-amber-400">
              Price in Rupees (₹) *
            </label>
            <Input
              type="number"
              step="1"
              min="1"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              leftIcon={<span className="font-bold text-amber-400 text-sm">₹</span>}
              className="bg-[#120804] border-orange-500/40 text-stone-100"
              required
            />
          </div>
        </div>

        {/* Row 3: Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-amber-400">
            Description & Ingredients
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Fresh spices, authentic recipe, mouthwatering taste..."
            rows={2}
            className="w-full bg-[#120804] border border-orange-500/40 rounded-xl p-3 text-xs sm:text-sm text-stone-100 placeholder:text-stone-500 focus:border-amber-400 outline-none resize-none"
          />
        </div>

        {/* Row 4: Badges */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-200">
            <input
              type="checkbox"
              checked={isBestseller}
              onChange={(e) => setIsBestseller(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 accent-amber-500"
            />
            <span>★ Mark as Bestseller</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-200">
            <input
              type="checkbox"
              checked={isSpicy}
              onChange={(e) => setIsSpicy(e.target.checked)}
              className="w-4 h-4 rounded text-red-500 accent-red-500"
            />
            <span>🌶 Mark as Spicy</span>
          </label>
        </div>

        {/* AI Food Photography Generator */}
        <AIImageGen
          name={name}
          description={description}
          category={category as any}
          currentImageUrl={imageUrl}
          onSelectImage={setImageUrl}
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-orange-500/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl catchy-amber-btn text-xs font-bold shadow-lg cursor-pointer"
          >
            {editItem ? "Save Changes" : "Add to Menu"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
