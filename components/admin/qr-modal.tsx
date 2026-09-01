"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Shop } from "@/types/shop";
import {
  QrCode,
  Download,
  Copy,
  Check,
  ExternalLink,
  X,
  Share2,
  Smartphone,
} from "lucide-react";

interface QrModalProps {
  shop: Shop | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QrModal({ shop, isOpen, onClose }: QrModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [origin, setOrigin] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const menuUrl = shop ? `${origin}/menu/${shop.id}` : origin;

  useEffect(() => {
    if (!shop || !isOpen) return;

    QRCode.toDataURL(menuUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: "#063d23",
        light: "#ffffff",
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR Generation Error:", err));
  }, [shop, isOpen, menuUrl]);

  if (!isOpen || !shop) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(menuUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  // Generate and download a branded, high-res printable table standee card
  const handleDownloadStandee = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 1100;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background Gradient (Parchment & Emerald Luxury)
    const bgGradient = ctx.createLinearGradient(0, 0, 0, 1100);
    bgGradient.addColorStop(0, "#031c10");
    bgGradient.addColorStop(0.3, "#073b22");
    bgGradient.addColorStop(1, "#02140b");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 800, 1100);

    // Outer Gold Foil Border
    ctx.strokeStyle = "#eab308";
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, 740, 1040);

    // Inner Hairline Border
    ctx.strokeStyle = "rgba(250, 204, 21, 0.4)";
    ctx.lineWidth = 2;
    ctx.strokeRect(45, 45, 710, 1010);

    // Corner Ornaments
    ctx.fillStyle = "#fde047";
    ctx.font = "24px serif";
    ctx.fillText("❖", 55, 75);
    ctx.fillText("❖", 725, 75);
    ctx.fillText("❖", 55, 1035);
    ctx.fillText("❖", 725, 1035);

    // Shop Name
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px 'Cinzel', Georgia, serif";
    ctx.fillText(shop.name, 400, 140);

    // Tagline
    ctx.fillStyle = "#fef08a";
    ctx.font = "bold 20px 'Inter', sans-serif";
    ctx.fillText(shop.tagline, 400, 185);

    // Gold Divider Line
    ctx.strokeStyle = "#eab308";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(250, 215);
    ctx.lineTo(550, 215);
    ctx.stroke();

    // Call to Action
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px 'Inter', sans-serif";
    ctx.fillText("📖 SCAN FOR 3D DIGITAL MENU", 400, 275);

    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.font = "16px 'Inter', sans-serif";
    ctx.fillText("Point your phone camera to flip through live pages", 400, 310);

    // Draw White Card for QR Code
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 10;
    ctx.beginPath();
    ctx.roundRect(175, 360, 450, 450, 24);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Draw QR Code Image onto Canvas
    const qrImg = new Image();
    qrImg.crossOrigin = "anonymous";
    qrImg.onload = () => {
      ctx.drawImage(qrImg, 200, 385, 400, 400);

      // Highlights / Footer Text
      ctx.fillStyle = "#fde047";
      ctx.font = "bold 18px 'Inter', sans-serif";
      ctx.fillText(shop.features[0] || "Freshly Handcrafted Daily", 400, 870);

      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.font = "16px 'Inter', sans-serif";
      ctx.fillText(`Timings: ${shop.timings}`, 400, 915);
      ctx.fillText(`Orders & Booking: ${shop.phone}`, 400, 950);

      ctx.fillStyle = "rgba(250, 204, 21, 0.7)";
      ctx.font = "14px 'Inter', sans-serif";
      ctx.fillText("⚡ Powered by 3D Digital Menu Studio", 400, 1010);

      // Trigger Download
      const downloadLink = document.createElement("a");
      downloadLink.download = `${shop.id}-table-standee-qr.png`;
      downloadLink.href = canvas.toDataURL("image/png");
      downloadLink.click();
    };
    qrImg.src = qrDataUrl;
  };

  const shareText = `Check out the live 3D Digital Menu for ${shop.name}: ${menuUrl}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md max-h-[92vh] flex flex-col bg-[#041a10] border-2 border-yellow-500/50 rounded-2xl p-4 sm:p-5 shadow-2xl text-[#f7f2ea] my-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto pr-1 space-y-3.5 custom-scrollbar">
          {/* Header */}
          <div className="text-center space-y-0.5 pt-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-[10px] font-bold font-sans">
              <QrCode className="w-3 h-3" />
              <span>Unique Shop Menu QR Code</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-yellow-200 font-serif tracking-tight">
              {shop.name}
            </h2>
            <p className="text-[11px] text-stone-300 font-sans">
              {shop.tagline}
            </p>
          </div>

          {/* QR Code Container (Resized & Compact) */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="p-3 bg-white rounded-xl shadow-lg border-2 border-yellow-400/80">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`${shop.name} QR Code`}
                  className="w-40 h-40 sm:w-44 sm:h-44 object-contain"
                />
              ) : (
                <div className="w-40 h-40 sm:w-44 sm:h-44 flex items-center justify-center text-stone-500 text-xs">
                  Generating QR Code...
                </div>
              )}
            </div>

            <div className="text-center space-y-0.5">
              <div className="text-[11px] font-bold text-yellow-300 font-sans flex items-center justify-center gap-1">
                <Smartphone className="w-3 h-3" />
                <span>Scan to open 3D Digital Menu on any device</span>
              </div>
              <p className="text-[10px] text-stone-400 font-mono break-all px-2 max-w-xs">
                {menuUrl}
              </p>
            </div>
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {/* Download Standee Card */}
            <button
              type="button"
              onClick={handleDownloadStandee}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-stone-950 font-black text-xs shadow-md hover:scale-102 transition-transform cursor-pointer font-sans"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Standee</span>
            </button>

            {/* Copy Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 border border-yellow-500/40 text-yellow-300 hover:bg-stone-800 font-bold text-xs shadow-xs transition-colors cursor-pointer font-sans"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Menu URL</span>
                </>
              )}
            </button>

            {/* WhatsApp Share */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition-colors font-sans"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share WhatsApp</span>
            </a>

            {/* Open 3D Menu */}
            <a
              href={menuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 font-bold text-xs shadow-xs transition-colors font-sans"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview Menu</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
