import { Cinzel, Playfair_Display, Syncopate } from "next/font/google";

/*
 * Display fonts for the "Our Partners" wordmarks only (one per brand).
 * Exception to DESIGN.md §3 (Poppins only): these are decorative text marks,
 * not UI text. They are our own typesetting, not the brands' logos.
 */
export const partnerSerif = Playfair_Display({
  subsets: ["latin"],
  weight: ["900"],
  display: "swap",
});

export const partnerRoman = Cinzel({
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

export const partnerWide = Syncopate({
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});
