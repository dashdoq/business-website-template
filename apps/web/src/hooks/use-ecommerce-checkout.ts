import { useCallback, useState } from 'react';
import { type CheckoutCustomer, getProductQuantities, initializeCheckout } from '@/api/ecommerce-api';
import { type CartLine, cartLineKey, useCart } from '@/hooks/use-ecommerce-cart';

export type CheckoutStatus = 'idle' | 'checking' | 'redirecting' | 'error';

export type StockShortage = {
	line: CartLine;
	/** How many the store can still sell; 0 when the variant sold out. */
	available: number;
};

type CheckoutOptions = {
	/** Only when PocketBase is enabled and someone is signed in: links the order to that `users` record. */
	customer?: CheckoutCustomer;
	locale?: string;
	successPath?: string;
	cancelPath?: string;
};

const findShortages = async (lines: CartLine[]): Promise<StockShortage[]> => {
	const tracked = lines.filter(line => line.manageInventory);

	if (!tracked.length) {
		return [];
	}

	const { variants } = await getProductQuantities({
		fields: 'inventory_quantity',
		product_ids: [...new Set(tracked.map(line => line.productId))],
	});
	const stock = new Map(variants.map(variant => [variant.id, variant.inventory_quantity ?? 0]));

	return tracked
		.map(line => ({ line, available: Math.max(0, stock.get(line.variantId) ?? 0) }))
		.filter(({ line, available }) => line.quantity > available);
};

/**
 * The checkout button's logic: re-checks live stock for tracked variants, then
 * hands the cart to the store's hosted checkout and redirects. The cart is left
 * intact, because the buyer may come back from `/checkout/cancelled`; only
 * `/checkout/success` clears it.
 *
 *   const checkout = useEcommerceCheckout();
 *   <button disabled={!lines.length || checkout.isBusy} onClick={() => checkout.start()}>…</button>
 *   {checkout.shortages.map(({ line, available }) => …"only {available} left"…)}
 *   <button onClick={checkout.applyAvailableStock}>…</button>
 *
 * `start` stops with `status` 'error' and fills `shortages` when stock ran out
 * since the cart was filled; nothing is charged. Any other failure leaves the
 * raw `error` for the page to explain in its own words.
 */
export function useEcommerceCheckout() {
	const { lines, setQuantity, removeLine } = useCart();
	const [status, setStatus] = useState<CheckoutStatus>('idle');
	const [shortages, setShortages] = useState<StockShortage[]>([]);
	const [error, setError] = useState<unknown>(null);

	const start = useCallback(async ({
		customer,
		locale,
		successPath = '/checkout/success',
		cancelPath = '/checkout/cancelled',
	}: CheckoutOptions = {}) => {
		if (!lines.length) {
			return;
		}

		setStatus('checking');
		setShortages([]);
		setError(null);

		try {
			const found = await findShortages(lines);

			if (found.length) {
				setShortages(found);
				setStatus('error');

				return;
			}

			const { url } = await initializeCheckout({
				items: lines.map(line => ({
					variant_id: line.variantId,
					quantity: line.quantity,
					...(line.donationAmountInCents ? { donation_amount: line.donationAmountInCents } : {}),
				})),
				successUrl: `${window.location.origin}${successPath}`,
				cancelUrl: `${window.location.origin}${cancelPath}`,
				locale,
				customer,
			});

			setStatus('redirecting');
			window.location.href = url;
		} catch (checkoutError) {
			setError(checkoutError);
			setStatus('error');
		}
	}, [lines]);

	/** Lowers each short line to what is left, removing sold-out ones, so the buyer can try again. */
	const applyAvailableStock = useCallback(() => {
		shortages.forEach(({ line, available }) => {
			if (available > 0) {
				setQuantity(cartLineKey(line), available);
			} else {
				removeLine(cartLineKey(line));
			}
		});
		setShortages([]);
		setStatus('idle');
	}, [shortages, setQuantity, removeLine]);

	return {
		start,
		status,
		isBusy: status === 'checking' || status === 'redirecting',
		shortages,
		error,
		applyAvailableStock,
	};
}
