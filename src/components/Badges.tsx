import { discountPercent, stockState } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/format";

const base = "caps inline-block rounded-sm px-2 py-[0.3rem] text-[0.6875rem] leading-none";

/** The corner flags on a product tile: discount left, status right. */
export function ProductBadges({ product }: { product: Product }) {
  const discount = discountPercent(product);
  const stock = stockState(product);

  const status =
    stock === "uitverkocht" ? (
      <span className={cn(base, "bg-paper text-stone ring-1 ring-line")}>Uitverkocht</span>
    ) : stock === "laatste-paren" ? (
      <span className={cn(base, "bg-paper text-loden ring-1 ring-loden/40")}>Laatste paren</span>
    ) : product.isNew ? (
      <span className={cn(base, "bg-loden text-paper")}>Nieuw</span>
    ) : null;

  return (
    <>
      {discount !== undefined && (
        <span className={cn(base, "absolute top-3 left-3 bg-ink text-paper")}>-{discount}%</span>
      )}
      {status && <span className="absolute top-3 right-3">{status}</span>}
    </>
  );
}
