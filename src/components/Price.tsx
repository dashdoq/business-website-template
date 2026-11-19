import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/format";
import type { Cents } from "@/lib/types";

type PriceProps = {
  price: Cents;
  compareAtPrice?: Cents;
  className?: string;
};

export function Price({ price, compareAtPrice, className }: PriceProps) {
  const discounted = compareAtPrice !== undefined && compareAtPrice > price;
  return (
    <p className={cn("tabular-nums", className)}>
      {discounted && (
        <>
          <span className="sr-only">Van </span>
          <s className="mr-2 text-stone">{formatPrice(compareAtPrice)}</s>
          <span className="sr-only">voor </span>
        </>
      )}
      <span className="font-semibold">{formatPrice(price)}</span>
    </p>
  );
}
