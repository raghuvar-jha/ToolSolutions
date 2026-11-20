import {
  Drill,
  HardHat,
  Ruler,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * The one category list used everywhere (DESIGN.md §5 "Category strip"):
 * desktop nav, mobile strip, and later the category pages.
 * Final list pending client confirmation (DESIGN.md §8 #1).
 */
export type Category = { name: string; slug: string; icon: LucideIcon };

export const CATEGORIES: Category[] = [
  { name: "Cutting & Drilling", slug: "cutting-drilling", icon: Drill },
  { name: "Power Tools", slug: "power-tools", icon: Zap },
  { name: "Measuring", slug: "measuring", icon: Ruler },
  { name: "Safety", slug: "safety", icon: HardHat },
  { name: "Clamping", slug: "clamping", icon: Wrench },
];

export const categoryHref = (slug: string) => `/category/${slug}`;
