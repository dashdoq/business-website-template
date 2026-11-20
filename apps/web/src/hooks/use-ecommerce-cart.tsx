import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
	type CurrencyInfo,
	EcommerceTrackingEvent,
	type EcommerceTrackingItem,
	type ProductListItem,
	type ProductVariant,
	trackEcommerceEvent,
} from '@/api/ecommerce-api';

const CART_KEY = 'e-commerce-cart';

export type CartLine = {
	productId: string;
	variantId: string;
	title: string;
	/** The option combination, e.g. "Blue / M". Omitted on single-variant products. */
	variantTitle?: string;
	/** What one unit costs: the sale price when on sale, the buyer's amount on a donation. */
	priceInCents: number;
	currencyInfo: CurrencyInfo | null;
	image: string | null;
	quantity: number;
	/** Only stock-tracked variants are checked against inventory before checkout. */
	manageInventory?: boolean;
	/**
	 * Set only on a custom-amount donation line: the buyer's amount in cents, also
	 * this line's `priceInCents`. Always quantity 1, and never merged with another line.
	 */
	donationAmountInCents?: number;
};

export type NewCartLine = Omit<CartLine, 'quantity'> & { quantity?: number };

/** What `setQuantity` and `removeLine` take: two gifts to one donation variant are two lines. */
export const cartLineKey = (line: Pick<CartLine, 'variantId' | 'donationAmountInCents'>): string =>
	line.donationAmountInCents ? `${line.variantId}:${line.donationAmountInCents}` : line.variantId;

/**
 * A cart line for a variant picked on a product page or card. Pass
 * `donationAmountInCents` for a custom-amount donation; its placeholder price is
 * never used.
 */
export const cartLineFromVariant = ({
	product,
	variant,
	quantity = 1,
	donationAmountInCents,
}: {
	product: Pick<ProductListItem, 'id' | 'title' | 'image' | 'variants'>;
	variant: ProductVariant;
	quantity?: number;
	donationAmountInCents?: number;
}): NewCartLine => ({
	productId: product.id,
	variantId: variant.id,
	title: product.title,
	...(product.variants.length > 1 && variant.title ? { variantTitle: variant.title } : {}),
	priceInCents: donationAmountInCents ?? variant.sale_price_in_cents ?? variant.price_in_cents,
	currencyInfo: variant.currency_info,
	image: variant.image_url || product.image || null,
	quantity: donationAmountInCents ? 1 : quantity,
	manageInventory: variant.manage_inventory,
	...(donationAmountInCents ? { donationAmountInCents } : {}),
});

const toTrackingItem = (line: CartLine, quantity = line.quantity): EcommerceTrackingItem => ({
	product: { id: line.productId, title: line.title },
	variant: {
		id: line.variantId,
		price_in_cents: line.priceInCents,
		currency_info: line.currencyInfo,
		...(line.variantTitle ? { title: line.variantTitle } : {}),
	},
	quantity,
});

const readStoredLines = (): CartLine[] => {
	try {
		const stored: unknown = JSON.parse(localStorage.getItem(CART_KEY) ?? '[]');

		return Array.isArray(stored) ? stored : [];
	} catch {
		return [];
	}
};

type CartContextValue = {
	lines: CartLine[];
	/** True until the stored cart has loaded after hydration: render a neutral badge, not "0". */
	isLoading: boolean;
	itemCount: number;
	totalInCents: number;
	/** The cart's currency, for `formatCurrency(totalInCents, currencyInfo)`. */
	currencyInfo: CurrencyInfo | null;
	addLine: (line: NewCartLine) => void;
	setQuantity: (key: string, quantity: number) => void;
	removeLine: (key: string) => void;
	/** Stable across renders, so `/checkout/success` can call it from an effect. */
	clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

/**
 * One cart for the whole site, persisted in localStorage and kept in step across
 * tabs. Mount it once in `src/root.tsx`, around everything `Layout` renders, so
 * the header badge, product pages and the cart page share it:
 *
 *   <body><CartProvider>{children}</CartProvider>…</body>
 *
 * It reports `add_to_cart` and `remove_from_cart` itself. Product views and
 * opening the cart are still the page's to report (see the ecommerce skill).
 */
export function CartProvider({ children }: { children: ReactNode }) {
	const [lines, setLines] = useState<CartLine[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const linesRef = useRef(lines);

	// The callbacks below stay stable across renders and read the latest lines from here;
	// a user event can only fire after this effect has run.
	useEffect(() => {
		linesRef.current = lines;
	}, [lines]);

	useEffect(() => {
		setLines(readStoredLines());
		setIsLoading(false);

		const onStorage = (event: StorageEvent) => {
			if (event.key === CART_KEY) {
				setLines(readStoredLines());
			}
		};

		window.addEventListener('storage', onStorage);

		return () => window.removeEventListener('storage', onStorage);
	}, []);

	useEffect(() => {
		if (!isLoading) {
			localStorage.setItem(CART_KEY, JSON.stringify(lines));
		}
	}, [lines, isLoading]);

	const addLine = useCallback((newLine: NewCartLine) => {
		const quantity = newLine.donationAmountInCents ? 1 : Math.max(1, Math.floor(newLine.quantity ?? 1));
		const line: CartLine = { ...newLine, quantity };
		const key = cartLineKey(line);
		const existing = linesRef.current.find(current => cartLineKey(current) === key);

		if (existing && line.donationAmountInCents) {
			return;
		}

		trackEcommerceEvent({ event: EcommerceTrackingEvent.AddToCart, items: [toTrackingItem(line)] });
		setLines(current => (current.some(item => cartLineKey(item) === key)
			? current.map(item => (cartLineKey(item) === key ? { ...item, quantity: item.quantity + quantity } : item))
			: [...current, line]));
	}, []);

	const removeLine = useCallback((key: string) => {
		const line = linesRef.current.find(current => cartLineKey(current) === key);

		if (!line) {
			return;
		}

		trackEcommerceEvent({ event: EcommerceTrackingEvent.RemoveFromCart, items: [toTrackingItem(line)] });
		setLines(current => current.filter(item => cartLineKey(item) !== key));
	}, []);

	const setQuantity = useCallback((key: string, quantity: number) => {
		const line = linesRef.current.find(current => cartLineKey(current) === key);
		const nextQuantity = Math.floor(quantity);

		if (!line || line.donationAmountInCents || nextQuantity === line.quantity) {
			return;
		}

		if (nextQuantity <= 0) {
			removeLine(key);

			return;
		}

		const delta = nextQuantity - line.quantity;

		trackEcommerceEvent({
			event: delta > 0 ? EcommerceTrackingEvent.AddToCart : EcommerceTrackingEvent.RemoveFromCart,
			items: [toTrackingItem(line, Math.abs(delta))],
		});
		setLines(current => current.map(item => (cartLineKey(item) === key ? { ...item, quantity: nextQuantity } : item)));
	}, [removeLine]);

	const clear = useCallback(() => setLines([]), []);

	const value = useMemo<CartContextValue>(() => ({
		lines,
		isLoading,
		itemCount: lines.reduce((total, line) => total + line.quantity, 0),
		totalInCents: lines.reduce((total, line) => total + line.priceInCents * line.quantity, 0),
		currencyInfo: lines[0]?.currencyInfo ?? null,
		addLine,
		setQuantity,
		removeLine,
		clear,
	}), [lines, isLoading, addLine, setQuantity, removeLine, clear]);

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
	const cart = useContext(CartContext);

	if (!cart) {
		throw new Error('useCart() needs <CartProvider> — mount it once in src/root.tsx');
	}

	return cart;
}
