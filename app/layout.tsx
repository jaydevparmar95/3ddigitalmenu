import type { Metadata, Viewport } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";
import { ShopProvider } from "@/context/shop-context";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["700", "800"], // Only weights used in the app; trimmed from 5 to reduce font payload
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#02140b",
};

export const metadata: Metadata = {
  title: "3D Digital Menu Studio | Multi-Shop Pizzeria, Chinese & Street Food",
  description:
    "Explore interactive 3D digital menus for Pizza World, Royal Chinese Wok, Mumbai Vadapav Center, and Delhi Pakodi with unique QR code table sharing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${cinzel.variable} ${inter.variable}`}
    >
      <body className="bg-[#03140c] text-[#fef2f2] min-h-screen antialiased selection:bg-emerald-600 selection:text-white">
        <ShopProvider>
            <main className="min-h-screen">{children}</main>
          </ShopProvider>
      </body>
    </html>
  );
}
