"use client";

import { useCart } from "@/components/cart/CartContext";
import { BagIcon } from "@/components/Icons";

export function CartButton() {
  const { count, open } = useCart();
  return (
    <button
      type="button"
      onClick={open}
      className="relative grid size-11 place-items-center rounded-full hover:bg-tile"
      aria-label={count === 0 ? "Winkelmand, leeg" : `Winkelmand, ${count} ${count === 1 ? "paar" : "paren"}`}
    >
      <BagIcon className="size-6" />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute top-0.5 right-0 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[0.75rem] leading-none font-semibold text-paper tabular-nums"
        >
          {count}
        </span>
      )}
    </button>
  );
}
