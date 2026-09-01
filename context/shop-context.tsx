"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Shop, ShopMenuItem, ShopCategory } from "@/types/shop";
import { DEFAULT_SHOPS } from "@/data/default-shops";

interface ShopContextType {
  shops: Shop[];
  activeShopId: string;
  activeShop: Shop;
  setActiveShopId: (id: string) => void;
  registerShop: (
    newShop: Omit<Shop, "id" | "createdAt" | "items"> & { id?: string; initialItems?: ShopMenuItem[] }
  ) => Promise<Shop>;
  updateShop: (id: string, updatedData: Partial<Shop>) => Promise<void>;
  deleteShop: (id: string) => Promise<void>;
  softDeleteShop: (id: string) => Promise<void>;
  restoreShop: (id: string) => Promise<void>;
  recordShopVisit: (id: string) => Promise<number>;
  addItemToShop: (shopId: string, item: Omit<ShopMenuItem, "id">) => Promise<ShopMenuItem>;
  updateItemInShop: (shopId: string, itemId: string, item: Partial<ShopMenuItem>) => Promise<void>;
  deleteItemFromShop: (shopId: string, itemId: string) => Promise<void>;
  addCategoryToShop: (shopId: string, category: ShopCategory) => Promise<void>;
  deleteCategoryFromShop: (shopId: string, categoryId: string) => Promise<void>;
  getShopById: (shopId: string) => Shop | undefined;
  refreshFromDb: () => Promise<void>;
  isLoaded: boolean;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [shops, setShops] = useState<Shop[]>(DEFAULT_SHOPS);
  const [activeShopId, setActiveShopId] = useState<string>("pizza-world");
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Fetch all shops directly from MySQL Database via API
  const refreshFromDb = useCallback(async () => {
    try {
      const res = await fetch("/api/shops");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.shops) && data.shops.length > 0) {
          const uniqueShops: Shop[] = data.shops.filter(
            (s: Shop, idx: number, self: Shop[]) => self.findIndex((t) => t.id === s.id) === idx
          );
          setShops(uniqueShops);
          if (!uniqueShops.some((s: Shop) => s.id === activeShopId)) {
            setActiveShopId(uniqueShops[0]?.id || "pizza-world");
          }
        }
      }
    } catch (err) {
      console.warn("Could not fetch shops from MySQL, using initial data:", err);
    } finally {
      setIsLoaded(true);
    }
  }, [activeShopId]);

  useEffect(() => {
    refreshFromDb();
  }, [refreshFromDb]);

  const activeShop = shops.find((s) => s.id === activeShopId) || shops[0] || DEFAULT_SHOPS[0];

  // 1. Register Shop in MySQL
  const registerShop = async (
    newShopData: Omit<Shop, "id" | "createdAt" | "items"> & { id?: string; initialItems?: ShopMenuItem[] }
  ): Promise<Shop> => {
    try {
      const res = await fetch("/api/shops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newShopData),
      });
      const data = await res.json();
      if (data.success && data.shop) {
        setShops((prev) => {
          const filtered = prev.filter((s) => s.id !== data.shop.id);
          return [...filtered, data.shop];
        });
        setActiveShopId(data.shop.id);
        return data.shop;
      }
    } catch (err) {
      console.error("Failed to register shop in MySQL:", err);
    }

    // Fallback local state if API is offline
    const slug = (newShopData.id || newShopData.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-");
    const fallbackShop: Shop = {
      ...newShopData,
      id: slug || `shop-${Date.now().toString(36)}`,
      items: newShopData.initialItems || [],
      createdAt: new Date().toISOString(),
    };
    setShops((prev) => [...prev, fallbackShop]);
    setActiveShopId(fallbackShop.id);
    return fallbackShop;
  };

  // 2. Update Shop in MySQL
  const updateShop = async (id: string, updatedData: Partial<Shop>) => {
    setShops((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedData } : s))
    );

    try {
      await fetch(`/api/shops/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
    } catch (err) {
      console.error("Failed to update shop in MySQL:", err);
    }
  };

  // 3. Soft Delete Shop in MySQL
  const softDeleteShop = async (id: string) => {
    setShops((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isDeleted: true } : s))
    );

    try {
      await fetch(`/api/shops/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to soft-delete shop in MySQL:", err);
    }
  };

  // 4. Restore Shop in MySQL
  const restoreShop = async (id: string) => {
    setShops((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isDeleted: false } : s))
    );

    try {
      await fetch(`/api/shops/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", isDeleted: false }),
      });
    } catch (err) {
      console.error("Failed to restore shop in MySQL:", err);
    }
  };

  // 5. Permanent Delete Shop in MySQL
  const deleteShop = async (id: string) => {
    setShops((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (activeShopId === id) {
        setActiveShopId(filtered[0]?.id || "pizza-world");
      }
      return filtered;
    });

    try {
      await fetch(`/api/shops/${id}?permanent=true`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete shop in MySQL:", err);
    }
  };

  // 6. Record Real-time Unique Shop Visit (Deduplicated per browser)
  const recordShopVisit = async (id: string): Promise<number> => {
    try {
      let visitorId = "";
      try {
        visitorId = typeof window !== "undefined" ? localStorage.getItem("digital_menu_browser_visitor_id") || "" : "";
        if (!visitorId && typeof window !== "undefined") {
          visitorId = `vid_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
          localStorage.setItem("digital_menu_browser_visitor_id", visitorId);
        }
      } catch {}

      const localKey = `visited_shop_${id}`;
      const alreadyVisitedLocally = typeof window !== "undefined" && Boolean(localStorage.getItem(localKey));

      if (alreadyVisitedLocally) {
        // Just fetch current count from GET
        const res = await fetch(`/api/shops/${id}/visit`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && typeof data.visitorsCount === "number") {
            setShops((prev) =>
              prev.map((s) => (s.id === id ? { ...s, visitorsCount: data.visitorsCount } : s))
            );
            return data.visitorsCount;
          }
        }
        return 0;
      }

      const res = await fetch(`/api/shops/${id}/visit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && typeof data.visitorsCount === "number") {
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(localKey, Date.now().toString());
            } catch {}
          }
          setShops((prev) =>
            prev.map((s) => (s.id === id ? { ...s, visitorsCount: data.visitorsCount } : s))
          );
          return data.visitorsCount;
        }
      }
    } catch (err) {
      console.error("Failed to record unique shop visit:", err);
    }
    return 0;
  };

  // 4. Add Item to Shop in MySQL
  const addItemToShop = async (
    shopId: string,
    itemData: Omit<ShopMenuItem, "id">
  ): Promise<ShopMenuItem> => {
    const tempId = `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const optimisticItem: ShopMenuItem = { ...itemData, id: tempId };

    setShops((prev) =>
      prev.map((shop) => {
        if (shop.id === shopId) {
          return {
            ...shop,
            items: [optimisticItem, ...shop.items],
          };
        }
        return shop;
      })
    );

    try {
      const res = await fetch(`/api/shops/${shopId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      });
      const data = await res.json();
      if (data.success && data.item) {
        setShops((prev) =>
          prev.map((shop) => {
            if (shop.id === shopId) {
              return {
                ...shop,
                items: shop.items.map((it) => (it.id === tempId ? data.item : it)),
              };
            }
            return shop;
          })
        );
        return data.item;
      }
    } catch (err) {
      console.error("Failed to add dish to MySQL:", err);
    }

    return optimisticItem;
  };

  // 5. Update Item in MySQL
  const updateItemInShop = async (
    shopId: string,
    itemId: string,
    itemData: Partial<ShopMenuItem>
  ) => {
    setShops((prev) =>
      prev.map((shop) => {
        if (shop.id === shopId) {
          return {
            ...shop,
            items: shop.items.map((it) =>
              it.id === itemId ? { ...it, ...itemData } : it
            ),
          };
        }
        return shop;
      })
    );

    try {
      await fetch(`/api/shops/${shopId}/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      });
    } catch (err) {
      console.error("Failed to update dish in MySQL:", err);
    }
  };

  // 6. Delete Item from MySQL
  const deleteItemFromShop = async (shopId: string, itemId: string) => {
    setShops((prev) =>
      prev.map((shop) => {
        if (shop.id === shopId) {
          return {
            ...shop,
            items: shop.items.filter((it) => it.id !== itemId),
          };
        }
        return shop;
      })
    );

    try {
      await fetch(`/api/shops/${shopId}/items/${itemId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete dish from MySQL:", err);
    }
  };

  // 7. Add Category in MySQL
  const addCategoryToShop = async (shopId: string, category: ShopCategory) => {
    setShops((prev) =>
      prev.map((shop) => {
        if (shop.id === shopId) {
          if (shop.categories.some((c) => c.id === category.id)) return shop;
          return {
            ...shop,
            categories: [...shop.categories, category],
          };
        }
        return shop;
      })
    );

    try {
      await fetch(`/api/shops/${shopId}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
      });
    } catch (err) {
      console.error("Failed to add category in MySQL:", err);
    }
  };

  // 8. Delete Category in MySQL
  const deleteCategoryFromShop = async (shopId: string, categoryId: string) => {
    setShops((prev) =>
      prev.map((shop) => {
        if (shop.id === shopId) {
          return {
            ...shop,
            categories: shop.categories.filter((c) => c.id !== categoryId),
            items: shop.items.filter((it) => it.category !== categoryId),
          };
        }
        return shop;
      })
    );

    try {
      await fetch(`/api/shops/${shopId}/categories?categoryId=${categoryId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete category in MySQL:", err);
    }
  };

  const getShopById = (shopId: string): Shop | undefined => {
    return shops.find((s) => s.id === shopId);
  };

  return (
    <ShopContext.Provider
      value={{
        shops,
        activeShopId,
        activeShop,
        setActiveShopId,
        registerShop,
        updateShop,
        deleteShop,
        softDeleteShop,
        restoreShop,
        recordShopVisit,
        addItemToShop,
        updateItemInShop,
        deleteItemFromShop,
        addCategoryToShop,
        deleteCategoryFromShop,
        getShopById,
        refreshFromDb,
        isLoaded,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
}
