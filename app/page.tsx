import React from "react";
import { getAllShopsFromDb } from "@/lib/db";
import { DEFAULT_SHOPS } from "@/data/default-shops";
import { PublicShopDirectory } from "@/components/public/public-shop-directory";

// Revalidate every 30 seconds (ISR) \u2014 avoids a full DB query on every request
export const revalidate = 30;

export default async function HomePage() {
  let shops = DEFAULT_SHOPS;
  try {
    const dbShops = await getAllShopsFromDb();
    if (dbShops && dbShops.length > 0) {
      shops = dbShops;
    }
  } catch (err) {
    console.warn("Could not fetch shops from MySQL for homepage, using defaults:", err);
  }

  return <PublicShopDirectory initialShops={shops} />;
}
