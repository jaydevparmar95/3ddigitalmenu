import React from "react";
import { getAllShopsFromDb } from "@/lib/db";
import { DEFAULT_SHOPS } from "@/data/default-shops";
import { PublicShopDirectory } from "@/components/public/public-shop-directory";

export const dynamic = "force-dynamic";

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
