import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/Icons";
import { cn } from "@/lib/format";
import { shopHref } from "@/lib/shopUrl";
import type { ProductQuery } from "@/lib/types";

export function Pagination({ query, page, pageCount }: { query: ProductQuery; page: number; pageCount: number }) {
  if (pageCount <= 1) return null;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  const item = "grid size-10 place-items-center rounded-md border text-sm tabular-nums transition-colors";

  return (
    <nav aria-label="Paginering" className="mt-10 flex justify-center">
      <ul className="flex items-center gap-1.5">
        <li>
          {page > 1 ? (
            <Link href={shopHref(query, { page: page - 1 })} className={cn(item, "border-line hover:border-ink")} aria-label="Vorige pagina">
              <ArrowLeftIcon className="size-4" />
            </Link>
          ) : (
            <span className={cn(item, "border-line text-line")} aria-hidden="true">
              <ArrowLeftIcon className="size-4" />
            </span>
          )}
        </li>
        {pages.map((n) => (
          <li key={n}>
            <Link
              href={shopHref(query, { page: n })}
              aria-current={n === page ? "page" : undefined}
              aria-label={`Pagina ${n}`}
              className={cn(item, n === page ? "border-ink bg-ink text-paper" : "border-line hover:border-ink")}
            >
              {n}
            </Link>
          </li>
        ))}
        <li>
          {page < pageCount ? (
            <Link href={shopHref(query, { page: page + 1 })} className={cn(item, "border-line hover:border-ink")} aria-label="Volgende pagina">
              <ArrowRightIcon className="size-4" />
            </Link>
          ) : (
            <span className={cn(item, "border-line text-line")} aria-hidden="true">
              <ArrowRightIcon className="size-4" />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
