"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useShop } from "@/context/shop-context";
import { Shop, ShopMenuItem } from "@/types/shop";
import { ItemTable } from "@/components/admin/item-table";
import { AdminLogin } from "@/components/admin/admin-login";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";

// Lazy-load modals: only bundled when opened, not on initial page load
const ItemFormModal = dynamic(
  () => import("@/components/admin/item-form").then((m) => ({ default: m.ItemFormModal })),
  { ssr: false }
);
const QrModal = dynamic(
  () => import("@/components/admin/qr-modal").then((m) => ({ default: m.QrModal })),
  { ssr: false }
);
const RegisterShopModal = dynamic(
  () => import("@/components/admin/register-shop-modal").then((m) => ({ default: m.RegisterShopModal })),
  { ssr: false }
);
const EditShopModal = dynamic(
  () => import("@/components/admin/edit-shop-modal").then((m) => ({ default: m.EditShopModal })),
  { ssr: false }
);
import {
  Store,
  QrCode,
  Plus,
  Utensils,
  BookOpen,
  ExternalLink,
  Phone,
  Clock,
  Layers,
  SlidersHorizontal,
  ChevronRight,
  Edit,
  Lock,
  Search,
  Trash2,
  RotateCcw,
  Eye,
  Archive,
  AlertTriangle,
  LogOut,
  Home,
} from "lucide-react";

export default function AdminPage() {
  const {
    shops,
    activeShop,
    setActiveShopId,
    registerShop,
    updateShop,
    softDeleteShop,
    restoreShop,
    deleteShop,
    isLoaded,
  } = useShop();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"shops" | "dishes">("shops");
  const [shopViewMode, setShopViewMode] = useState<"active" | "archived">("active");
  const [shopSearchQuery, setShopSearchQuery] = useState<string>("");
  const [shopPage, setShopPage] = useState<number>(1);
  const SHOPS_PER_PAGE = 4;

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShopMenuItem | null>(null);

  const [qrModalShop, setQrModalShop] = useState<Shop | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const [isRegisterShopOpen, setIsRegisterShopOpen] = useState(false);

  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [isEditShopOpen, setIsEditShopOpen] = useState(false);

  const [deleteConfirmShopId, setDeleteConfirmShopId] = useState<string | null>(null);

  // Reset pagination when search query or view mode changes
  useEffect(() => {
    setShopPage(1);
  }, [shopSearchQuery, shopViewMode]);

  const activeShopsList = useMemo(() => {
    return shops.filter((s) => !s.isDeleted);
  }, [shops]);

  const archivedShopsList = useMemo(() => {
    return shops.filter((s) => s.isDeleted);
  }, [shops]);

  // Filtered list by Search (Search by Unique Alphanumeric ID, Name, or Cuisine)
  const filteredShops = useMemo(() => {
    const baseList = shopViewMode === "active" ? activeShopsList : archivedShopsList;
    if (!shopSearchQuery.trim()) return baseList;

    const q = shopSearchQuery.toLowerCase().trim();
    return baseList.filter((s) => {
      const matchId = s.id.toLowerCase().includes(q);
      const matchName = s.name.toLowerCase().includes(q);
      const matchCuisine = s.cuisineType.toLowerCase().includes(q);
      const matchOwner = (s.ownerName || "").toLowerCase().includes(q);
      return matchId || matchName || matchCuisine || matchOwner;
    });
  }, [shopViewMode, activeShopsList, archivedShopsList, shopSearchQuery]);

  // Shop Pagination
  const totalShopPages = Math.max(1, Math.ceil(filteredShops.length / SHOPS_PER_PAGE));
  const currentShopPageClamped = Math.min(shopPage, totalShopPages);
  const paginatedShops = useMemo(() => {
    const start = (currentShopPageClamped - 1) * SHOPS_PER_PAGE;
    return filteredShops.slice(start, start + SHOPS_PER_PAGE);
  }, [filteredShops, currentShopPageClamped, SHOPS_PER_PAGE]);

  // Check Admin Authentication on mount
  useEffect(() => {
    fetch("/api/auth/check")
      .then((res) => {
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setIsAuthenticated(false);
  };

  const handleOpenQrModal = (shop: Shop) => {
    setQrModalShop(shop);
    setIsQrModalOpen(true);
  };

  const handleOpenEditShop = (shop: Shop) => {
    setEditingShop(shop);
    setIsEditShopOpen(true);
  };

  const handleEditDish = (item: ShopMenuItem) => {
    setEditingItem(item);
    setIsItemModalOpen(true);
  };

  const handleAddNewDish = () => {
    setEditingItem(null);
    setIsItemModalOpen(true);
  };

  const handleManageShopDishes = (shopId: string) => {
    setActiveShopId(shopId);
    setActiveTab("dishes");
  };

  const handleSoftDelete = (shopId: string) => {
    softDeleteShop(shopId);
    setDeleteConfirmShopId(null);
  };

  const handleRestore = (shopId: string) => {
    restoreShop(shopId);
  };

  const handlePermanentDelete = (shopId: string) => {
    deleteShop(shopId);
    setDeleteConfirmShopId(null);
  };

  if (isAuthenticated === null || !isLoaded) {
    return (
      <div className="min-h-screen bg-[#070302] text-yellow-300 flex items-center justify-center font-serif">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-sans text-stone-300">Loading Admin Control Center...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#070302] text-[#f7f2ea] p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-7">
        {/* Top Super Admin Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-orange-500/20 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold font-sans">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Super Admin Management Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-amber-200 font-serif tracking-tight">
              3D Digital Menu Studio
            </h1>
            <p className="text-xs sm:text-sm text-stone-400">
              Manage multiple shops, register new restaurants, view real-time visitor analytics, and generate QR codes.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* View Public Directory Link */}
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-900/90 border border-stone-800 hover:border-amber-400/50 text-stone-300 hover:text-white font-bold text-xs transition-colors"
            >
              <Home className="w-3.5 h-3.5 text-amber-400" />
              <span>Public Directory</span>
            </Link>

            {/* Register Shop Button (Admin Only) */}
            <button
              type="button"
              onClick={() => setIsRegisterShopOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-stone-950 font-black text-xs shadow-lg hover:scale-102 transition-transform cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Register New Shop</span>
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-red-950/40 border border-red-500/30 hover:bg-red-900/50 text-red-300 text-xs font-bold transition-colors cursor-pointer"
              title="Sign out of Admin Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Master Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-orange-500/20 pb-1">
          <button
            type="button"
            onClick={() => setActiveTab("shops")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "shops"
                ? "bg-amber-500 text-stone-950 shadow-md font-extrabold"
                : "bg-[#180e07] text-stone-300 border border-orange-500/20 hover:text-white"
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Registered Shops & QR Codes ({activeShopsList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("dishes")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "dishes"
                ? "bg-amber-500 text-stone-950 shadow-md font-extrabold"
                : "bg-[#180e07] text-stone-300 border border-orange-500/20 hover:text-white"
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Dish Management ({activeShop.name})</span>
          </button>
        </div>

        {/* TAB 1: REGISTERED SHOPS & QR CODES */}
        {activeTab === "shops" && (
          <div className="space-y-6">
            {/* Search Bar & View Mode Filter */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Search by Unique Alphanumeric ID or Name */}
              <div className="w-full sm:max-w-lg">
                <Input
                  value={shopSearchQuery}
                  onChange={(e) => setShopSearchQuery(e.target.value)}
                  placeholder="Search by Unique Alphanumeric ID (e.g. SHP-9A8F2K) or Shop Name..."
                  leftIcon={<Search className="w-4 h-4 text-amber-400" />}
                  className="bg-[#180e07] border-orange-500/40 text-stone-100 placeholder:text-stone-500 text-xs"
                />
              </div>

              {/* Active vs Soft-Deleted Tabs */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setShopViewMode("active")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    shopViewMode === "active"
                      ? "bg-amber-500 text-stone-950 font-black shadow-xs"
                      : "bg-[#180e07] text-stone-400 border border-orange-500/20 hover:text-white"
                  }`}
                >
                  Active ({activeShopsList.length})
                </button>

                <button
                  type="button"
                  onClick={() => setShopViewMode("archived")}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    shopViewMode === "archived"
                      ? "bg-red-500/20 border border-red-500 text-red-300 font-black shadow-xs"
                      : "bg-[#180e07] text-stone-400 border border-orange-500/20 hover:text-white"
                  }`}
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Archived ({archivedShopsList.length})</span>
                </button>
              </div>
            </div>

            {/* Shop Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
              {paginatedShops.map((shop) => (
                <div
                  key={shop.id}
                  className={`bg-[#120703]/90 border rounded-2xl p-5 shadow-xl space-y-4 transition-all flex flex-col justify-between ${
                    shop.isDeleted
                      ? "border-red-500/40 opacity-75 bg-red-950/10"
                      : "border-orange-500/30 hover:border-amber-400/60"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1.5">
                        <div className="flex items-center flex-wrap gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                            {shop.cuisineType}
                          </span>

                          {/* Rule 2: Alphanumeric ID Badge */}
                          <span
                            className="px-2 py-0.5 rounded-md bg-stone-900 border border-stone-700 text-amber-300 font-mono text-[10px] font-bold flex items-center gap-1"
                            title="Unique Alphanumeric ID"
                          >
                            <Lock className="w-2.5 h-2.5 text-amber-400" />
                            <span>{shop.id}</span>
                          </span>

                          {/* Rule 2: Real-Time Visitors Count Badge (Admin Only) */}
                          <span
                            className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1 shadow-xs"
                            title="Real-time menu visitors count (Admin view only)"
                          >
                            <Eye className="w-3 h-3 text-emerald-400" />
                            <span>{shop.visitorsCount || 0} Visitors</span>
                          </span>

                          {shop.isDeleted && (
                            <span className="px-2 py-0.5 rounded-md bg-red-900/60 border border-red-500/50 text-red-300 text-[10px] font-bold">
                              Soft-Deleted
                            </span>
                          )}
                        </div>

                        <h3 className="text-xl font-black text-white font-serif">
                          {shop.name}
                        </h3>
                        <p className="text-xs text-stone-400 font-medium">
                          {shop.tagline}
                        </p>
                      </div>

                      {/* QR Code Quick Trigger Icon */}
                      {!shop.isDeleted && (
                        <button
                          type="button"
                          onClick={() => handleOpenQrModal(shop)}
                          className="p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-stone-950 text-amber-300 border border-amber-500/40 transition-all cursor-pointer shadow-xs"
                          title="Generate & View QR Code"
                        >
                          <QrCode className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    {/* Shop Meta Details */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-stone-300 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{shop.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{shop.items.length} Dishes ({shop.categories.length} Categories)</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2 text-stone-400 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{shop.timings}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-stone-800">
                    {!shop.isDeleted ? (
                      <>
                        <div className="flex items-center flex-wrap gap-1.5">
                          {/* Live Menu Button */}
                          <Link
                            href={`/menu/${shop.id}`}
                            target="_blank"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#221108] hover:bg-[#381c0d] text-amber-300 hover:text-amber-100 border border-orange-500/40 text-xs font-bold transition-all shadow-xs"
                            title="Open live 3D menu for this shop in a new tab"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                            <span>Live Menu</span>
                          </Link>

                          {/* Edit Shop Details Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditShop(shop)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-200 border border-stone-700 text-xs font-bold transition-colors cursor-pointer"
                            title="Edit shop details, timings, and highlights"
                          >
                            <Edit className="w-3.5 h-3.5 text-amber-400" />
                            <span>Edit Details</span>
                          </button>

                          {/* QR Code Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenQrModal(shop)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#251006] text-amber-300 hover:bg-[#38180a] border border-orange-500/30 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>QR Code</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Manage Dishes Button */}
                          <button
                            type="button"
                            onClick={() => handleManageShopDishes(shop.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <span>Dishes</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>

                          {/* Rule 1: Soft Delete Button */}
                          {deleteConfirmShopId === shop.id ? (
                            <div className="flex items-center gap-1 bg-red-950 p-1 rounded-lg border border-red-500/50">
                              <button
                                type="button"
                                onClick={() => handleSoftDelete(shop.id)}
                                className="px-2 py-1 rounded bg-red-600 text-white text-[10px] font-bold cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmShopId(null)}
                                className="px-1 text-stone-400 text-[10px] hover:text-white cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmShopId(shop.id)}
                              className="p-1.5 rounded-lg bg-[#28140a] hover:bg-red-900/50 text-stone-400 hover:text-red-300 border border-stone-800 transition-colors cursor-pointer"
                              title="Soft delete shop (can be restored later)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      /* Actions for Soft-Deleted / Archived Shops */
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[11px] text-red-300 font-medium">
                          Soft-deleted (Hidden from customers)
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleRestore(shop.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore Shop</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handlePermanentDelete(shop.id)}
                            className="p-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-bold transition-colors cursor-pointer"
                            title="Permanently remove from database"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Rule 4: Shop List Pagination Controls */}
            {filteredShops.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-[#120703] border border-orange-500/20 rounded-2xl text-xs font-sans">
                <span className="text-stone-400">
                  Showing <strong className="text-amber-300">{(currentShopPageClamped - 1) * SHOPS_PER_PAGE + 1}</strong> to{" "}
                  <strong className="text-amber-300">{Math.min(currentShopPageClamped * SHOPS_PER_PAGE, filteredShops.length)}</strong> of{" "}
                  <strong className="text-amber-300">{filteredShops.length}</strong> shops
                </span>

                {totalShopPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentShopPageClamped === 1}
                      onClick={() => setShopPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 rounded-lg bg-[#200f07] text-amber-300 border border-orange-500/30 hover:bg-[#32170a] font-bold disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalShopPages }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setShopPage(num)}
                        className={`w-8 h-8 rounded-lg font-bold transition-all cursor-pointer ${
                          num === currentShopPageClamped
                            ? "bg-amber-500 text-stone-950 font-black shadow-xs"
                            : "bg-[#200f07] text-stone-300 border border-orange-500/20 hover:text-amber-200"
                        }`}
                      >
                        {num}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={currentShopPageClamped === totalShopPages}
                      onClick={() => setShopPage((p) => Math.min(totalShopPages, p + 1))}
                      className="px-3 py-1.5 rounded-lg bg-[#200f07] text-amber-300 border border-orange-500/30 hover:bg-[#32170a] font-bold disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            {filteredShops.length === 0 && (
              <div className="py-16 text-center text-xs text-stone-400 space-y-3 bg-[#120703]/60 border border-orange-500/20 rounded-2xl">
                <Store className="w-8 h-8 text-amber-400/50 mx-auto" />
                <p className="text-sm font-medium">
                  {shopSearchQuery.trim()
                    ? `No shops found matching "${shopSearchQuery}".`
                    : shopViewMode === "archived"
                    ? "No archived/soft-deleted shops in the system."
                    : "No shops registered yet."}
                </p>
                {shopSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setShopSearchQuery("")}
                    className="px-4 py-1.5 rounded-lg bg-[#200f07] border border-orange-500/30 text-amber-300 font-bold cursor-pointer"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DISH MANAGEMENT STUDIO */}
        {activeTab === "dishes" && (
          <div className="space-y-6">
            {/* Active Shop Selector Bar */}
            <div className="bg-[#120703] border border-orange-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-stone-300 font-bold">Active Shop:</span>
                <select
                  value={activeShop.id}
                  onChange={(e) => setActiveShopId(e.target.value)}
                  className="bg-[#200f07] border border-orange-500/40 rounded-xl px-3 py-1.5 text-xs text-amber-200 font-bold outline-none cursor-pointer"
                >
                  {activeShopsList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                {/* Real-time visitors badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{activeShop.visitorsCount || 0} Visitors</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenEditShop(activeShop)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 text-stone-300 hover:text-amber-200 border border-stone-700 text-xs font-bold cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5 text-amber-400" />
                  <span>Edit Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenQrModal(activeShop)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-yellow-300 border border-yellow-500/40 text-xs font-bold cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR Standee</span>
                </button>
              </div>
            </div>

            {/* Dishes Management Table */}
            <ItemTable
              onAddNew={handleAddNewDish}
              onEdit={handleEditDish}
              shopId={activeShop.id}
            />
          </div>
        )}
      </div>

      {/* Item Add/Edit Modal */}
      <ItemFormModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setEditingItem(null);
        }}
        editItem={editingItem}
        shopId={activeShop.id}
      />

      {/* QR Code Modal & Standee Generator */}
      <QrModal
        shop={qrModalShop}
        isOpen={isQrModalOpen}
        onClose={() => {
          setIsQrModalOpen(false);
          setQrModalShop(null);
        }}
      />

      {/* Register Shop Modal (Admin Only) */}
      <RegisterShopModal
        isOpen={isRegisterShopOpen}
        onClose={() => setIsRegisterShopOpen(false)}
        onRegister={(newShop) => {
          registerShop(newShop);
        }}
      />

      {/* Edit Shop Details Modal */}
      <EditShopModal
        shop={editingShop}
        isOpen={isEditShopOpen}
        onClose={() => {
          setIsEditShopOpen(false);
          setEditingShop(null);
        }}
        onSave={(shopId, updatedData) => {
          updateShop(shopId, updatedData);
        }}
      />
    </div>
  );
}
