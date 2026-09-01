"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "glow" | "gold";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none rounded-xl active:scale-[0.97]";

    const variantStyles = {
      primary:
        "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-stone-950 font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:brightness-110 border border-amber-400/30",
      gold:
        "bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 text-stone-950 font-bold shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/35 hover:brightness-105 border border-yellow-200/50",
      secondary:
        "bg-stone-900/80 hover:bg-stone-800 text-stone-100 border border-stone-700/60 shadow-sm backdrop-blur-md hover:border-stone-600",
      outline:
        "bg-transparent hover:bg-white/5 text-stone-200 border border-stone-700 hover:border-amber-500/60 hover:text-amber-300",
      ghost:
        "bg-transparent hover:bg-stone-800/60 text-stone-300 hover:text-stone-100",
      danger:
        "bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 hover:border-rose-500/50",
      glow:
        "bg-stone-950 text-amber-400 border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:border-amber-400",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5 rounded-lg",
      md: "text-sm px-4 py-2.5 gap-2",
      lg: "text-base px-6 py-3.5 gap-2.5 rounded-2xl",
      icon: "h-10 w-10 p-0 rounded-xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
