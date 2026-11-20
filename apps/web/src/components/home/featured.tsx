import { Link } from 'react-router';
import type { ProductListItem } from '@/api/ecommerce-api';
import { ProductCard } from '@/components/product-card';
import { ProductCarousel } from '@/components/product-carousel';

export function Featured({ products }: { products: ProductListItem[] }) {
	return (
		<section className="wrap mt-16 lg:mt-24" aria-labelledby="featured-title">
			<div className="mb-6 flex items-end justify-between gap-4 lg:mb-8">
				<div className="space-y-3">
					<span className="caps text-[0.75rem] text-stone">Bijzonder. Niet onbeperkt.</span>
					<h2 id="featured-title" className="display-lg">
						Een kleine collectie.
						<br />
						Een groot karakter.
					</h2>
				</div>
				<Link className="link shrink-0 pb-1 text-sm" to="/collectie">
					Alle edities
				</Link>
			</div>
			{products.length ? (
				<ProductCarousel label="Een kleine collectie. Een groot karakter.">
					{products.map((product, index) => (
						<ProductCard key={product.id} product={product} priority={index < 2} />
					))}
				</ProductCarousel>
			) : (
				<p className="panel px-6 py-12 text-center text-stone">Er zijn geen edities die bij uw selectie passen.</p>
			)}
		</section>
	);
}
