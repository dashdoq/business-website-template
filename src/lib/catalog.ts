// The only place pages read products from. Today it reads the local example
// catalogue; when the Hostinger headless e-commerce backend is live, replace
// the bodies of these functions with API calls and keep the signatures.
import { categories, colors, products } from "@/content/products";
import type {
  Category,
  CategorySlug,
  Color,
  ColorSlug,
  Product,
  ProductPage,
  ProductQuery,
  Size,
  SortKey,
} from "@/lib/types";
import { PER_PAGE_OPTIONS, SORT_OPTIONS, SIZES } from "@/lib/shopOptions";

export { PER_PAGE_OPTIONS, PRICE_RANGES, SIZES, SORT_OPTIONS } from "@/lib/shopOptions";

const LOW_STOCK_THRESHOLD = 30;

const sorters: Record<SortKey, (a: Product, b: Product) => number> = {
  nieuwste: (a, b) => b.releasedAt.localeCompare(a.releasedAt),
  populair: (a, b) => b.popularity - a.popularity,
  "prijs-laag": (a, b) => a.price - b.price,
  "prijs-hoog": (a, b) => b.price - a.price,
};

export async function getCategories(): Promise<(Category & { count: number })[]> {
  return categories.map((category) => ({
    ...category,
    count: products.filter((p) => p.category === category.slug).length,
  }));
}

export async function getColors(): Promise<Color[]> {
  return colors;
}

export async function getProducts(query: ProductQuery = {}): Promise<ProductPage> {
  const perPage = query.perPage ?? PER_PAGE_OPTIONS[0];
  const needle = query.q?.trim().toLowerCase();

  const matches = products
    .filter((p) => !query.categorie || p.category === query.categorie)
    .filter((p) => !query.kleur || p.colors.includes(query.kleur))
    .filter((p) => !query.maat || p.sizes.includes(query.maat))
    .filter((p) => query.min === undefined || p.price >= query.min * 100)
    .filter((p) => query.max === undefined || p.price <= query.max * 100)
    .filter((p) => !needle || matchesSearch(p, needle))
    .sort(sorters[query.sort ?? "nieuwste"]);

  const total = matches.length;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, query.page ?? 1), pageCount);
  const start = (page - 1) * perPage;
  const items = matches.slice(start, start + perPage);

  return {
    items,
    total,
    page,
    perPage,
    pageCount,
    from: total === 0 ? 0 : start + 1,
    to: start + items.length,
  };
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return products.find((p) => p.slug === slug);
}

export async function getAllProductSlugs(): Promise<string[]> {
  return products.map((p) => p.slug);
}

export async function getNewArrivals(): Promise<Product[]> {
  return products.filter((p) => p.isNew).sort(sorters.nieuwste);
}

export async function getBestsellers(): Promise<Product[]> {
  return products.filter((p) => p.isBestseller).sort(sorters.populair);
}

export async function getRelated(product: Product, limit = 8): Promise<Product[]> {
  const sameCategory = products.filter(
    (p) => p.slug !== product.slug && p.category === product.category,
  );
  const others = products
    .filter((p) => p.slug !== product.slug && p.category !== product.category)
    .sort(sorters.populair);
  return [...sameCategory, ...others].slice(0, limit);
}

export async function getDropStats(drop: number) {
  const inDrop = products.filter((p) => p.drop === drop);
  return {
    drop,
    models: inDrop.length,
    edition: inDrop.reduce((sum, p) => sum + p.edition, 0),
    remaining: inDrop.reduce((sum, p) => sum + p.remaining, 0),
    lowestPrice: Math.min(...inDrop.map((p) => p.price)),
  };
}

export function getColor(slug: ColorSlug): Color {
  const color = colors.find((c) => c.slug === slug);
  if (!color) throw new Error(`Onbekende kleur: ${slug}`);
  return color;
}

export function getCategoryName(slug: CategorySlug): string {
  return categories.find((c) => c.slug === slug)?.name ?? slug;
}

export type StockState = "op-voorraad" | "laatste-paren" | "uitverkocht";

export function stockState(product: Product): StockState {
  if (product.remaining <= 0) return "uitverkocht";
  if (product.remaining <= LOW_STOCK_THRESHOLD) return "laatste-paren";
  return "op-voorraad";
}

export function discountPercent(product: Product): number | undefined {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) return undefined;
  return Math.round((1 - product.price / product.compareAtPrice) * 100);
}

function matchesSearch(product: Product, needle: string): boolean {
  const haystack = [
    product.name,
    product.summary,
    getCategoryName(product.category),
    ...product.colors.map((c) => getColor(c).name),
  ]
    .join(" ")
    .toLowerCase();
  return needle.split(/\s+/).every((word) => haystack.includes(word));
}

// URL parameters arrive as untrusted strings; only known values get through.
type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function positiveNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export function parseProductQuery(params: RawParams): ProductQuery {
  const categorie = first(params.categorie);
  const kleur = first(params.kleur);
  const maat = first(params.maat);
  const sort = first(params.sort);
  const perPage = positiveNumber(first(params.toon));
  const page = positiveNumber(first(params.pagina));

  return {
    q: first(params.q)?.slice(0, 80) || undefined,
    categorie: categories.find((c) => c.slug === categorie)?.slug,
    kleur: colors.find((c) => c.slug === kleur)?.slug,
    maat: SIZES.find((s) => s === maat),
    min: positiveNumber(first(params.min)),
    max: positiveNumber(first(params.max)),
    sort: SORT_OPTIONS.find((s) => s.value === sort)?.value,
    perPage: PER_PAGE_OPTIONS.find((n) => n === perPage),
    page: page ? Math.floor(page) : undefined,
  };
}
