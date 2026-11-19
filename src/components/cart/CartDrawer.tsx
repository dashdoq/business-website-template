"use client";

import Link from "next/link";
import { useRef } from "react";
import { lineKey, useCart, CART_MAX_PER_LINE } from "@/components/cart/CartContext";
import { CloseIcon, MinusIcon, PlusIcon } from "@/components/Icons";
import { SockMark } from "@/components/Logo";
import { site } from "@/content/site";
import { formatPrice } from "@/lib/format";
import { useDialog } from "@/lib/useDialog";

export function CartDrawer() {
  const { lines, count, subtotal, isOpen, close, setQuantity, remove } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  useDialog(isOpen, close, panelRef);

  if (!isOpen) return null;

  const toFreeShipping = site.freeShippingFrom - subtotal;

  return (
    <div className="fixed inset-0 z-50">
      <div className="animate-fade-in absolute inset-0 bg-ink/40" onClick={close} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="winkelmand-titel"
        tabIndex={-1}
        className="animate-drawer-in absolute inset-y-0 right-0 flex w-[min(28rem,100vw)] flex-col bg-paper"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="winkelmand-titel" className="caps text-[1.375rem]">
            Winkelmand <span className="text-stone tabular-nums">({count})</span>
          </h2>
          <button
            type="button"
            onClick={close}
            className="-mr-2 grid size-11 place-items-center rounded-full hover:bg-tile"
            aria-label="Winkelmand sluiten"
          >
            <CloseIcon className="size-6" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <SockMark className="h-16 w-auto text-line" />
            <p className="text-lg">Je winkelmand is leeg.</p>
            <Link href="/shop" onClick={close} className="btn-primary">
              Naar de shop
            </Link>
          </div>
        ) : (
          <>
            <p className="border-b border-line bg-ecru px-5 py-3 text-sm">
              {toFreeShipping > 0
                ? `Nog ${formatPrice(toFreeShipping)} tot gratis verzending.`
                : "Je bestelling wordt gratis verzonden."}
            </p>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {lines.map((line) => {
                const key = lineKey(line);
                return (
                  <li key={key} className="flex gap-4 py-5">
                    <Link
                      href={`/product/${line.slug}`}
                      onClick={close}
                      className="grid size-20 shrink-0 place-items-center bg-tile"
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      <SockMark className="h-12 w-auto" style={{ color: line.colorHex }} />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-start justify-between gap-3">
                        <Link
                          href={`/product/${line.slug}`}
                          onClick={close}
                          className="caps text-[1.0625rem] leading-tight hover:underline"
                        >
                          {line.name}
                        </Link>
                        <p className="text-sm font-semibold tabular-nums">
                          {formatPrice(line.price * line.quantity)}
                        </p>
                      </div>
                      <p className="text-sm text-stone">
                        {line.colorName}, maat {line.size}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <QuantityStepper
                          value={line.quantity}
                          label={line.name}
                          onChange={(quantity) => setQuantity(key, quantity)}
                        />
                        <button
                          type="button"
                          onClick={() => remove(key)}
                          className="link text-sm text-stone hover:text-ink"
                        >
                          Verwijderen<span className="sr-only"> {line.name}</span>
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="space-y-3 border-t border-line px-5 py-5">
              <div className="flex items-baseline justify-between">
                <span>Subtotaal</span>
                <span className="text-lg font-semibold tabular-nums">{formatPrice(subtotal)}</span>
              </div>
              <button type="button" className="btn-primary w-full" disabled aria-describedby="afrekenen-uitleg">
                Afrekenen
              </button>
              <p id="afrekenen-uitleg" className="text-center text-sm text-stone">
                Bestellen is binnenkort mogelijk. Je winkelmand blijft bewaard.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function QuantityStepper({
  value,
  label,
  onChange,
  min = 0,
}: {
  value: number;
  label: string;
  onChange: (value: number) => void;
  min?: number;
}) {
  return (
    <div className="inline-flex items-center rounded-sm border border-line" role="group" aria-label={`Aantal ${label}`}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        className="grid size-10 place-items-center hover:bg-tile disabled:text-line"
        aria-label="Eén minder"
      >
        <MinusIcon className="size-4" />
      </button>
      <span className="w-8 text-center tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= CART_MAX_PER_LINE}
        className="grid size-10 place-items-center hover:bg-tile disabled:text-line"
        aria-label="Eén meer"
      >
        <PlusIcon className="size-4" />
      </button>
    </div>
  );
}
