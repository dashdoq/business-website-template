// Shop options shared by server pages and client components. Kept apart from
// catalog.ts so client bundles do not pull in the product data.
import type { Size, SortKey } from "@/lib/types";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "nieuwste", label: "Nieuwste" },
  { value: "populair", label: "Populair" },
  { value: "prijs-laag", label: "Prijs laag-hoog" },
  { value: "prijs-hoog", label: "Prijs hoog-laag" },
];

export const PER_PAGE_OPTIONS = [12, 24, 36] as const;

export const SIZES: Size[] = ["35–38", "39–42", "43–46"];

export const PRICE_RANGES = [
  { label: "Tot €25", min: undefined, max: 25 },
  { label: "€25 tot €50", min: 25, max: 50 },
  { label: "Vanaf €50", min: 50, max: undefined },
] as const;
