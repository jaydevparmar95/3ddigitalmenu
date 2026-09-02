"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ShopMenuItem } from "@/types/shop";
import { useShop } from "@/context/shop-context";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FoodTypeBadge } from "@/components/book/book-page";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
} from "lucide-react";

interface ItemTableProps {
  onAddNew: () => void;
  onEdit: (item: ShopMenuItem) => void;
  shopId?: string;
}

export function ItemTable({ onAddNew, onEdit, shopId }: ItemTableProps) {
  const { activeShop, deleteItemFromShop, refreshFromDb } = useShop();
  const currentShop = activeShop;
  const items = currentShop?.items || [];
  const categories = currentShop?.categories || [];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<"all" | "veg" | "non-veg">("all");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const DISHES_PER_PAGE = 6;

  // Reset page when search or filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory, filterType, shopId]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }
      if (filterType === "veg" && !item.isVeg) return false;
      if (filterType === "non-veg" && item.isVeg) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }
      return true;
    });
  }, [items, selectedCategory, filterType, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / DISHES_PER_PAGE));
  const currentPageClamped = Math.min(page, totalPages);
  const paginatedItems = useMemo(() => {
    const start = (currentPageClamped - 1) * DISHES_PER_PAGE;
    return filteredItems.slice(start, start + DISHES_PER_PAGE);
  }, [filteredItems, currentPageClamped, DISHES_PER_PAGE]);

  const handleDelete = (id: string) => {
    if (currentShop) {
      deleteItemFromShop(currentShop.id, id);
    }
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="w-full sm:max-w-md">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search in ${currentShop?.name || "menu"}...`}
            leftIcon={<Search className="w-4 h-4 text-amber-400" />}
            className="bg-[#180e07] border-orange-500/40 text-stone-100 placeholder:text-stone-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={refreshFromDb}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#231209] border border-orange-500/30 text-stone-300 hover:text-amber-200 text-xs font-bold transition-colors cursor-pointer"
            title="Sync data directly from MySQL database"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Sync MySQL Data</span>
          </button>

          <button
            type="button"
            onClick={onAddNew}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl catchy-amber-btn text-xs font-bold shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add New Dish</span>
          </button>
        </div>
      </div>

      {/* Veg / Non-Veg Quick Filter & Category Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "catchy-amber-btn shadow-md"
                : "bg-[#180e07] border border-orange-500/20 text-stone-300 hover:text-white"
            }`}
          >
            All Items ({items.length})
          </button>

          {categories.map((cat) => {
            const count = items.filter((i) => i.category === cat.id).length;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "catchy-amber-btn shadow-md"
                    : "bg-[#180e07] border border-orange-500/20 text-stone-300 hover:text-white"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Veg / Non-Veg Quick Switcher */}
        <div className="flex items-center bg-[#180e07] border border-orange-500/30 rounded-xl p-1 gap-1 shrink-0">
          <button
            onClick={() => setFilterType("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
              filterType === "all" ? "bg-amber-500 text-stone-950" : "text-stone-400 hover:text-white"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType("veg")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
              filterType === "veg" ? "bg-emerald-600 text-white" : "text-emerald-400 hover:bg-emerald-950/40"
            }`}
          >
            <FoodTypeBadge isVeg={true} />
            <span>Veg</span>
          </button>
          <button
            onClick={() => setFilterType("non-veg")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
              filterType === "non-veg" ? "bg-red-700 text-white" : "text-red-400 hover:bg-red-950/40"
            }`}
          >
            <FoodTypeBadge isVeg={false} />
            <span>Non-Veg</span>
          </button>
        </div>
      </div>

      {/* Dishes Table */}
      <div className="bg-[#180e07]/85 border border-orange-500/30 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm font-sans">
            <thead className="bg-[#100703] text-amber-300 border-b border-orange-500/30 font-bold">
              <tr>
                <th className="py-3.5 px-4">Item & Image</th>
                <th className="py-3.5 px-4 hidden md:table-cell">Category</th>
                <th className="py-3.5 px-4">Price (₹)</th>
                <th className="py-3.5 px-4 hidden sm:table-cell">Type</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-orange-500/15 text-stone-100">
              {paginatedItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-[#28140a]/50 transition-colors"
                >
                  {/* Dish Name + Thumbnail */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-[#0d0705] border border-orange-500/40 shadow-sm">
                        <img
                          src={item.image || "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=200&q=80"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=200&q=80";
                          }}
                        />
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-extrabold text-stone-100 flex items-center gap-2 text-sm sm:text-base">
                          <FoodTypeBadge isVeg={item.isVeg} />
                          <span>{item.name}</span>
                          {item.isBestseller && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-200 text-amber-950 font-bold">
                              Bestseller
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-400 line-clamp-1 max-w-sm">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 hidden md:table-cell">
                    <span className="capitalize px-2.5 py-1 rounded-lg bg-[#251208] text-amber-200 text-xs border border-orange-500/20 font-bold">
                      {item.category.replace("-", " ")}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="py-3 px-4">
                    <span className="font-black text-amber-400 text-sm sm:text-base font-sans">
                      {formatCurrency(item.price)}
                    </span>
                  </td>

                  {/* Veg / Non-Veg */}
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${item.isVeg ? "text-emerald-400" : "text-red-400"}`}>
                      <FoodTypeBadge isVeg={item.isVeg} />
                      <span>{item.isVeg ? "Vegetarian" : "Non-Veg"}</span>
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="p-2 rounded-xl bg-[#28140a] hover:bg-amber-500 hover:text-stone-950 text-amber-300 border border-orange-500/30 transition-colors cursor-pointer"
                        title="Edit dish"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {deleteConfirmId === item.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="px-2 py-1 rounded-lg bg-red-700 text-white text-[11px] font-bold cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="p-1 text-stone-400 text-xs hover:text-white cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-2 rounded-xl bg-[#28140a] hover:bg-red-900/40 hover:text-red-300 text-stone-400 border border-stone-800 transition-colors cursor-pointer"
                          title="Delete dish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dish Pagination Controls (Rule 4) */}
        {filteredItems.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-[#120703] border-t border-orange-500/20 text-xs font-sans">
            <span className="text-stone-400">
              Showing <strong className="text-amber-300">{(currentPageClamped - 1) * DISHES_PER_PAGE + 1}</strong> to{" "}
              <strong className="text-amber-300">{Math.min(currentPageClamped * DISHES_PER_PAGE, filteredItems.length)}</strong> of{" "}
              <strong className="text-amber-300">{filteredItems.length}</strong> dishes
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPageClamped === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg bg-[#200f07] text-amber-300 border border-orange-500/30 hover:bg-[#32170a] font-bold disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPage(num)}
                    className={`w-8 h-8 rounded-lg font-bold transition-all cursor-pointer ${
                      num === currentPageClamped
                        ? "bg-amber-500 text-stone-950 font-black shadow-xs"
                        : "bg-[#200f07] text-stone-300 border border-orange-500/20 hover:text-amber-200"
                    }`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPageClamped === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg bg-[#200f07] text-amber-300 border border-orange-500/30 hover:bg-[#32170a] font-bold disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {filteredItems.length === 0 && (
          <div className="py-12 text-center text-xs text-stone-400 space-y-2">
            <p>No dishes found matching your criteria in {currentShop?.name}.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setFilterType("all");
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
