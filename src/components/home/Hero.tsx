import Link from "next/link";
import { DropMeter } from "@/components/DropMeter";
import { ProductImage } from "@/components/ProductImage";
import { getColor } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

type HeroProps = {
  drop: { drop: number; models: number; edition: number; remaining: number; lowestPrice: number };
  featured: Product;
};

export function Hero({ drop, featured }: HeroProps) {
  const dropNumber = String(drop.drop).padStart(2, "0");
  return (
    <section aria-labelledby="hero-titel" className="bg-ecru">
      <div className="wrap grid items-center gap-10 py-10 md:grid-cols-[1.05fr_1fr] md:gap-12 md:py-16 lg:py-20">
        <div className="space-y-7">
          <p className="caps text-[1.0625rem]">Drop Nº {dropNumber}</p>
          <h1 id="hero-titel" className="display-xl">
            Warme voeten, kleine oplage.
          </h1>
          <p className="max-w-[34ch] text-lg">
            {drop.models} modellen sokken en kousen van wol, uit eigen productie. Is een model op,
            dan komt het pas terug in een volgende drop.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link href="/shop" className="btn-primary">
              Bekijk de collectie
            </Link>
            <p className="text-sm">
              Vanaf <span className="font-semibold tabular-nums">{formatPrice(drop.lowestPrice)}</span>
            </p>
          </div>
          <DropMeter remaining={drop.remaining} edition={drop.edition} unit="paren in deze drop" />
        </div>

        <Link
          href={`/product/${featured.slug}`}
          className="group relative block"
          aria-label={`${featured.name} bekijken`}
        >
          <ProductImage
            src={featured.images[0]}
            alt=""
            placeholderColor={getColor(featured.colors[0] ?? "loden").hex}
            sizes="(min-width: 768px) 45vw, 100vw"
            priority
            className="bg-paper/60"
          />
          <span className="absolute right-4 bottom-4 bg-paper px-3 py-2 text-sm shadow-[0_1px_2px_rgb(0_0_0/0.08)]">
            <span className="caps mr-2 text-[1rem]">{featured.name}</span>
            <span className="tabular-nums">{formatPrice(featured.price)}</span>
          </span>
        </Link>
      </div>
    </section>
  );
}
