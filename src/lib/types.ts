// Shapes the frontend relies on. When the Hostinger headless e-commerce
// backend is connected, map its responses onto these types in catalog.ts.

export type CategorySlug =
  | "dagelijks"
  | "wandel-outdoor"
  | "huissokken"
  | "kniekousen"
  | "cadeausets";

export type Category = {
  slug: CategorySlug;
  name: string;
  description: string;
};

export type ColorSlug =
  | "naturel"
  | "antraciet"
  | "zwart"
  | "loden"
  | "grijs"
  | "oker"
  | "bordeaux"
  | "nachtblauw";

export type Color = {
  slug: ColorSlug;
  name: string;
  hex: string;
};

export type Size = "35–38" | "39–42" | "43–46";

/** Prices are whole euro cents, so €19,95 is 1995. */
export type Cents = number;

export type Product = {
  slug: string;
  name: string;
  category: CategorySlug;
  /** One line under the name on the product page. */
  summary: string;
  description: string[];
  colors: ColorSlug[];
  sizes: Size[];
  price: Cents;
  /** Original price when the product is discounted. */
  compareAtPrice?: Cents;
  isNew: boolean;
  isBestseller: boolean;
  drop: number;
  /** Pairs made for this drop. */
  edition: number;
  /** Pairs still available. */
  remaining: number;
  material: string;
  care: string[];
  /** Paths under /public, e.g. "/images/products/ribbel/1.jpg". */
  images: string[];
  /** ISO date, used for "Nieuwste" sorting. */
  releasedAt: string;
  /** Higher sells better, used for "Populair" sorting. */
  popularity: number;
};

export type SortKey = "nieuwste" | "prijs-laag" | "prijs-hoog" | "populair";

export type ProductQuery = {
  q?: string;
  categorie?: CategorySlug;
  kleur?: ColorSlug;
  maat?: Size;
  min?: number;
  max?: number;
  sort?: SortKey;
  page?: number;
  perPage?: number;
};

export type ProductPage = {
  items: Product[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
  from: number;
  to: number;
};
