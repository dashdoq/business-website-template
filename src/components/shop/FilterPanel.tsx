"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { CloseIcon, FilterIcon } from "@/components/Icons";
import { cn } from "@/lib/format";
import { useDialog } from "@/lib/useDialog";

/**
 * Sidebar on desktop; on smaller screens the same filters open in a drawer
 * from a "Filters" button.
 */
export function FilterPanel({ activeCount, children }: { activeCount: number; children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setIsOpen(false), []);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useDialog(isOpen, close, panelRef);
  useEffect(close, [pathname, searchParams, close]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="btn-outline min-h-11 w-full text-[0.9375rem] lg:hidden"
        aria-expanded={isOpen}
      >
        <FilterIcon className="size-5" />
        Filters{activeCount > 0 && <span className="tabular-nums"> ({activeCount})</span>}
      </button>

      {isOpen && (
        <div className="animate-fade-in fixed inset-0 z-40 bg-ink/40 lg:hidden" onClick={close} aria-hidden="true" />
      )}

      <div
        ref={panelRef}
        role={isOpen ? "dialog" : undefined}
        aria-modal={isOpen ? true : undefined}
        aria-label={isOpen ? "Filters" : undefined}
        tabIndex={isOpen ? -1 : undefined}
        className={cn(
          isOpen
            ? "animate-drawer-in fixed inset-y-0 right-0 z-50 w-[min(24rem,100vw)] overflow-y-auto bg-paper p-4"
            : "hidden",
          "lg:static lg:z-auto lg:block lg:w-auto lg:animate-none lg:overflow-visible lg:p-0",
        )}
      >
        {isOpen && (
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <p className="caps text-[1.375rem]">Filters</p>
            <button
              type="button"
              onClick={close}
              className="-mr-2 grid size-11 place-items-center rounded-full hover:bg-tile"
              aria-label="Filters sluiten"
            >
              <CloseIcon className="size-6" />
            </button>
          </div>
        )}
        {children}
      </div>
    </>
  );
}
