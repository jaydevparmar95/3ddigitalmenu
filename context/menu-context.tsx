"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { MenuItem, Category } from "@/types/menu";
import { INITIAL_MENU_ITEMS, MENU_CATEGORIES } from "@/data/default-menu";

interface MenuContextType {
  items: MenuItem[];
  categories: Category[];
  addItem: (item: Omit<MenuItem, "id">) => MenuItem;
  updateItem: (id: string, item: Partial<MenuItem>) => void;
  deleteItem: (id: string) => void;
  resetToDefaults: () => void;
  isLoaded: boolean;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

const LOCAL_STORAGE_MENU_KEY = "pizza_world_menu_items_v5";

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_MENU_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(LOCAL_STORAGE_MENU_KEY, JSON.stringify(items));
      } catch {
        // ignore
      }
    }
  }, [items, isLoaded]);

  const addItem = (newItemData: Omit<MenuItem, "id">): MenuItem => {
    const newItem: MenuItem = {
      ...newItemData,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setItems((prev) => [newItem, ...prev]);
    return newItem;
  };

  const updateItem = (id: string, updatedData: Partial<MenuItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedData } : item))
    );
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const resetToDefaults = () => {
    setItems(INITIAL_MENU_ITEMS);
    try {
      localStorage.setItem(LOCAL_STORAGE_MENU_KEY, JSON.stringify(INITIAL_MENU_ITEMS));
    } catch {
      // ignore
    }
  };

  return (
    <MenuContext.Provider
      value={{
        items,
        categories: MENU_CATEGORIES,
        addItem,
        updateItem,
        deleteItem,
        resetToDefaults,
        isLoaded,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
}
