import Link from "next/link";
import { DropMeter } from "@/components/DropMeter";
import { Price } from "@/components/Price";
import { ProductImage } from "@/components/ProductImage";
import { getColor } from "@/lib/catalog";
import type { Product } from "@/lib/types";

export function PromoBlock({ product }: { product: Product }) {
  return (
    <section aria-labelledby="promo-titel" className="wrap mt-20 lg:mt-28">
      <div className="grid overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_12px_40px_rgb(0_0_0/0.05)] md:grid-cols-2">
        <ProductImage
          src={product.images[0]}
          alt=""
          placeholderColor={getColor(product.colors[1] ?? product.colors[0] ?? "naturel").hex}
          sizes="(min-width: 768px) 50vw, 100vw"
          className="bg-tile"
        />
        <div className="flex flex-col justify-center gap-6 p-6 sm:p-10 lg:p-16">
          <p className="caps text-[0.75rem] text-stone">Sok van het seizoen</p>
          <h2 id="promo-titel" className="display-lg">
            {product.name}
          </h2>
          <p className="max-w-[40ch] text-lg">{product.description.join(" ")}</p>
          <Price price={product.price} compareAtPrice={product.compareAtPrice} className="text-lg" />
          <DropMeter remaining={product.remaining} edition={product.edition} />
          <div>
            <Link href={`/product/${product.slug}`} className="btn-primary">
              Bekijk {product.name}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
