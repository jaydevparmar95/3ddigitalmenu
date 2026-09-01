"use client";

import React from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CounterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Counter({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
  className,
}: CounterProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const sizeMap = {
    sm: {
      button: "w-6 h-6 text-xs",
      text: "text-xs min-w-[20px]",
      container: "p-0.5 gap-1",
    },
    md: {
      button: "w-8 h-8 text-sm",
      text: "text-sm min-w-[24px]",
      container: "p-1 gap-2",
    },
    lg: {
      button: "w-10 h-10 text-base",
      text: "text-base min-w-[32px]",
      container: "p-1.5 gap-3",
    },
  };

  const currentSize = sizeMap[size];

  return (
    <div
      className={cn(
        "inline-flex items-center bg-stone-900 border border-stone-700/80 rounded-xl shadow-inner",
        currentSize.container,
        className
      )}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        className={cn(
          "flex items-center justify-center rounded-lg text-stone-300 hover:text-stone-100 hover:bg-stone-800 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none",
          currentSize.button
        )}
        aria-label="Decrease quantity"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <span
        className={cn(
          "font-semibold text-center text-stone-100 select-none tabular-nums",
          currentSize.text
        )}
      >
        {value}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        className={cn(
          "flex items-center justify-center rounded-lg text-stone-300 hover:text-stone-100 hover:bg-stone-800 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none",
          currentSize.button
        )}
        aria-label="Increase quantity"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
