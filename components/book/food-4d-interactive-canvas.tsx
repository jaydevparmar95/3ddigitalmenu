"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { ShopMenuItem } from "@/types/shop";
import { FoodTypeBadge } from "@/components/book/book-page";
import { Star, Flame, Utensils } from "lucide-react";

interface Food4DInteractiveCanvasProps {
  item: ShopMenuItem;
  onInspect?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
  type: "steam" | "ember" | "sparkle";
}

export function Food4DInteractiveCanvas({ item, onInspect }: Food4DInteractiveCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number; glareX: number; glareY: number; isInteracting: boolean }>({
    x: 0,
    y: 0,
    glareX: 50,
    glareY: 50,
    isInteracting: false,
  });

  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Initialize and run high-performance canvas particle simulation (Steam & Embers)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth || 300);
    let height = (canvas.height = canvas.offsetHeight || 200);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || 300;
      height = canvas.height = canvas.offsetHeight || 200;
    };
    window.addEventListener("resize", handleResize);

    const spawnParticle = () => {
      if (particlesRef.current.length > 25) return;
      const isSteam = Math.random() > 0.4;
      if (isSteam) {
        // Steam wisp
        particlesRef.current.push({
          x: width * (0.2 + Math.random() * 0.6),
          y: height * 0.95,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -0.6 - Math.random() * 0.6,
          size: 6 + Math.random() * 10,
          opacity: 0.15 + Math.random() * 0.25,
          color: "255, 255, 255",
          life: 0,
          maxLife: 60 + Math.random() * 40,
          type: "steam",
        });
      } else {
        // Golden spice ember
        particlesRef.current.push({
          x: width * (0.15 + Math.random() * 0.7),
          y: height * 0.9,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -0.8 - Math.random() * 0.8,
          size: 1 + Math.random() * 2,
          opacity: 0.6 + Math.random() * 0.4,
          color: Math.random() > 0.5 ? "250, 204, 21" : "245, 158, 11",
          life: 0,
          maxLife: 40 + Math.random() * 30,
          type: "ember",
        });
      }
    };

    let lastSpawn = Date.now();

    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      if (Date.now() - lastSpawn > 180) {
        spawnParticle();
        lastSpawn = Date.now();
      }

      particlesRef.current = particlesRef.current.filter((p) => {
        p.life++;
        p.x += p.vx + Math.sin(p.life * 0.08) * 0.3;
        p.y += p.vy;

        if (p.type === "steam") {
          p.size += 0.15;
          const progress = p.life / p.maxLife;
          const alpha = progress < 0.3 ? progress * 3 * p.opacity : (1 - progress) * p.opacity;

          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          grad.addColorStop(0, `rgba(${p.color}, ${alpha})`);
          grad.addColorStop(1, `rgba(${p.color}, 0)`);
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.restore();
        } else {
          // Ember
          const progress = p.life / p.maxLife;
          const alpha = (1 - progress) * p.opacity;

          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
          ctx.shadowColor = `rgba(${p.color}, 1)`;
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.restore();
        }

        return p.life < p.maxLife;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Pointer move interactive 3D Parallax & Specular Glare Tracking
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = -((y - centerY) / centerY) * 12; // Max 12 deg tilt
    const rotY = ((x - centerX) / centerX) * 12;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({
      x: rotX,
      y: rotY,
      glareX,
      glareY,
      isInteracting: true,
    });
  }, []);

  const handlePointerLeave = useCallback(() => {
    setTilt({
      x: 0,
      y: 0,
      glareX: 50,
      glareY: 50,
      isInteracting: false,
    });
  }, []);

  // Interactive particle burst on tap/click
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8 + (Math.random() - 0.5) * 0.5;
      const speed = 1.5 + Math.random() * 2;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        size: 1.5 + Math.random() * 2,
        opacity: 0.9,
        color: "250, 204, 21",
        life: 0,
        maxLife: 25 + Math.random() * 15,
        type: "ember",
      });
    }
  }, []);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onClick={onInspect}
      className="relative w-full aspect-[16/11] bg-stone-950 overflow-hidden select-none cursor-pointer group"
      style={{ perspective: 800 }}
    >
      {/* 4D Stage: Hardware-accelerated 3D Transform */}
      <div
        className={`w-full h-full relative transition-transform ease-out duration-150 ${
          !tilt.isInteracting ? "animate-food-4d-cinematic animate-food-4d-shadow" : ""
        }`}
        style={
          tilt.isInteracting
            ? {
                transform: `rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg) scale3d(1.08, 1.08, 1.08) translateZ(15px)`,
                transformStyle: "preserve-3d",
                filter: "drop-shadow(0 15px 30px rgba(0,0,0,0.9)) drop-shadow(0 0 15px rgba(250,204,21,0.4))",
              }
            : {}
        }
      >
        {/* Dish Image */}
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-600 bg-stone-900">
            <Utensils className="w-7 h-7 text-stone-700" />
          </div>
        )}

        {/* Dynamic Specular Point Glare tracking pointer */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: tilt.isInteracting
              ? `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.45) 0%, rgba(250,204,21,0.2) 25%, transparent 60%)`
              : undefined,
            opacity: tilt.isInteracting ? 1 : 0,
          }}
        />

        {/* Ambient Sunlight & Caustics Sweep */}
        {!tilt.isInteracting && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="w-2/3 h-[200%] bg-gradient-to-r from-transparent via-yellow-200/25 to-transparent animate-food-4d-caustics blur-xs" />
          </div>
        )}

        {/* Golden Diamond Lens Flare Gleam */}
        <div className="absolute top-1/3 right-1/3 w-3 h-3 pointer-events-none z-10">
          <div className="w-full h-full text-yellow-200 animate-food-gleam flex items-center justify-center font-bold text-xs">
            ✦
          </div>
        </div>
      </div>

      {/* 4D Canvas Layer: Fluid Steam & Sizzle Embers Simulation */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Top Floating Badges (Left) */}
      <div className="absolute top-1.5 left-1.5 flex items-center gap-1 z-20">
        <FoodTypeBadge isVeg={Boolean(item.isVeg)} />

        {item.isBestseller && (
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500 text-stone-950 font-black text-[8.5px] shadow-sm font-sans">
            <Star className="w-2 h-2 fill-stone-950" />
            <span className="hidden sm:inline">Bestseller</span>
          </span>
        )}

        {item.isSpicy && (
          <span className="flex items-center px-1.5 py-0.5 rounded bg-red-600 text-white font-bold text-[8.5px] shadow-sm font-sans">
            <Flame className="w-2 h-2 fill-white" />
          </span>
        )}
      </div>

      {/* Bottom Vignette Gradient */}
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none z-10" />
    </div>
  );
}
