import type { ProductListItem } from '@/api/ecommerce-api';
import { ProductCard } from '@/components/product-card';

export function ProductGrid({ products }: { products: ProductListItem[] }) {
	return products.length ? (
		<ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4 xl:grid-cols-4">
			{products.map((p, index) => (
				<li key={p.id}>
					<ProductCard product={p} priority={index < 4} />
				</li>
			))}
		</ul>
	) : (
		<p className="panel px-6 py-12 text-center text-stone">Er zijn geen edities die bij uw selectie passen.</p>
	);
}
