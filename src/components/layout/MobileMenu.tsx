"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/Icons";
import { NavLinks } from "@/components/layout/NavLinks";
import { Logo } from "@/components/Logo";
import { SearchForm } from "@/components/layout/SearchForm";
import { useDialog } from "@/lib/useDialog";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setIsOpen(false), []);
  const pathname = usePathname();

  useDialog(isOpen, close, panelRef);
  useEffect(close, [pathname, close]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="-ml-2 grid size-11 place-items-center rounded-full hover:bg-tile"
        aria-label="Menu openen"
        aria-expanded={isOpen}
      >
        <MenuIcon className="size-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div className="animate-fade-in absolute inset-0 bg-ink/40" onClick={close} aria-hidden="true" />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            tabIndex={-1}
            className="absolute inset-y-0 left-0 flex w-[min(22rem,88vw)] flex-col gap-8 bg-paper p-5"
          >
            <div className="flex items-center justify-between">
              <Logo className="h-7 w-auto" />
              <button
                type="button"
                onClick={close}
                className="-mr-2 grid size-11 place-items-center rounded-full hover:bg-tile"
                aria-label="Menu sluiten"
              >
                <CloseIcon className="size-6" />
              </button>
            </div>
            <SearchForm id="zoeken-menu" />
            <nav aria-label="Hoofdmenu">
              <NavLinks
                className="flex flex-col gap-5"
                linkClassName="text-[1.75rem] tracking-[0.04em]"
                onNavigate={close}
              />
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
