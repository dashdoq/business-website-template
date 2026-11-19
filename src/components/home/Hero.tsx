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
    <section aria-labelledby="hero-titel" className="wrap pt-4 lg:pt-6">
      <div className="grid items-center gap-8 overflow-hidden rounded-2xl bg-ecru p-6 sm:p-10 md:grid-cols-[1.05fr_1fr] md:gap-12 lg:px-16 lg:py-14">
        <div className="space-y-6">
          <p className="caps inline-block rounded-full bg-ink px-3 py-1.5 text-[0.6875rem] leading-none text-paper">
            Drop Nº {dropNumber}
          </p>
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
            className="rounded-xl bg-paper/70"
          />
          <span className="absolute right-4 bottom-4 rounded-md bg-paper px-3 py-2 text-sm shadow-[0_4px_16px_rgb(0_0_0/0.06)]">
            <span className="caps mr-2 text-[0.75rem]">{featured.name}</span>
            <span className="tabular-nums">{formatPrice(featured.price)}</span>
          </span>
        </Link>
      </div>
    </section>
  );
}
