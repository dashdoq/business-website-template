import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DropMeter } from "@/components/DropMeter";
import { SectionHeading } from "@/components/home/SectionHeading";
import { Price } from "@/components/Price";
import { ProductCard } from "@/components/ProductCard";
import { ProductCarousel } from "@/components/ProductCarousel";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductTabs } from "@/components/product/ProductTabs";
import { SizeTable } from "@/components/SizeTable";
import { site } from "@/content/site";
import {
  discountPercent,
  getAllProductSlugs,
  getCategoryName,
  getColor,
  getProduct,
  getRelated,
  stockState,
} from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

type ProductPageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getAllProductSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return {};
  return {
    title: product.name,
    description: `${product.summary} ${formatPrice(product.price)}. Drop Nº ${String(product.drop).padStart(2, "0")}, ${product.edition} paren.`,
    alternates: { canonical: `/product/${product.slug}` },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();

  const related = await getRelated(product);
  const stock = stockState(product);
  const discount = discountPercent(product);
  const categoryName = getCategoryName(product.category);

  return (
    <>
      <div className="wrap pt-8 lg:pt-12">
        <nav aria-label="Kruimelpad" className="mb-6 text-sm text-stone">
          <ol className="flex flex-wrap gap-2">
            <li>
              <Link href="/" className="hover:underline">Home</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/shop" className="hover:underline">Shop</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={`/shop?categorie=${product.category}`} className="hover:underline">
                {categoryName}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink">{product.name}</li>
          </ol>
        </nav>

        <ProductDetail
          slug={product.slug}
          name={product.name}
          price={product.price}
          colors={product.colors.map(getColor)}
          sizes={product.sizes}
          images={product.images}
          soldOut={stock === "uitverkocht"}
          footer={
            <ul className="space-y-1.5 border-t border-line pt-5 text-sm text-stone">
              <li>Gratis verzending vanaf {formatPrice(site.freeShippingFrom)}</li>
              <li>14 dagen bedenktijd</li>
              <li>Prijzen inclusief btw</li>
            </ul>
          }
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-sm text-stone">
              <span>
                {categoryName} uit drop Nº {String(product.drop).padStart(2, "0")}
              </span>
              {product.isNew && (
                <span className="caps rounded-sm bg-loden px-2 py-1 text-[0.8125rem] leading-none text-paper">
                  Nieuw
                </span>
              )}
            </div>
            <h1 className="display-lg">{product.name}</h1>
            <p className="text-lg">{product.summary}</p>
            <div className="flex items-center gap-3">
              <Price price={product.price} compareAtPrice={product.compareAtPrice} className="text-xl" />
              {discount !== undefined && (
                <span className="caps rounded-sm bg-ink px-2 py-1 text-[0.8125rem] leading-none text-paper">
                  -{discount}%
                </span>
              )}
            </div>
            <DropMeter remaining={product.remaining} edition={product.edition} unit="paren gemaakt" />
          </div>
        </ProductDetail>

        <section aria-label="Productinformatie" className="mt-14 lg:mt-20">
          <ProductTabs
            tabs={[
              {
                id: "beschrijving",
                label: "Beschrijving",
                content: (
                  <div className="prose-shop">
                    {product.description.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                ),
              },
              {
                id: "materiaal",
                label: "Materiaal en verzorging",
                content: (
                  <div className="prose-shop">
                    <p>
                      <strong className="font-semibold">Materiaal:</strong> {product.material}
                    </p>
                    <ul>
                      {product.care.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                ),
              },
              {
                id: "maattabel",
                label: "Maattabel",
                content: <SizeTable />,
              },
            ]}
          />
        </section>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="gerelateerd-titel" className="wrap mt-16 lg:mt-24">
          <SectionHeading id="gerelateerd-titel">Misschien ook mooi</SectionHeading>
          <ProductCarousel label="Misschien ook mooi">
            {related.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </ProductCarousel>
        </section>
      )}
    </>
  );
}
