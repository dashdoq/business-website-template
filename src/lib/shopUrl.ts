import type { ProductQuery } from "@/lib/types";

type Overrides = Partial<Record<keyof ProductQuery, string | number | undefined | null>>;

const PARAM_NAMES: Record<keyof ProductQuery, string> = {
  q: "q",
  categorie: "categorie",
  kleur: "kleur",
  maat: "maat",
  min: "min",
  max: "max",
  sort: "sort",
  perPage: "toon",
  page: "pagina",
};

/**
 * Builds a /shop URL from the current filters plus changes. Any change other
 * than paging sends you back to page 1. Pass null to drop a filter.
 */
export function shopHref(current: ProductQuery, overrides: Overrides = {}): string {
  const merged: Overrides = { ...current, ...overrides };
  if (!("page" in overrides)) merged.page = undefined;

  const params = new URLSearchParams();
  for (const key of Object.keys(PARAM_NAMES) as (keyof ProductQuery)[]) {
    const value = merged[key];
    if (value === undefined || value === null || value === "") continue;
    if (key === "page" && Number(value) <= 1) continue;
    params.set(PARAM_NAMES[key], String(value));
  }
  const query = params.toString();
  return query ? `/shop?${query}` : "/shop";
}

/** Hidden inputs that keep the other filters when a form submits one of them. */
export function preservedParams(current: ProductQuery, omit: (keyof ProductQuery)[]) {
  return (Object.keys(PARAM_NAMES) as (keyof ProductQuery)[])
    .filter((key) => !omit.includes(key) && key !== "page")
    .map((key) => ({ name: PARAM_NAMES[key], value: current[key] }))
    .filter((entry): entry is { name: string; value: string | number } => entry.value !== undefined);
}

export function hasActiveFilters(query: ProductQuery): boolean {
  return Boolean(
    query.q || query.categorie || query.kleur || query.maat || query.min !== undefined || query.max !== undefined,
  );
}
