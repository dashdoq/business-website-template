import type { Metadata } from "next";
import Link from "next/link";
import { CloseIcon } from "@/components/Icons";
import { ProductCard } from "@/components/ProductCard";
import { FilterPanel } from "@/components/shop/FilterPanel";
import { Pagination } from "@/components/shop/Pagination";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { SortBar } from "@/components/shop/SortBar";
import { getCategories, getColor, getColors, getProducts, parseProductQuery } from "@/lib/catalog";
import { preservedParams, shopHref } from "@/lib/shopUrl";
import type { ProductQuery } from "@/lib/types";

type ShopPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  const query = parseProductQuery(await searchParams);
  const category = query.categorie
    ? (await getCategories()).find((c) => c.slug === query.categorie)
    : undefined;
  return {
    title: category ? `${category.name} | Shop` : "Shop",
    description: category?.description ?? "Alle sokken en kousen van woolup, in wol en in kleine oplage.",
    alternates: { canonical: category ? `/shop?categorie=${category.slug}` : "/shop" },
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const query = parseProductQuery(await searchParams);
  const [result, categories, colors] = await Promise.all([
    getProducts(query),
    getCategories(),
    getColors(),
  ]);
  const totalProducts = categories.reduce((sum, c) => sum + c.count, 0);
  const category = categories.find((c) => c.slug === query.categorie);
  const chips = activeChips(query, category?.name);

  return (
    <div className="wrap pt-8 lg:pt-12">
      <nav aria-label="Kruimelpad" className="mb-4 text-sm text-stone">
        <ol className="flex gap-2">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>{category ? <Link href="/shop" className="hover:underline">Shop</Link> : <span aria-current="page">Shop</span>}</li>
          {category && (
            <>
              <li aria-hidden="true">/</li>
              <li aria-current="page">{category.name}</li>
            </>
          )}
        </ol>
      </nav>

      <header className="mb-8 max-w-2xl space-y-3 lg:mb-10">
        <h1 className="display-lg">{category?.name ?? "Alle sokken"}</h1>
        <p className="text-stone">
          {category?.description ?? "Sokken en kousen van wol, per model in een beperkte oplage."}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[17rem_1fr] lg:gap-8">
        <aside aria-label="Filters">
          <FilterPanel activeCount={chips.length}>
            <ShopFilters query={query} categories={categories} colors={colors} totalProducts={totalProducts} />
          </FilterPanel>
        </aside>

        <div className="min-w-0 space-y-4">
          <SortBar
            key={shopHref(query)}
            from={result.from}
            to={result.to}
            total={result.total}
            sort={query.sort ?? "nieuwste"}
            perPage={result.perPage}
            preserved={preservedParams(query, ["sort", "perPage"])}
          />

          {chips.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Actieve filters">
              {chips.map((chip) => (
                <li key={chip.label}>
                  <Link
                    href={shopHref(query, chip.clear)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-ink py-1.5 pr-2.5 pl-3 text-sm hover:bg-ink hover:text-paper"
                  >
                    {chip.label}
                    <CloseIcon className="size-4" />
                    <span className="sr-only">filter wissen</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {result.items.length > 0 ? (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4 xl:grid-cols-4">
              {result.items.map((product, index) => (
                <li key={product.slug}>
                  <ProductCard product={product} priority={index < 4} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-4 border border-line px-6 py-16 text-center">
              <p className="text-lg">Geen sokken gevonden met deze filters.</p>
              <p className="text-stone">Haal een filter weg of zoek op een ander woord.</p>
              <Link href="/shop" className="btn-primary">
                Alle filters wissen
              </Link>
            </div>
          )}

          <Pagination query={query} page={result.page} pageCount={result.pageCount} />
        </div>
      </div>
    </div>
  );
}

type Chip = { label: string; clear: Partial<Record<keyof ProductQuery, null>> };

function activeChips(query: ProductQuery, categoryName?: string): Chip[] {
  const chips: Chip[] = [];
  if (query.q) chips.push({ label: `“${query.q}”`, clear: { q: null } });
  if (categoryName) chips.push({ label: categoryName, clear: { categorie: null } });
  if (query.kleur) chips.push({ label: getColor(query.kleur).name, clear: { kleur: null } });
  if (query.maat) chips.push({ label: `Maat ${query.maat}`, clear: { maat: null } });
  if (query.min !== undefined || query.max !== undefined) {
    const label =
      query.min !== undefined && query.max !== undefined
        ? `€${query.min} tot €${query.max}`
        : query.min !== undefined
          ? `Vanaf €${query.min}`
          : `Tot €${query.max}`;
    chips.push({ label, clear: { min: null, max: null } });
  }
  return chips;
}
