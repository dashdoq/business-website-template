"use client";

import { useId, useRef, useState } from "react";
import { useCart } from "@/components/cart/CartContext";
import type { Cents, Color, Size } from "@/lib/types";

type QuickAddProps = {
  slug: string;
  name: string;
  price: Cents;
  sizes: Size[];
  color: Color;
  soldOut: boolean;
};

/**
 * "In winkelmand" on a product tile. Socks need a size, so the button first
 * opens a row of sizes; picking one adds the pair in the first colour.
 */
export function QuickAdd({ slug, name, price, sizes, color, soldOut }: QuickAddProps) {
  const { add } = useCart();
  const [choosing, setChoosing] = useState(false);
  const groupId = useId();
  const firstSizeRef = useRef<HTMLButtonElement>(null);

  if (soldOut) {
    return (
      <button type="button" className="btn-outline w-full min-h-11 text-[0.9375rem]" disabled>
        Uitverkocht
      </button>
    );
  }

  if (!choosing) {
    return (
      <button
        type="button"
        className="btn-outline w-full min-h-11 text-[0.9375rem]"
        aria-expanded={false}
        onClick={() => {
          setChoosing(true);
          requestAnimationFrame(() => firstSizeRef.current?.focus());
        }}
      >
        In winkelmand
        <span className="sr-only">: {name}</span>
      </button>
    );
  }

  return (
    <div
      id={groupId}
      role="group"
      aria-label={`Kies je maat voor ${name}`}
      className="animate-fade-in"
      onKeyDown={(event) => {
        if (event.key === "Escape") setChoosing(false);
      }}
    >
      <p className="mb-1.5 text-xs text-stone">Kies je maat</p>
      <div className="grid grid-cols-3 gap-1">
        {sizes.map((size, index) => (
          <button
            key={size}
            ref={index === 0 ? firstSizeRef : undefined}
            type="button"
            className="min-h-11 rounded-sm border border-ink text-sm tabular-nums hover:bg-ink hover:text-paper"
            onClick={() => {
              add({
                slug,
                name,
                price,
                color: color.slug,
                colorName: color.name,
                colorHex: color.hex,
                size,
              });
              setChoosing(false);
            }}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}
