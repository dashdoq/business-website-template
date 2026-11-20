import { formatCurrency, type ProductListItem, type ProductVariant } from '@/api/ecommerce-api';

/** The variant whose price the card shows: the cheapest one, like `price_in_cents`. */
function displayVariant(product: Pick<ProductListItem, 'variants'>): ProductVariant | undefined {
	return [...product.variants].sort(
		(a, b) => (a.sale_price_in_cents ?? a.price_in_cents) - (b.sale_price_in_cents ?? b.price_in_cents),
	)[0];
}

/** Regular price and discount when the shown variant is on sale; undefined otherwise. */
export function saleInfo(product: Pick<ProductListItem, 'variants'>, variant = displayVariant(product)) {
	if (!variant || variant.sale_price_in_cents === null || variant.sale_price_in_cents >= variant.price_in_cents) {
		return undefined;
	}

	return {
		regularFormatted: variant.price_formatted || formatCurrency(variant.price_in_cents, variant.currency_info),
		percent: Math.round((1 - variant.sale_price_in_cents / variant.price_in_cents) * 100),
	};
}

/** The option a card can pick from directly (e.g. "Maat"), when it is the only one. */
export function singleOption(product: Pick<ProductListItem, 'options'>) {
	return product.options.length === 1 ? product.options[0] : undefined;
}

export const uniqueValues = (option: { values: { value: string }[] }) => [
	...new Set(option.values.map(v => v.value)),
];

/** The variant that carries exactly this value of a single-option product. */
export function variantFor(product: Pick<ProductListItem, 'variants'>, optionId: string, value: string) {
	return product.variants.find(v => v.options.some(o => o.option_id === optionId && o.value === value));
}

export const isVariantAvailable = (variant: ProductVariant) =>
	!variant.manage_inventory || (variant.inventory_quantity ?? 0) > 0;
