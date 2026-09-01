import React from "react";
import { cn } from "@/lib/utils";
import { DietaryTag } from "@/types/menu";
import {
  Leaf,
  Sprout,
  WheatOff,
  Flame,
  Award,
  Sparkles,
  ShieldCheck,
  Ban,
} from "lucide-react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "outline"
    | "success"
    | "warning"
    | "danger"
    | "chef"
    | "glow";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "sm",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-stone-800/80 text-stone-300 border-stone-700/60",
    primary: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    secondary: "bg-stone-900/90 text-stone-200 border-stone-700",
    outline: "bg-transparent text-stone-300 border-stone-700",
    success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    danger: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    chef: "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-200 border-amber-400/40 shadow-sm shadow-amber-500/10",
    glow: "bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 gap-1 rounded-md font-medium tracking-wide",
    md: "text-xs px-2.5 py-1 gap-1.5 rounded-lg font-medium",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center border transition-all duration-200 select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function DietaryBadge({ tag, size = "sm" }: { tag: DietaryTag; size?: "sm" | "md" }) {
  const map: Record<
    DietaryTag,
    { label: string; icon: React.ReactNode; variant: BadgeProps["variant"] }
  > = {
    vegetarian: {
      label: "Vegetarian",
      icon: <Sprout className="w-3 h-3 text-emerald-400" />,
      variant: "success",
    },
    vegan: {
      label: "Vegan",
      icon: <Leaf className="w-3 h-3 text-teal-400" />,
      variant: "success",
    },
    "gluten-free": {
      label: "Gluten-Free",
      icon: <WheatOff className="w-3 h-3 text-amber-400" />,
      variant: "warning",
    },
    "chef-special": {
      label: "Chef Special",
      icon: <Award className="w-3 h-3 text-amber-300" />,
      variant: "chef",
    },
    spicy: {
      label: "Spicy",
      icon: <Flame className="w-3 h-3 text-rose-400" />,
      variant: "danger",
    },
    organic: {
      label: "Organic",
      icon: <Sparkles className="w-3 h-3 text-emerald-300" />,
      variant: "success",
    },
    halal: {
      label: "Halal",
      icon: <ShieldCheck className="w-3 h-3 text-blue-400" />,
      variant: "primary",
    },
  };

  const config = map[tag];
  if (!config) return null;

  return (
    <Badge variant={config.variant} size={size}>
      {config.icon}
      <span>{config.label}</span>
    </Badge>
  );
}
