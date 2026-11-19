import { Hero } from "@/components/home/Hero";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { PromoBlock } from "@/components/home/PromoBlock";
import { SectionHeading } from "@/components/home/SectionHeading";
import { ProductCard } from "@/components/ProductCard";
import { ProductCarousel } from "@/components/ProductCarousel";
import { site, values } from "@/content/site";
import { getBestsellers, getDropStats, getNewArrivals, getProduct } from "@/lib/catalog";

export default async function HomePage() {
  const [drop, newArrivals, bestsellers, featured, seasonal] = await Promise.all([
    getDropStats(site.currentDrop),
    getNewArrivals(),
    getBestsellers(),
    getProduct("bergpad"),
    getProduct("haardvuur"),
  ]);

  return (
    <>
      {featured && <Hero drop={drop} featured={featured} />}

      <section aria-labelledby="nieuw-titel" className="wrap mt-16 lg:mt-24">
        <SectionHeading id="nieuw-titel" link={{ href: "/shop?sort=nieuwste", label: "Alles van nieuw" }}>
          Nieuw binnen
        </SectionHeading>
        <ProductCarousel label="Nieuw binnen">
          {newArrivals.map((product, index) => (
            <ProductCard key={product.slug} product={product} priority={index < 2} />
          ))}
        </ProductCarousel>
      </section>

      <section aria-labelledby="bestsellers-titel" className="wrap mt-16 lg:mt-24">
        <SectionHeading id="bestsellers-titel" link={{ href: "/shop?sort=populair", label: "Alle bestsellers" }}>
          Bestsellers
        </SectionHeading>
        <ProductCarousel label="Bestsellers">
          {bestsellers.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </ProductCarousel>
      </section>

      {seasonal && <PromoBlock product={seasonal} />}

      <section aria-labelledby="waarden-titel" className="wrap mt-20 lg:mt-28">
        <h2 id="waarden-titel" className="sr-only">
          Waar woolup voor staat
        </h2>
        <dl className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <div key={value.title} className="space-y-3 border-t border-ink pt-5">
              <dt className="display-md">{value.title}</dt>
              <dd className="text-stone">{value.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <NewsletterForm />
    </>
  );
}
