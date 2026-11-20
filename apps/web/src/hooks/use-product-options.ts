import { useCallback, useMemo, useState } from 'react';
import type { ProductListItem, ProductVariant } from '@/api/ecommerce-api';

type ProductWithOptions = Pick<ProductListItem, 'id' | 'options' | 'variants'>;

type Selection = Record<string, string>;

type Picked = {
	productId: string;
	selection: Selection;
};

/**
 * Whether a variant can be bought now. Untracked variants (donations, services,
 * anything with `manage_inventory` false) report a stock of 0 but are always
 * available, so stock is only read when the store tracks it.
 */
export const isVariantInStock = (variant: Pick<ProductVariant, 'manage_inventory' | 'inventory_quantity'>): boolean =>
	!variant.manage_inventory || (variant.inventory_quantity ?? 0) > 0;

const selectionOf = (variant: ProductVariant | undefined): Selection =>
	Object.fromEntries((variant?.options ?? []).map(option => [option.option_id, option.value]));

/** The first in-stock variant, so the page opens on something that can be bought. */
const initialSelection = (product: ProductWithOptions): Selection =>
	selectionOf(product.variants.find(isVariantInStock) ?? product.variants[0]);

const matches = (variant: ProductVariant, selection: Selection) =>
	Object.entries(selection).every(([optionId, value]) =>
		variant.options.some(option => option.option_id === optionId && option.value === value));

/**
 * Option picker state for a product page: which value of each option (Size,
 * Colour, …) is chosen, which variant that resolves to, and which values would
 * lead to a sold-out or missing combination. It holds no markup: render the
 * swatches, chips or selects the site's design calls for.
 *
 *   const picker = useProductOptions(product);
 *   {product.options.map(option => option.values.map(({ value }) => (
 *     <button aria-pressed={picker.selection[option.id] === value}
 *       disabled={!picker.isValueAvailable(option.id, value)}
 *       onClick={() => picker.select(option.id, value)}>{value}</button>)))}
 *   <button disabled={!picker.canAddToCart} onClick={() => addLine(cartLineFromVariant({ product, variant: picker.variant!, quantity }))}>…</button>
 *
 * It starts on the first in-stock variant, and starts over when the page moves
 * to another product. `maxQuantity` is null when stock is not tracked; cap a
 * quantity input with it otherwise. Not for a custom-amount donation, which
 * needs the amount input from the ecommerce skill instead.
 */
export function useProductOptions(product: ProductWithOptions) {
	const [picked, setPicked] = useState<Picked | null>(null);
	const selection = picked?.productId === product.id ? picked.selection : initialSelection(product);

	const variant = useMemo(() => {
		if (!product.options.length) {
			return product.variants[0] ?? null;
		}

		const isComplete = product.options.every(option => selection[option.id]);

		return isComplete ? product.variants.find(candidate => matches(candidate, selection)) ?? null : null;
	}, [product, selection]);

	const select = useCallback((optionId: string, value: string) => {
		setPicked(current => ({
			productId: product.id,
			selection: {
				...(current?.productId === product.id ? current.selection : initialSelection(product)),
				[optionId]: value,
			},
		}));
	}, [product]);

	const isValueAvailable = useCallback((optionId: string, value: string) => {
		const candidateSelection = { ...selection, [optionId]: value };

		return product.variants.some(candidate => matches(candidate, candidateSelection) && isVariantInStock(candidate));
	}, [product, selection]);

	const isInStock = variant ? isVariantInStock(variant) : false;

	return {
		selection,
		select,
		variant,
		isValueAvailable,
		isInStock,
		canAddToCart: Boolean(variant) && isInStock && !variant?.donation,
		maxQuantity: variant?.manage_inventory ? Math.max(0, variant.inventory_quantity ?? 0) : null,
	};
}
