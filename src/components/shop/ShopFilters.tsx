import Link from "next/link";
import { SearchIcon } from "@/components/Icons";
import { PRICE_RANGES, SIZES } from "@/lib/catalog";
import { cn } from "@/lib/format";
import { hasActiveFilters, preservedParams, shopHref } from "@/lib/shopUrl";
import type { Category, Color, ProductQuery } from "@/lib/types";

type ShopFiltersProps = {
  query: ProductQuery;
  categories: (Category & { count: number })[];
  colors: Color[];
  totalProducts: number;
};

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="panel p-5">
      <h2 className="mb-3 text-base font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Hidden({ query, omit }: { query: ProductQuery; omit: (keyof ProductQuery)[] }) {
  return (
    <>
      {preservedParams(query, omit).map((param) => (
        <input key={param.name} type="hidden" name={param.name} value={param.value} />
      ))}
    </>
  );
}

export function ShopFilters({ query, categories, colors, totalProducts }: ShopFiltersProps) {
  return (
    <div className="space-y-3">
      <Panel title="Zoeken">
        <form action="/shop" method="get" role="search" className="relative">
          <Hidden query={query} omit={["q"]} />
          <label htmlFor="zoeken-filter" className="sr-only">
            Zoek in producten
          </label>
          <input
            id="zoeken-filter"
            name="q"
            type="search"
            defaultValue={query.q}
            placeholder="Zoek in producten…"
            className="field pr-11"
          />
          <button
            type="submit"
            aria-label="Zoeken"
            className="absolute top-1/2 right-1 grid size-9 -translate-y-1/2 place-items-center rounded-md hover:bg-tile"
          >
            <SearchIcon className="size-5" />
          </button>
        </form>
      </Panel>

      <Panel title="Categorieën">
        <ul className="space-y-1">
          <li>
            <FilterLink href={shopHref(query, { categorie: null })} active={!query.categorie}>
              Alle sokken <Count n={totalProducts} />
            </FilterLink>
          </li>
          {categories.map((category) => (
            <li key={category.slug}>
              <FilterLink
                href={shopHref(query, { categorie: category.slug })}
                active={query.categorie === category.slug}
              >
                {category.name} <Count n={category.count} />
              </FilterLink>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Kleur">
        <ul className="flex flex-wrap gap-2">
          {colors.map((color) => {
            const active = query.kleur === color.slug;
            return (
              <li key={color.slug}>
                <Link
                  href={shopHref(query, { kleur: active ? null : color.slug })}
                  aria-current={active ? "true" : undefined}
                  title={color.name}
                  className={cn(
                    "grid size-10 place-items-center rounded-full border",
                    active ? "border-ink" : "border-transparent hover:border-line",
                  )}
                >
                  <span
                    className="block size-7 rounded-full border border-ink/15"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="sr-only">
                    {color.name}
                    {active ? " (actief, klik om te wissen)" : ""}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel title="Maat">
        <ul className="grid grid-cols-3 gap-1.5">
          {SIZES.map((size) => {
            const active = query.maat === size;
            return (
              <li key={size}>
                <Link
                  href={shopHref(query, { maat: active ? null : size })}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "grid min-h-10 place-items-center rounded-md border text-sm tabular-nums transition-colors",
                    active ? "border-ink bg-ink text-paper" : "border-line hover:border-stone",
                  )}
                >
                  {size}
                </Link>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel title="Prijs">
        <form action="/shop" method="get" className="space-y-3">
          <Hidden query={query} omit={["min", "max"]} />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label htmlFor="prijs-min" className="text-sm text-stone">
                Min. prijs
              </label>
              <input
                id="prijs-min"
                name="min"
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="0"
                defaultValue={query.min}
                className="field"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="prijs-max" className="text-sm text-stone">
                Max. prijs
              </label>
              <input
                id="prijs-max"
                name="max"
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="100"
                defaultValue={query.max}
                className="field"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary min-h-11 w-full">
            Prijsfilter toepassen
          </button>
        </form>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {PRICE_RANGES.map((range) => {
            const active = query.min === range.min && query.max === range.max;
            return (
              <li key={range.label}>
                <Link
                  href={shopHref(query, { min: range.min ?? null, max: range.max ?? null })}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "inline-block rounded-full border px-3 py-1.5 text-sm transition-colors",
                    active ? "border-ink bg-ink text-paper" : "border-line hover:border-stone",
                  )}
                >
                  {range.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </Panel>

      {hasActiveFilters(query) && (
        <Link href={shopHref({ sort: query.sort, perPage: query.perPage })} className="link block px-1 py-2 text-sm">
          Alle filters wissen
        </Link>
      )}
    </div>
  );
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn("flex justify-between py-1 hover:underline", active && "font-semibold underline")}
    >
      {children}
    </Link>
  );
}

function Count({ n }: { n: number }) {
  return <span className="font-normal text-stone tabular-nums">{n}</span>;
}
