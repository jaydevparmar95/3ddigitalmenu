import React from "react";
import { MenuBook } from "@/components/book/menu-book";
import { DEFAULT_SHOPS } from "@/data/default-shops";

// Pre-generate static params for default shops
export function generateStaticParams() {
  return DEFAULT_SHOPS.map((shop) => ({
    shopId: shop.id,
  }));
}

export default async function ShopMenuPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  const { shopId } = await params;
  return <MenuBook shopId={shopId} />;
}
