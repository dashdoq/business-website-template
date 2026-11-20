import { useEffect } from 'react';
import { EcommerceTrackingEvent, trackEcommerceEvent } from '@/api/ecommerce-api';
import { cartLineKey, useCart } from '@/hooks/use-ecommerce-cart';
import { CartLineItem, CartSummary, EmptyCart } from '@/components/cart-parts';

export function CartView() {
	const c = useCart();

	useEffect(() => {
		if (!c.isLoading)
			trackEcommerceEvent({
				event: EcommerceTrackingEvent.ViewCart,
				items: c.lines.map(l => ({
					product: { id: l.productId, title: l.title },
					variant: { id: l.variantId, price_in_cents: l.priceInCents, currency_info: l.currencyInfo },
					quantity: l.quantity,
				})),
			});
	}, [c.isLoading, c.lines]);

	return (
		<main className="wrap min-h-[65vh] pt-8 pb-20 lg:pt-12">
			<span className="caps text-[0.75rem] text-stone">Uw selectie</span>
			<h1 className="display-xl mt-3 mb-8 lg:mb-12">De winkelwagen.</h1>
			{c.isLoading ? (
				<p>Uw selectie wordt geladen…</p>
			) : !c.lines.length ? (
				<EmptyCart />
			) : (
				<div className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:gap-12">
					<ul className="panel divide-y divide-line px-5">
						{c.lines.map(l => (
							<CartLineItem key={cartLineKey(l)} line={l} />
						))}
					</ul>
					<aside className="panel h-fit p-6 lg:sticky lg:top-28">
						<CartSummary />
					</aside>
				</div>
			)}
		</main>
	);
}
