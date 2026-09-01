import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "glow" | "elevated" | "flat";
  hoverEffect?: boolean;
}

export function Card({
  className,
  variant = "default",
  hoverEffect = false,
  children,
  ...props
}: CardProps) {
  const variantStyles = {
    default:
      "bg-stone-900/70 border border-stone-800/80 backdrop-blur-xl shadow-xl shadow-black/40",
    glass:
      "bg-stone-900/40 border border-white/10 backdrop-blur-2xl shadow-2xl shadow-black/50",
    glow:
      "bg-gradient-to-b from-stone-900/90 to-stone-950/90 border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.08)] backdrop-blur-xl",
    elevated:
      "bg-stone-900/90 border border-stone-700/60 shadow-2xl shadow-black/60 backdrop-blur-xl",
    flat: "bg-stone-900/50 border border-stone-800/50",
  };

  const hoverStyles = hoverEffect
    ? "transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/10"
    : "";

  return (
    <div
      className={cn(
        "rounded-2xl overflow-hidden relative",
        variantStyles[variant],
        hoverStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-5 pb-3", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-semibold tracking-tight text-stone-100", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-stone-400 mt-1", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-5 pt-0", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("p-5 pt-3 border-t border-stone-800/60 flex items-center", className)}
      {...props}
    >
      {children}
    </div>
  );
}
