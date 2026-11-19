import Link from "next/link";
import { ProductBadges } from "@/components/Badges";
import { Price } from "@/components/Price";
import { ProductImage } from "@/components/ProductImage";
import { QuickAdd } from "@/components/QuickAdd";
import { getColor, stockState } from "@/lib/catalog";
import type { Product } from "@/lib/types";

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const colors = product.colors.map(getColor);
  const primary = colors[0];
  const href = `/product/${product.slug}`;

  return (
    <article className="group relative flex h-full flex-col border border-line bg-paper">
      <Link href={href} className="relative block" tabIndex={-1} aria-hidden="true">
        <ProductImage
          src={product.images[0]}
          alt=""
          placeholderColor={primary?.hex ?? "#000"}
          priority={priority}
          className="transition-[filter] duration-200 group-hover:brightness-[0.97]"
        />
        <ProductBadges product={product} />
      </Link>

      <div className="flex flex-1 flex-col items-center gap-2 px-3 pt-4 pb-3 text-center">
        <h3 className="caps text-[1.0625rem] leading-tight">
          <Link href={href} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        <Price price={product.price} compareAtPrice={product.compareAtPrice} className="text-sm" />
        <ul className="flex gap-1.5" aria-label="Kleuren">
          {colors.map((color) => (
            <li key={color.slug}>
              <span
                className="block size-3 rounded-full border border-ink/20"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
              <span className="sr-only">{color.name}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto w-full pt-2">
          <QuickAdd
            slug={product.slug}
            name={product.name}
            price={product.price}
            sizes={product.sizes}
            color={primary ?? { slug: "zwart", name: "Zwart", hex: "#151515" }}
            soldOut={stockState(product) === "uitverkocht"}
          />
        </div>
      </div>
    </article>
  );
}
