"use client";

import { PER_PAGE_OPTIONS, SORT_OPTIONS } from "@/lib/shopOptions";
import { formatCount } from "@/lib/format";
import type { SortKey } from "@/lib/types";

type SortBarProps = {
  from: number;
  to: number;
  total: number;
  sort: SortKey;
  perPage: number;
  preserved: { name: string; value: string | number }[];
};

/** Result count plus "Toon" and "Sorteer op"; changing either submits the form. */
export function SortBar({ from, to, total, sort, perPage, preserved }: SortBarProps) {
  return (
    <div className="flex flex-col gap-3 border border-line bg-tile px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm" aria-live="polite">
        {total === 0
          ? "Geen resultaten"
          : `${formatCount(from)}–${formatCount(to)} van ${formatCount(total)} resultaten`}
      </p>
      <form action="/shop" method="get" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        {preserved.map((param) => (
          <input key={param.name} type="hidden" name={param.name} value={param.value} />
        ))}
        <label className="flex items-center gap-2">
          Toon
          <select
            name="toon"
            defaultValue={perPage}
            onChange={(event) => event.currentTarget.form?.requestSubmit()}
            className="field min-h-10 w-auto py-1 pr-8"
          >
            {PER_PAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          Sorteer op
          <select
            name="sort"
            defaultValue={sort}
            onChange={(event) => event.currentTarget.form?.requestSubmit()}
            className="field min-h-10 w-auto py-1 pr-8"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <noscript>
          <button type="submit" className="link">
            Toepassen
          </button>
        </noscript>
      </form>
    </div>
  );
}
