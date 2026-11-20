/**
 * Hostinger Online Store client — products, categories, inventory, checkout.
 *
 * This is the ONLY supported way to talk to the store. Do not call store
 * endpoints directly and do not duplicate these exports; the store id and API
 * URL below are injected for this specific site.
 *
 * The store API is public and read-only apart from checkout, so every function
 * here is isomorphic: call them from a route `loader` (best for product pages —
 * the HTML ships with the products in it) or from the browser (best for
 * cart-driven interactions). No API key is involved, so nothing here has to be
 * kept server-side.
 *
 * Money is always in the smallest currency unit (cents). Never divide by 100
 * yourself — use `formatCurrency(cents, currencyInfo)` or the pre-formatted
 * `price_formatted` / `sale_price_formatted` on a variant, because the number of
 * decimal digits is per-currency.
 *
 * Product URLs are built from `product.url_handle`, never `product.id`: it is the
 * merchant's slug when there is one and falls back to the id only when there is
 * not, so a product page indexes as `/product/blue-mug` instead of
 * `/product/prod_01J...`. Resolve that segment back with `getProductByHandle`,
 * which accepts either form.
 *
 * The merchant also sets a title, meta description, social image and `noindex`
 * per product in the store admin. Those arrive resolved as `product.seo` —
 * hand it to `seo()` from `@/lib/seo` in the route's `meta` export, or the page
 * silently overrides what the merchant asked for.
 *
 * There is no cart endpoint: the cart is your own client state (persist it in
 * localStorage). Checkout only needs `{ variant_id, quantity }` pairs, so store
 * variant ids in the cart. `initializeCheckout` returns the checkout URL —
 * redirect to it with `window.location.href`; do not build your own payment UI.
 *
 * Appointments (products whose `type.value` is `"booking"`) are the exception to
 * "isomorphic": `getAvailability` and `getTimeSlots` resolve the visitor's time
 * zone, so they only make sense in the browser. They also never belong in the
 * cart — see their doc comments and the skill's Appointments section.
 *
 * Donations can let the customer name the amount: a variant with
 * `donation.allow_custom_amount` is priced by the buyer, not the merchant. Render
 * an amount input, validate it against `donation.min_amount`/`max_amount`, and
 * send it as `CheckoutItem.donation_amount` with `quantity: 1` — see the skill's
 * Donations section.
 */

const ECOMMERCE_API_URL = 'https://api-ecommerce.hostinger.com';
const ECOMMERCE_STORE_ID = 'scha_01M7V2REJ7BCZBT3HC4GF9GTXR';
const DEFAULT_SEARCH_LIMIT = 15;
const MAX_SEARCH_LIMIT = 200;
const MAX_SEARCH_QUERY_LENGTH = 100;
/** Every store product id starts with this, which is how a handle is told from an id. */
const PRODUCT_ID_PREFIX = 'prod_';
const META_DESCRIPTION_MAX_LENGTH = 160;
const DOMAIN_CHECKOUT_PATH = '/checkout/';
const DOMAIN_CHECKOUT_MARKER = 'data-hostinger-checkout-shell';
const DOMAIN_CHECKOUT_PROBE_TIMEOUT_MS = 1500;
const CONSENT_COOKIE = 'cc_cookie';

/**
 * Storefront events reported to the merchant's Google Analytics and Meta Pixel.
 * Purchases are tracked by the platform after checkout; never report them yourself.
 */
export const EcommerceTrackingEvent = {
	ViewItem: 'view_item',
	SelectItem: 'select_item',
	AddToCart: 'add_to_cart',
	RemoveFromCart: 'remove_from_cart',
	ViewCart: 'view_cart',
} as const;

export type EcommerceTrackingEvent = typeof EcommerceTrackingEvent[keyof typeof EcommerceTrackingEvent];

/** Per-currency formatting metadata, taken from a variant's price. */
export type CurrencyInfo = {
	/** ISO code, e.g. "EUR". */
	code?: string;
	/** Display symbol, e.g. "€". */
	symbol?: string;
	/** Layout template where `$1` is the amount, e.g. "$1 €". */
	template?: string;
	/** How many decimals this currency uses; defaults to 2. */
	decimal_digits?: number;
};

export type ProductVariantOption = {
	id: string;
	option_id: string;
	variant_id: string;
	value: string;
};

export type ProductOptionValue = {
	id: string;
	option_id: string;
	variant_id: string;
	value: string;
};

/** A choosable axis (e.g. "Size") with its available values. */
export type ProductOption = {
	id: string;
	title: string;
	values: ProductOptionValue[];
};

export type BookingLocationType = 'physical' | 'online' | 'online_auto_generated' | 'phone';

/**
 * Appointment configuration, present only on a variant of a `"booking"` product.
 * Passed through from the store exactly as it arrives, so it can carry fields
 * beyond the ones named here (buffers, notice periods).
 *
 * Every duration is in **milliseconds** — `length` included — and any `*_unit`
 * field is display metadata, not a multiplier. One of `location`,
 * `online_location` and `phone_number` is filled in, matching `location_type`.
 */
export type BookingEvent = {
	/** Pass as `bookingEventId` to `getAvailability` and `getTimeSlots`. */
	id: string;
	/** Appointment duration in milliseconds. */
	length: number;
	length_unit?: string;
	location_type: BookingLocationType;
	location?: string | null;
	online_location?: string | null;
	phone_number?: string | null;
};

/**
 * Custom-amount ("pay what you want") donation config, present only on the one
 * variant of a donation product the customer prices themselves. Every other
 * variant — including a donation product's fixed preset amounts — has `donation`
 * null and is bought at its own price.
 *
 * Amounts are in the smallest currency unit (cents), like every price here.
 */
export type DonationInfo = {
	/** Always true when present: the customer types the amount instead of picking a preset. */
	allow_custom_amount: boolean;
	/** Lowest accepted amount, in cents. */
	min_amount: number;
	/** Highest accepted amount in cents, or null when the merchant set no upper limit. */
	max_amount: number | null;
};

/**
 * A buyable version of a product. `variant_id` is what checkout consumes, so a
 * product with options must have its variant resolved before "add to cart".
 */
export type ProductVariant = {
	id: string;
	title: string;
	image_url: string | null;
	sku: string | null;
	/** Regular price in cents. */
	price_in_cents: number;
	/** Discounted price in cents, or null when not on sale. */
	sale_price_in_cents: number | null;
	/** Currency code of the price, e.g. "eur". */
	currency: string;
	currency_info: CurrencyInfo | null;
	price_formatted: string;
	/** Empty string when the variant is not on sale. */
	sale_price_formatted: string;
	/** Only track stock when this is true; otherwise treat the variant as always available. */
	manage_inventory: boolean;
	weight: number | null;
	options: ProductVariantOption[];
	/** Current stock. Meaningless unless `manage_inventory` is true. */
	inventory_quantity: number | null;
	/** Non-null only on an appointment variant. Its presence is what a slot picker needs. */
	booking_event: BookingEvent | null;
	/**
	 * Non-null only on the customer-priced donation variant. Its presence is what
	 * an amount input needs: `price_in_cents` on this variant is a placeholder, not
	 * the price. See the skill's "Donations" section.
	 */
	donation: DonationInfo | null;
};

export type ProductImage = {
	url: string;
	/** Sort ascending for display order. */
	order: number;
	type: string;
};

/** Membership of a product in a category (collection). */
export type ProductCollection = {
	product_id: string;
	collection_id: string;
	order: number;
};

/** Extra description sections (care instructions, sizing, shipping...). `description` is HTML. */
export type ProductAdditionalInfo = {
	id: string;
	order: number;
	title: string;
	description: string;
};

/** Buyer input collected at checkout, e.g. an engraving. Pass values back via `CheckoutItem.custom_field_values`. */
export type ProductCustomField = {
	id: string;
	title: string;
	is_required: boolean;
};

export type ProductRelatedProduct = {
	id: string;
	section_title: string;
	related_type: string;
	related_id: string;
	position: number;
};

/**
 * The raw SEO overrides the merchant typed into the store admin. Every field is
 * optional and any of them can be blank, so prefer the already-resolved
 * `product.seo` over reading these directly.
 */
export type ProductSeoSettings = {
	title?: string | null;
	description?: string | null;
	/** Unique within the store, but may be absent — read `url_handle` instead of this. */
	slug?: string | null;
	/** The merchant asked for this product to stay out of search results. */
	noindex?: boolean | null;
	keywords?: string[] | null;
	/** The one term the page is meant to rank for. Not a meta tag — use it in copy. */
	focusKeyword?: string | null;
	/** Social card image, already a full URL. */
	ogImagePath?: string | null;
	/** Where that image came from, e.g. "other". Provenance only — never join it to `ogImagePath`. */
	ogImageOrigin?: string | null;
	ogImageAlt?: string | null;
	/** Store-admin page template. Of no use to a storefront. */
	templateId?: string | null;
};

/**
 * Page metadata for a product, resolved from `seo_settings` with the fallbacks
 * already applied — feed it straight to `seo()` from `@/lib/seo`. Reading
 * `seo_settings` by hand instead is how a merchant's admin-entered title,
 * social image or `noindex` silently goes missing.
 */
export type ProductSeo = {
	/** The merchant's SEO title, else the product title. Never empty. */
	title: string;
	/** The merchant's meta description, else the description as plain text, trimmed to ~160 characters. */
	description: string;
	/** The merchant's social image, else the thumbnail. Empty string when the product has no image. */
	image: string;
	/** The merchant's alt text, else the product title. */
	image_alt: string;
	/** True when the merchant hid this product from search. Pass it through — do not second-guess it. */
	noindex: boolean;
	/** Merchant keywords, empty when none were set. Search engines ignore the meta tag; use them in copy. */
	keywords: string[];
};

/**
 * Aggregated review ratings. Null on a product nobody has reviewed yet, so check
 * `total_reviews` before rendering stars rather than trusting `average_rating`.
 */
export type ProductReviewsAnalytics = {
	product_id: string;
	total_reviews: number;
	/** Mean rating to one decimal place, e.g. 4.3. Zero when there are no reviews. */
	average_rating: number;
	rating_1_count: number;
	rating_2_count: number;
	rating_3_count: number;
	rating_4_count: number;
	rating_5_count: number;
};

/** A product as returned by `getProducts` — enough for cards, grids and listings. */
export type ProductListItem = {
	id: string;
	/**
	 * What every link to this product must use: the store's canonical handle —
	 * the merchant's slug, falling back to the id when the product has none.
	 * Empty only for a product the store returned without an id; skip those
	 * rather than linking to `/product/`.
	 */
	url_handle: string;
	/** Resolved page metadata — what a `meta` export passes to `seo()`. */
	seo: ProductSeo;
	title: string;
	subtitle: string | null;
	/** Badge copy, e.g. "Bestseller". */
	ribbon_text: string | null;
	/** HTML. */
	description: string;
	/** Thumbnail URL. */
	image: string;
	/** Display price in cents: the sale price when on sale, otherwise the regular one. */
	price_in_cents: number;
	currency: string;
	/** Formatting metadata for `price_in_cents`. Null when the product has no priced variant. */
	currency_info: CurrencyInfo | null;
	/**
	 * `price_in_cents` rendered with the currency's own symbol and decimals.
	 * Empty string when the product has no priced variant, so a card that shows it
	 * bare renders nothing — fall back to `price_in_cents` or hide the price.
	 */
	price_formatted: string;
	/**
	 * False when the merchant switched the product off or every variant is sold
	 * out — hide or disable the buy button. A product from `getProduct` reflects
	 * only the switch, so a detail page still checks variant stock.
	 */
	purchasable: boolean;
	order: number;
	site_product_selection: string | null;
	images: ProductImage[];
	options: ProductOption[];
	variants: ProductVariant[];
	collections: ProductCollection[];
	additional_info: ProductAdditionalInfo[];
	seo_settings: ProductSeoSettings | null;
	type: { value: string };
	custom_fields: ProductCustomField[];
	related_products: ProductRelatedProduct[];
	reviews_analytics: ProductReviewsAnalytics | null;
	updated_at: string;
};

/** A product as returned by `getProduct` — the list shape plus detail-page-only fields. */
export type Product = ProductListItem & {
	status: string;
	created_at: string;
	deleted_at: string | null;
	metadata: Record<string, string> | null;
};

export type GetProductsParams = {
	/** Filter by product variant ids. */
	ids?: string[];
	offset?: number | string;
	limit?: number | string;
	order?: 'ASC' | 'DESC' | string;
	sort_by?: string;
	is_hidden?: boolean;
	/** ISO date; only products updated before it. */
	to_date?: string;
	/** Only products of this type. The pricing page uses `"subscription"` to list plans. */
	type?: string;
	/**
	 * Comma separated product types to leave out. Every storefront listing must pass
	 * `"subscription"`: plans are products too, and they belong on the pricing page,
	 * never in a product grid or the cart.
	 */
	exclude_types?: string;
	/** Only products with one of these product type ids. */
	type_ids?: string | string[];
	/** Only products in one of these categories — the ids `getCategories` returns. */
	collection_ids?: string | string[];
	/**
	 * A raw query string merged into the request, e.g. `"order=ASC&sort_by=price"`.
	 * An escape hatch for params this type does not model — prefer `order` and
	 * `sort_by`, and never pass a key here that you also pass as its own param:
	 * both are sent, and the store decides which one wins.
	 */
	sort?: string;
};

export type GetProductsResponse = {
	count: number;
	offset: number;
	limit: number;
	products: ProductListItem[];
};

export type SearchProductsParams = {
	/** Free-text term, matched against the product title. Truncated to 100 characters. */
	query: string;
	/** How many products to return. Capped at 200. */
	pageSize?: number;
};

/**
 * One search hit: the same shape `getProducts` returns, plus two price fields
 * for result cards. Search hits may omit stock, booking and review data, which
 * then come back as null — call `getProduct` before a buy button or booking flow
 * relies on `inventory_quantity` or `booking_event`.
 */
export type SearchProduct = ProductListItem & {
	/** Pre-discount price, null unless discounted. Strike this through, not `price_formatted`. */
	list_price_formatted: string | null;
	/** True when the variants span more than one price, so the card should show "from". */
	is_price_range: boolean;
};

export type SearchProductsResponse = {
	count: number;
	products: SearchProduct[];
};

export type ProductReviewStatus = 'pending' | 'published' | 'rejected' | 'deleted';

export type ProductReview = {
	id: string;
	/** Public name the reviewer chose; null when they left it empty. */
	reviewer_name: string | null;
	comment: string | null;
	/** Whole stars, 1 to 5. */
	rating: number;
	/** Only `published` reviews are public — show anything else as "awaiting approval" or not at all. */
	status: ProductReviewStatus;
	created_at: string;
};

export type GetProductReviewsParams = {
	/** Product id or slug. */
	productId: string;
	offset?: number;
	/** Page size, 25 by default, at most 100. */
	limit?: number;
};

export type GetProductReviewsResponse = {
	reviews: ProductReview[];
	count: number;
	offset: number;
	limit: number;
};

export type CreateProductReviewParams = {
	/** Product id or slug. */
	productId: string;
	/** Never shown publicly; one review per email per product. */
	email: string;
	/** Whole stars, 1 to 5. */
	rating: number;
	/** At most 255 characters. */
	reviewerName?: string;
	/** At most 1000 characters. */
	comment?: string;
	/** The review email's `reviewToken`; marks the review as from a buyer. An invalid one leaves it unverified. */
	verificationToken?: string;
};

export type GetProductParams = {
	/** Look the product up by another field — `"slug"` is what the store supports. */
	field?: string;
};

export type VariantInventory = {
	id: string;
	inventory_quantity: number | null;
};

export type GetProductQuantitiesResponse = {
	variants: VariantInventory[];
};

export type GetProductQuantitiesParams = {
	fields: 'inventory_quantity';
	product_ids: string[];
};

/** A category (collection). Match `Category.id` against `ProductCollection.collection_id`. */
export type Category = {
	id: string;
	title: string;
	image_url: string | null;
	store_id: string;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
	metadata: Record<string, unknown> | null;
};

export type GetCategoriesResponse = {
	categories: Category[];
	count: number;
};

export type CheckoutItemCustomFieldValue = {
	custom_field_id: string;
	value: string;
};

export type CheckoutItem = {
	variant_id: string;
	/** Minimum 1. */
	quantity: number;
	custom_field_values?: CheckoutItemCustomFieldValue[];
	/**
	 * Required on an appointment variant: one of the `slots` strings from
	 * `getTimeSlots`, passed through verbatim (`YYYY-MM-DDTHH:mm:ss`).
	 */
	time_slot?: string;
	/** Required alongside `time_slot`: the IANA zone the slots were listed in. */
	time_zone?: string;
	/**
	 * The customer-entered amount, in cents, for a variant whose
	 * `donation.allow_custom_amount` is true. Required for those variants and
	 * rejected on any other; the store also forces `quantity` to 1. Keep it within
	 * `donation.min_amount`/`max_amount` — see the skill's "Donations" section.
	 */
	donation_amount?: number;
};

export type GetAvailabilityParams = {
	/** From `variant.booking_event.id`. */
	bookingEventId: string;
	/** First day of the range, `YYYY-MM-DD`. */
	fromDate: string;
	/** Last day of the range, `YYYY-MM-DD`, at most 366 days after `fromDate`. */
	toDate: string;
	/** Defaults to the visitor's browser time zone. */
	timeZone?: string;
	/** An existing booking to ignore, when rescheduling. */
	excludeBookingId?: string;
};

export type GetAvailabilityResponse = {
	/** Days with at least one free slot, `YYYY-MM-DD`. */
	available_dates: string[];
	/** Days in the range with nothing free, `YYYY-MM-DD`. */
	disabled_dates: string[];
	/** The zone the days are expressed in. */
	time_zone: string;
};

export type GetTimeSlotsParams = {
	/** From `variant.booking_event.id`. */
	bookingEventId: string;
	/** The day to list, `YYYY-MM-DD`. */
	date: string;
	/** Defaults to the visitor's browser time zone. */
	timeZone?: string;
	/** An existing booking to ignore, when rescheduling. */
	excludeBookingId?: string;
};

export type GetTimeSlotsResponse = {
	/** Free start times, `YYYY-MM-DDTHH:mm:ss`. Pass one verbatim as `CheckoutItem.time_slot`. */
	slots: string[];
	/** The zone the slots are expressed in. Pass it as `CheckoutItem.time_zone`. */
	time_zone: string;
};

/** Links the order to a signed-in PocketBase `users` record, when the site has accounts. */
export type CheckoutCustomer = {
	/** Id of the `users` record. */
	external_id: string;
	email?: string;
};

export type InitializeCheckoutParams = {
	items: CheckoutItem[];
	/**
	 * Absolute URL the buyer returns to after paying. Point it at a route you built
	 * and registered, whose job is to empty the cart and confirm the order.
	 */
	successUrl: string;
	/**
	 * Absolute URL the buyer returns to if they abandon checkout. Nothing was
	 * charged and the cart must still be intact when they arrive.
	 */
	cancelUrl: string;
	/** e.g. "en", "es". */
	locale?: string;
	customer?: CheckoutCustomer;
};

export type InitializeCheckoutResponse = {
	/** Hosted checkout page — redirect the buyer here. */
	url: string;
};

type RawPrice = {
	amount?: number;
	sale_amount?: number | null;
	currency_code?: string;
	currency?: CurrencyInfo;
};

type RawVariant = {
	id?: string;
	title?: string;
	image_url?: string | null;
	sku?: string | null;
	prices?: RawPrice[];
	manage_inventory?: boolean;
	weight?: number | null;
	options?: Partial<ProductVariantOption>[];
	inventory_quantity?: number | null;
	booking_event?: Partial<BookingEvent> | null;
	donation?: Partial<DonationInfo> | null;
};

type RawProduct = {
	id?: string;
	/** The store's own canonical handle. Sent on list responses, absent on single-product ones. */
	url_handle?: string | null;
	slug?: string | null;
	title?: string;
	subtitle?: string | null;
	ribbon_text?: string | null;
	description?: string;
	thumbnail?: string;
	status?: string;
	purchasable?: boolean;
	/** `purchasable` and in stock. Sent on list and search responses, absent on single-product ones. */
	is_available?: boolean;
	order?: number;
	site_product_selection?: string | null;
	/** Present on list responses. */
	images?: Partial<ProductImage>[];
	/** Present on single-product responses. */
	media?: Partial<ProductImage>[];
	options?: (Partial<ProductOption> & { values?: Partial<ProductOptionValue>[] })[];
	variants?: RawVariant[];
	product_collections?: Partial<ProductCollection>[];
	additional_info?: Partial<ProductAdditionalInfo>[];
	seo_settings?: ProductSeoSettings | null;
	page_settings?: { seoSlug?: string | null } | null;
	type?: { value?: string };
	custom_fields?: Partial<ProductCustomField>[];
	related_products?: Partial<ProductRelatedProduct>[];
	reviewsAnalytics?: Partial<ProductReviewsAnalytics> | null;
	updated_at?: string;
	created_at?: string;
	deleted_at?: string | null;
	metadata?: Record<string, string> | null;
};

/** The channel search payload: a raw product plus the fields the v2 route adds. */
type RawSearchProduct = RawProduct & {
	price?: { lowest_amount: number; highest_amount: number; currency_code: string | null } | null;
};

/**
 * Turns cents into a display string using the currency's own decimals and
 * template. Returns an empty string when there is no price (e.g. no sale price).
 *
 * @example formatCurrency(1099, variant.currency_info) // "€10.99"
 */
export const formatCurrency = (
	priceInCents: number | null | undefined,
	currencyInfo: CurrencyInfo | null | undefined,
): string => {
	if (!currencyInfo || priceInCents === null || priceInCents === undefined) {
		return '';
	}

	const { code, symbol, template, decimal_digits } = currencyInfo;
	const currencyDisplay = symbol || code || '€';
	const digits = Number.isInteger(decimal_digits) ? (decimal_digits as number) : 2;
	const amount = (priceInCents / Math.pow(10, digits)).toFixed(digits);

	if (template) {
		return template.replace('$1', amount);
	}

	return `${currencyDisplay}${amount}`;
};

/**
 * Cents → the bare decimal string structured data expects (`1099` → `"10.99"`),
 * with no symbol. Uses the currency's own decimals, so it stays correct for
 * zero-decimal currencies like JPY where dividing by 100 would be 100x wrong.
 *
 * This is for `offers.price` in JSON-LD and similar machine-read values only.
 * Anything a visitor reads uses `formatCurrency` or `price_formatted`.
 *
 * @example toPriceUnits(1099, product.currency_info) // "10.99"
 */
export const toPriceUnits = (
	priceInCents: number,
	currencyInfo: CurrencyInfo | null | undefined,
): string => {
	const digits = Number.isInteger(currencyInfo?.decimal_digits) ? (currencyInfo?.decimal_digits as number) : 2;

	return (priceInCents / Math.pow(10, digits)).toFixed(digits);
};

const extractVariantOptions = (options: Partial<ProductVariantOption>[] | undefined): ProductVariantOption[] => {
	return (options || []).map(opt => ({
		id: opt?.id || '',
		option_id: opt?.option_id || '',
		variant_id: opt?.variant_id || '',
		value: opt?.value || '',
	}));
};

const extractProductOptions = (options: RawProduct['options']): ProductOption[] => {
	return (options || []).map(opt => ({
		id: opt?.id || '',
		title: opt?.title || '',
		values: (opt?.values || []).map(val => ({
			id: val?.id || '',
			option_id: val?.option_id || '',
			variant_id: val?.variant_id || '',
			value: val?.value || '',
		})),
	}));
};

const extractVariants = (variants: RawVariant[] | undefined): ProductVariant[] => {
	return (variants || []).map((v) => {
		const price_in_cents = v?.prices?.[0]?.amount || 0;
		const sale_price_in_cents = v?.prices?.[0]?.sale_amount || null;
		const currency = v?.prices?.[0]?.currency_code || 'eur';

		return {
			id: v?.id || '',
			title: v?.title || '',
			image_url: v?.image_url || null,
			sku: v?.sku || null,
			price_in_cents,
			sale_price_in_cents,
			currency,
			currency_info: v?.prices?.[0]?.currency || null,
			price_formatted: formatCurrency(price_in_cents, v?.prices?.[0]?.currency),
			sale_price_formatted: formatCurrency(sale_price_in_cents, v?.prices?.[0]?.currency),
			manage_inventory: v?.manage_inventory || false,
			weight: v?.weight || null,
			options: extractVariantOptions(v?.options),
			inventory_quantity: v?.inventory_quantity ?? null,
			// Only an event with an id is usable — that id is what the availability
			// calls take — so anything short of one is no booking at all.
			booking_event: v?.booking_event?.id ? (v.booking_event as BookingEvent) : null,
			// Surface donation only for the customer-priced variant; a preset amount
			// arrives without `allow_custom_amount` and is bought at its own price.
			donation: v?.donation?.allow_custom_amount
				? {
					allow_custom_amount: true,
					min_amount: v.donation.min_amount ?? 0,
					max_amount: v.donation.max_amount ?? null,
				}
				: null,
		};
	});
};

const extractImages = (images: Partial<ProductImage>[] | undefined): ProductImage[] => {
	return (images || []).map(img => ({
		url: img?.url || '',
		order: img?.order || 0,
		type: img?.type || '',
	}));
};

const extractCollections = (collections: Partial<ProductCollection>[] | undefined): ProductCollection[] => {
	return (collections || []).map(col => ({
		product_id: col?.product_id || '',
		collection_id: col?.collection_id || '',
		order: col?.order || 0,
	}));
};

const extractAdditionalInfo = (additionalInfo: Partial<ProductAdditionalInfo>[] | undefined): ProductAdditionalInfo[] => {
	return (additionalInfo || []).map(info => ({
		id: info?.id || '',
		order: info?.order || 0,
		title: info?.title || '',
		description: info?.description || '',
	}));
};

const extractCustomFields = (customFields: Partial<ProductCustomField>[] | undefined): ProductCustomField[] => {
	return (customFields || []).map(field => ({
		id: field?.id || '',
		title: field?.title || '',
		is_required: field?.is_required || false,
	}));
};

const extractRelatedProducts = (relatedProducts: Partial<ProductRelatedProduct>[] | undefined): ProductRelatedProduct[] => {
	return (relatedProducts || []).map(rel => ({
		id: rel?.id || '',
		section_title: rel?.section_title || '',
		related_type: rel?.related_type || '',
		related_id: rel?.related_id || '',
		position: rel?.position || 0,
	}));
};

const extractReviewsAnalytics = (
	reviewsAnalytics: Partial<ProductReviewsAnalytics> | null | undefined,
): ProductReviewsAnalytics | null => {
	if (!reviewsAnalytics) {
		return null;
	}

	return {
		product_id: reviewsAnalytics.product_id || '',
		total_reviews: reviewsAnalytics.total_reviews || 0,
		average_rating: reviewsAnalytics.average_rating || 0,
		rating_1_count: reviewsAnalytics.rating_1_count || 0,
		rating_2_count: reviewsAnalytics.rating_2_count || 0,
		rating_3_count: reviewsAnalytics.rating_3_count || 0,
		rating_4_count: reviewsAnalytics.rating_4_count || 0,
		rating_5_count: reviewsAnalytics.rating_5_count || 0,
	};
};

/** A product `description` is HTML, and a meta description has to be plain text. */
const toPlainText = (html: string): string => html
	.replace(/<[^>]*>/g, ' ')
	.replace(/&nbsp;/g, ' ')
	.replace(/&amp;/g, '&')
	.replace(/&lt;/g, '<')
	.replace(/&gt;/g, '>')
	.replace(/&quot;/g, '"')
	.replace(/&#0?39;|&apos;/g, "'")
	.replace(/\s+/g, ' ')
	.trim();

/** Cuts on a word boundary so a snippet never ends mid-word. */
const truncate = (text: string, maxLength: number): string => {
	if (text.length <= maxLength) {
		return text;
	}

	const clipped = text.slice(0, maxLength);
	const lastSpace = clipped.lastIndexOf(' ');

	return `${(lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped).replace(/[\s,;:.]+$/, '')}…`;
};

const resolveSeo = (product: RawProduct): ProductSeo => {
	const seoSettings = product.seo_settings;
	const title = product.title || '';

	return {
		title: seoSettings?.title || title,
		description: seoSettings?.description
			|| truncate(toPlainText(product.description || ''), META_DESCRIPTION_MAX_LENGTH),
		image: seoSettings?.ogImagePath || product.thumbnail || '',
		image_alt: seoSettings?.ogImageAlt || title,
		noindex: seoSettings?.noindex ?? false,
		keywords: seoSettings?.keywords ?? [],
	};
};

const getLowestPriceVariant = (variants: RawVariant[]): RawVariant =>
	variants.reduce((acc, curr) => {
		const accPrice = acc.prices?.[0]?.sale_amount || acc.prices?.[0]?.amount || 0;
		const currPrice = curr.prices?.[0]?.sale_amount || curr.prices?.[0]?.amount || 0;

		return accPrice < currPrice ? acc : curr;
	});

/** The price a card or listing should show: the cheapest variant, or the first one. */
const getProductPrice = (product: RawProduct): {
	price_in_cents: number;
	list_price_in_cents: number;
	currency: string;
	currency_info: CurrencyInfo | null;
} => {
	const allVariants = product.variants || [];

	if (!allVariants.length) {
		return { price_in_cents: 0, list_price_in_cents: 0, currency: 'eur', currency_info: null };
	}

	// A custom-amount donation variant's price is a placeholder, so it must not set
	// the card/listing price. Fall back to every variant only when that leaves none.
	const pricedVariants = allVariants.filter(v => !v.donation?.allow_custom_amount);
	const variants = pricedVariants.length ? pricedVariants : allVariants;

	const selectedVariant
		= product.site_product_selection === 'lowest_price_first' || product.site_product_selection === null
			? getLowestPriceVariant(variants)
			: variants[0];

	const price_in_cents = selectedVariant?.prices?.[0]?.sale_amount || selectedVariant?.prices?.[0]?.amount || 0;
	const list_price_in_cents = selectedVariant?.prices?.[0]?.amount || 0;
	const currency = selectedVariant?.prices?.[0]?.currency_code || 'eur';
	const currency_info = selectedVariant?.prices?.[0]?.currency || null;

	return { price_in_cents, list_price_in_cents, currency, currency_info };
};

/**
 * Thrown by every function here when the store answers with an error status.
 * Some failures are only distinguishable from the response body, so it is kept
 * on `body` — see `isBookingSlotTakenError`.
 */
export class EcommerceApiError extends Error {
	status: number;
	body: { message?: string } | null;

	constructor(status: number, statusText: string, body: { message?: string } | null) {
		super(`HTTP ${status}: ${statusText}`);
		this.name = 'EcommerceApiError';
		this.status = status;
		this.body = body;
	}
}

const BOOKING_SLOT_TAKEN_MESSAGE = 'Booking time slot not available';

/**
 * True when checkout was refused because someone paid for that slot first —
 * possible for any appointment, since listing a slot does not hold it. Recover
 * by re-listing the day with `getTimeSlots` and asking for another time; there
 * is nothing to retry as-is.
 */
export const isBookingSlotTakenError = (error: unknown): boolean =>
	error instanceof EcommerceApiError && error.body?.message === BOOKING_SLOT_TAKEN_MESSAGE;

/** Falls back to UTC where the runtime has no zone. On a server this is the server's zone. */
const getBrowserTimeZone = (): string => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

const TRANSIENT_FETCH_RETRY_DELAY_MS = 250;

const request = async (url: string, init?: RequestInit): Promise<any> => {
	const send = () =>
		fetch(url, {
			...init,
			headers: {
				'Content-Type': 'application/json',
				...init?.headers,
			},
		});

	let response: Response;

	try {
		response = await send();
	} catch (error) {
		// fetch rejects only when no HTTP response arrived (DNS, reset connection), so one
		// retry on an idempotent GET cannot duplicate anything and usually succeeds moments
		// later. A POST that failed mid-flight may still have been applied (checkout,
		// booking), so it is never re-sent.
		if (init?.method && init.method.toUpperCase() !== 'GET') {
			throw error;
		}

		await new Promise(resolve => setTimeout(resolve, TRANSIENT_FETCH_RETRY_DELAY_MS));
		response = await send();
	}

	if (!response.ok) {
		throw new EcommerceApiError(
			response.status,
			response.statusText,
			await response.json().catch(() => null),
		);
	}

	return await response.json();
};

const normalizeProduct = (product: RawProduct, images: Partial<ProductImage>[] | undefined): ProductListItem => {
	const { price_in_cents, currency, currency_info } = getProductPrice(product);

	return {
		id: product.id || '',
		url_handle:
			product.url_handle ||
			product.slug ||
			product.page_settings?.seoSlug ||
			product.seo_settings?.slug ||
			product.id ||
			'',
		seo: resolveSeo(product),
		title: product.title || '',
		subtitle: product.subtitle ?? null,
		ribbon_text: product.ribbon_text ?? null,
		description: product.description || '',
		image: product.thumbnail || '',
		price_in_cents,
		currency,
		currency_info,
		price_formatted: formatCurrency(price_in_cents, currency_info),
		purchasable: product.is_available ?? product.purchasable ?? false,
		order: product.order || 0,
		site_product_selection: product.site_product_selection ?? null,
		images: extractImages(images),
		options: extractProductOptions(product.options),
		variants: extractVariants(product.variants),
		collections: extractCollections(product.product_collections),
		additional_info: extractAdditionalInfo(product.additional_info),
		seo_settings: product.seo_settings ?? null,
		type: { value: product.type?.value || '' },
		custom_fields: extractCustomFields(product.custom_fields),
		related_products: extractRelatedProducts(product.related_products),
		reviews_analytics: extractReviewsAnalytics(product.reviewsAnalytics),
		updated_at: product.updated_at || '',
	};
};

/**
 * GET /store/{store_id}/products — paginated product list.
 *
 * Subscription plans come back like any other product, so storefront listings
 * exclude them and the pricing page asks for them on its own with
 * `getProducts({ type: 'subscription' })`.
 *
 * @example
 * // apps/web/src/routes/shop.tsx
 * export async function loader() {
 *   const { products } = await getProducts({
 *     limit: 24,
 *     sort_by: 'order',
 *     order: 'ASC',
 *     exclude_types: 'subscription',
 *   });
 *   return { products };
 * }
 */
export async function getProducts({
	ids,
	offset,
	limit,
	order,
	sort_by,
	is_hidden,
	to_date,
	type,
	exclude_types,
	type_ids,
	collection_ids,
	sort,
}: GetProductsParams = {}): Promise<GetProductsResponse> {
	const queryParams = new URLSearchParams(sort || '');

	if (ids) {
		ids.forEach((id) => {
			queryParams.append('ids[]', id);
		});
	}

	if (offset) {
		queryParams.append('offset', String(offset));
	}

	if (limit) {
		queryParams.append('limit', String(limit));
	}

	if (order) {
		queryParams.append('order', String(order).toUpperCase());
	}

	if (sort_by) {
		queryParams.append('sort_by', String(sort_by));
	}

	if (is_hidden) {
		queryParams.append('is_hidden', String(is_hidden));
	}

	if (to_date) {
		queryParams.append('to_date', String(to_date));
	}

	if (type) {
		queryParams.append('type', String(type));
	}

	if (exclude_types) {
		queryParams.append('exclude_types', String(exclude_types));
	}

	if (type_ids) {
		const typeIdList = Array.isArray(type_ids) ? type_ids : [type_ids];

		typeIdList.forEach((id) => {
			queryParams.append('type_ids', String(id));
		});
	}

	if (collection_ids) {
		const collectionIdList = Array.isArray(collection_ids) ? collection_ids : [collection_ids];

		collectionIdList.forEach((id) => {
			queryParams.append('collection_ids[]', String(id));
		});
	}

	const queryString = queryParams.toString();
	const data = await request(
		`${ECOMMERCE_API_URL}/store/${ECOMMERCE_STORE_ID}/products${queryString ? `?${queryString}` : ''}`,
	);

	return {
		count: data.count,
		offset: data.offset,
		limit: data.limit,
		products: (data.products || []).map((product: RawProduct) => normalizeProduct(product, product.images)),
	};
}

const isProductPathSegment = (value: string): boolean =>
	value !== '' && value !== '.' && value !== '..' && !/[/\\]/.test(value);

/**
 * GET /store/{store_id}/products/{id} — one product with every detail field.
 *
 * Takes a raw id, so it is the wrong entry point for a product page URL — use
 * `getProductByHandle` there and keep the id out of the address bar.
 *
 * @example
 * const product = await getProduct(line.productId);
 */
export async function getProduct(id: string, { field }: GetProductParams = {}): Promise<Product> {
	if (!isProductPathSegment(id)) {
		throw new EcommerceApiError(404, 'Not Found', null);
	}

	const queryParams = new URLSearchParams();

	if (field) {
		queryParams.append('field', String(field));
	}

	const queryString = queryParams.toString();
	const data = await request(
		`${ECOMMERCE_API_URL}/store/${ECOMMERCE_STORE_ID}/products/${encodeURIComponent(id)}${queryString ? `?${queryString}` : ''}`,
	);
	const product: RawProduct = data.product;

	return {
		...normalizeProduct(product, product.media),
		status: product.status || '',
		created_at: product.created_at || '',
		deleted_at: product.deleted_at ?? null,
		metadata: product.metadata ?? null,
	};
}

/**
 * The same lookup as `getProduct`, keyed by `seo_settings.slug` instead of the
 * id. Prefer `getProductByHandle` unless you know the value is a slug.
 */
export async function getProductBySlug(slug: string): Promise<Product> {
	return await getProduct(slug, { field: 'slug' });
}

/**
 * Resolves whatever `url_handle` put in the URL — slug or id — back to the
 * product. **This is what a product page loader calls**, so the page works for
 * the slug URLs you link everywhere and still answers an older id URL someone
 * bookmarked or a search engine already indexed.
 *
 * A slug is unique within the store but the merchant can change it, so a handle
 * that no longer exists is an ordinary 404 rather than a bug.
 *
 * @example
 * // apps/web/src/routes/product.$handle.tsx
 * export async function loader({ params }: Route.LoaderArgs) {
 *   try {
 *     return { product: await getProductByHandle(params.handle) };
 *   }
 *   catch (error) {
 *     if (error instanceof EcommerceApiError && error.status === 404) {
 *       throw new Response('Not found', { status: 404 });
 *     }
 *
 *     throw error;
 *   }
 * }
 */
export async function getProductByHandle(handle: string): Promise<Product> {
	return handle.startsWith(PRODUCT_ID_PREFIX)
		? await getProduct(handle)
		: await getProductBySlug(handle);
}

/**
 * GET /store/{store_id}/variants — live stock, so a buyer cannot order what is
 * sold out. Only meaningful for variants with `manage_inventory: true`, and
 * worth re-checking right before checkout rather than trusting a cached list.
 *
 * @example
 * const { variants } = await getProductQuantities({
 *   fields: 'inventory_quantity',
 *   product_ids: ['prod_123'],
 * });
 */
export async function getProductQuantities({
	fields,
	product_ids,
}: GetProductQuantitiesParams): Promise<GetProductQuantitiesResponse> {
	const queryParams = new URLSearchParams();

	queryParams.append('fields', fields);

	product_ids.forEach((id) => {
		queryParams.append('product_ids[]', id);
	});

	const data = await request(
		`${ECOMMERCE_API_URL}/store/${ECOMMERCE_STORE_ID}/variants?${queryParams.toString()}`,
	);

	return {
		variants: (data.variants || []).map((variant: Partial<VariantInventory>) => ({
			id: variant.id || '',
			inventory_quantity: variant.inventory_quantity ?? null,
		})),
	};
}

/**
 * GET /store/{store_id}/collections — every category, for filters and menus.
 * Filter products client-side by matching `Category.id` against a product's
 * `collections[].collection_id`.
 */
export async function getCategories(): Promise<GetCategoriesResponse> {
	const data = await request(`${ECOMMERCE_API_URL}/store/${ECOMMERCE_STORE_ID}/collections`);

	return {
		categories: (data.collections || []).map((collection: Partial<Category>) => ({
			id: collection.id || '',
			title: collection.title || '',
			image_url: collection.image_url ?? null,
			store_id: collection.store_id || '',
			created_at: collection.created_at || '',
			updated_at: collection.updated_at || '',
			deleted_at: collection.deleted_at ?? null,
			metadata: collection.metadata ?? null,
		})),
		count: data.count,
	};
}

/**
 * POST /store/availability — which days still have a free slot for an appointment.
 * Not store-scoped: it is keyed by the booking event, not the store.
 *
 * Browser only. It answers in a time zone, and on the server that would be the
 * server's — the visitor would be offered the wrong times. Availability also
 * changes as people book, while server-rendered HTML is edge-cached for a week.
 * So keep the product in the route's `loader` and load days in an effect.
 *
 * The two dates are local day keys (`toLocaleDateString('en-CA', ...)` with
 * explicit date parts and no `timeZone`), not a UTC ISO slice, which near
 * midnight would ask for the wrong first day.
 *
 * @example
 * // Inside the slot picker component.
 * const dayKeyOptions = { year: 'numeric', month: '2-digit', day: '2-digit' } as const;
 *
 * useEffect(() => {
 *   let isCurrent = true;
 *   const today = new Date();
 *   const windowEnd = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
 *
 *   getAvailability({
 *     bookingEventId,
 *     fromDate: today.toLocaleDateString('en-CA', dayKeyOptions),
 *     toDate: windowEnd.toLocaleDateString('en-CA', dayKeyOptions),
 *   })
 *     .then(({ available_dates }) => isCurrent && setDays(available_dates))
 *     .catch(() => isCurrent && setError('Could not load availability.'));
 *
 *   return () => {
 *     isCurrent = false;
 *   };
 * }, [bookingEventId]);
 */
export async function getAvailability({
	bookingEventId,
	fromDate,
	toDate,
	timeZone,
	excludeBookingId,
}: GetAvailabilityParams): Promise<GetAvailabilityResponse> {
	const data = await request(`${ECOMMERCE_API_URL}/store/availability`, {
		method: 'POST',
		body: JSON.stringify({
			booking_event_id: bookingEventId,
			from_date: fromDate,
			to_date: toDate,
			time_zone: timeZone || getBrowserTimeZone(),
			...(excludeBookingId ? { exclude_booking_id: excludeBookingId } : {}),
		}),
	});

	return {
		available_dates: data.available_dates || [],
		disabled_dates: data.disabled_dates || [],
		time_zone: data.time_zone,
	};
}

/**
 * POST /store/time-slots — the free start times for one day. Browser only, for
 * the same reasons as `getAvailability`.
 *
 * A slot is not held by being listed, so re-list the day after a failed checkout
 * (`isBookingSlotTakenError`) instead of retrying the same time.
 *
 * @example
 * const { slots, time_zone } = await getTimeSlots({
 *   bookingEventId: variant.booking_event.id,
 *   date: '2026-09-14',
 * });
 * // slots[0] === '2026-09-14T10:00:00' -> items[0].time_slot, with time_zone
 */
export async function getTimeSlots({
	bookingEventId,
	date,
	timeZone,
	excludeBookingId,
}: GetTimeSlotsParams): Promise<GetTimeSlotsResponse> {
	const data = await request(`${ECOMMERCE_API_URL}/store/time-slots`, {
		method: 'POST',
		body: JSON.stringify({
			booking_event_id: bookingEventId,
			date,
			time_zone: timeZone || getBrowserTimeZone(),
			...(excludeBookingId ? { exclude_booking_id: excludeBookingId } : {}),
		}),
	});

	return {
		slots: data.slots || [],
		time_zone: data.time_zone,
	};
}

const getCheckoutLanguage = async (): Promise<string | undefined> => {
	const data = await request(`${ECOMMERCE_API_URL}/store/${ECOMMERCE_STORE_ID}/settings`);

	return data.store_owner?.language;
};

/** A whole `ProductVariant` fits; a cart line only needs the fields it already stores. */
export type EcommerceTrackingItem = {
	product: Pick<ProductListItem, 'id' | 'title'>;
	variant: Pick<ProductVariant, 'id' | 'price_in_cents' | 'currency_info'>
		& Partial<Pick<ProductVariant, 'title' | 'sale_price_in_cents' | 'currency'>>;
	/** Defaults to 1. */
	quantity?: number;
};

type AnalyticsItem = {
	item_id: string;
	item_name: string;
	item_variant?: string;
	price: number;
	quantity: number;
};

declare global {
	interface Window {
		horizonsEcommerceTracking?: {
			track: (event: string, payload: { currency: string; value: number; items: AnalyticsItem[] }) => void;
		};
	}
}

const toAnalyticsItem = ({ product, variant, quantity = 1 }: EcommerceTrackingItem): AnalyticsItem => ({
	item_id: variant.id || product.id,
	item_name: product.title,
	...(variant.title && { item_variant: variant.title }),
	price: Number(toPriceUnits(variant.sale_price_in_cents ?? variant.price_in_cents, variant.currency_info)),
	quantity,
});

/**
 * Reports a storefront event to the merchant's Google Analytics and Meta Pixel.
 * Browser-only and safe to call anywhere: it does nothing on the server, and
 * nothing until the merchant connects them in the store dashboard and the site is
 * published. Call it from event handlers and effects, never from a `loader`.
 *
 * @example
 * trackEcommerceEvent({ event: EcommerceTrackingEvent.AddToCart, items: [{ product, variant, quantity }] });
 */
export function trackEcommerceEvent({ event, items }: { event: EcommerceTrackingEvent; items: EcommerceTrackingItem[] }): void {
	if (typeof window === 'undefined' || !items.length) {
		return;
	}

	const analyticsItems = items.map(toAnalyticsItem);

	const { variant } = items[0];

	window.horizonsEcommerceTracking?.track(event, {
		currency: (variant.currency || variant.currency_info?.code || '').toUpperCase(),
		value: analyticsItems.reduce((total, item) => total + item.price * item.quantity, 0),
		items: analyticsItems,
	});
}

const readConsentCategories = (): string[] | null => {
	const prefix = `${CONSENT_COOKIE}=`;
	const cookie = document.cookie.split('; ').find(entry => entry.startsWith(prefix));

	try {
		const categories: unknown = cookie ? JSON.parse(decodeURIComponent(cookie.slice(prefix.length))).categories : null;

		return Array.isArray(categories) ? categories : null;
	} catch {
		return null;
	}
};

const getCheckoutConsentParams = (): string => {
	const categories = readConsentCategories();
	const isAccepted = (category: string) => !!categories?.includes(category);

	return new URLSearchParams({
		cookieConsentAnalytics: isAccepted('analytics') ? '1' : '0',
		cookieConsentMarketing: isAccepted('marketing') ? '1' : '0',
		cookieConsentPlatformAnalytics: isAccepted('platformAnalytics') ? '1' : '0',
	}).toString();
};

const getDomainCheckoutUrl = async (): Promise<string | undefined> => {
	if (typeof window === 'undefined') {
		return undefined;
	}

	const { protocol, origin } = window.location;

	if (protocol !== 'https:') {
		return undefined;
	}

	try {
		const response = await fetch(`${DOMAIN_CHECKOUT_PATH}?probe=${Date.now()}`, {
			cache: 'no-store',
			signal: AbortSignal.timeout(DOMAIN_CHECKOUT_PROBE_TIMEOUT_MS),
		});

		return response.ok && (await response.text()).includes(DOMAIN_CHECKOUT_MARKER)
			? `${origin}${DOMAIN_CHECKOUT_PATH}`
			: undefined;
	} catch {
		return undefined;
	}
};

/**
 * POST /store/{store_id}/checkout — creates a payment session and returns the
 * checkout URL. Redirect the buyer to it; there is no local payment step. The URL
 * is usually this site's own `/checkout/` page, which the platform serves — never
 * create a route, page or file at `/checkout` itself.
 *
 * `successUrl` / `cancelUrl` must be absolute, so build them from the current
 * origin. Call this from a click handler (it needs `window.location.origin` and
 * ends in a redirect), not from a server `loader`.
 *
 * Both are pages you have to build and register, because the buyer is sent to them
 * whether they exist or not. The success page is what empties the cart — this
 * client never touches `localStorage` — while the cancel page leaves it alone. Do
 * not clear the cart before redirecting: an abandoned checkout has to come back to
 * a full one.
 *
 * An appointment is checked out on its own: exactly one item, `quantity: 1`, with
 * the chosen `time_slot` and its `time_zone`. Mixing a booking with anything else
 * is rejected, which is why bookings never enter the cart.
 *
 * @example
 * const { url } = await initializeCheckout({
 *   items: cart.map(line => ({ variant_id: line.variantId, quantity: line.quantity })),
 *   successUrl: `${window.location.origin}/checkout/success`,
 *   cancelUrl: `${window.location.origin}/checkout/cancelled`,
 * });
 * window.location.href = url;
 *
 * @example
 * // An appointment, straight from the slot picker.
 * const { url } = await initializeCheckout({
 *   items: [{ variant_id: variant.id, quantity: 1, time_slot: slot, time_zone: timeZone }],
 *   successUrl: `${window.location.origin}/checkout/success`,
 *   cancelUrl: `${window.location.origin}/product/${product.url_handle}`,
 * });
 */
export async function initializeCheckout({
	items,
	successUrl,
	cancelUrl,
	locale,
	customer,
}: InitializeCheckoutParams): Promise<InitializeCheckoutResponse> {
	const languagePromise = getCheckoutLanguage().catch(() => 'en');
	const checkoutUrl = await getDomainCheckoutUrl();

	const data = await request(`${ECOMMERCE_API_URL}/store/${ECOMMERCE_STORE_ID}/checkout`, {
		method: 'POST',
		body: JSON.stringify({
			items,
			successUrl,
			cancelUrl,
			checkoutUrl,
			locale,
			timeZone: getBrowserTimeZone(),
			customer,
		}),
	});
	const language = await languagePromise;

	return { url: `${data.url}&lang=${language?.toLowerCase() || 'en'}&${getCheckoutConsentParams()}` };
}

/**
 * GET /v2/channels/{sales_channel_id}/products?q= — free-text product search.
 *
 * Requires the site's sales channel id (`scha_*`); a raw store id is not accepted.
 * Scoped to this site's sales channel, so a product sold only through another
 * channel never shows up. Matching is case-insensitive over the product title,
 * and a term with no word of 3 or more characters matches nothing.
 *
 * Hits come back as {@link SearchProduct}, the `getProducts` shape plus
 * `list_price_formatted` and `is_price_range`, so the same product card renders
 * both. Stock and booking data may be missing — call `getProduct` once the
 * visitor picks a result.
 *
 * @example
 * // apps/web/src/routes/search.tsx
 * export async function loader({ request }: Route.LoaderArgs) {
 *   const query = new URL(request.url).searchParams.get('q') || '';
 *   return await searchProducts({ query });
 * }
 */
export async function searchProducts({
	query,
	pageSize = DEFAULT_SEARCH_LIMIT,
}: SearchProductsParams): Promise<SearchProductsResponse> {
	const trimmedQuery = query?.trim();

	if (!trimmedQuery) {
		return { products: [], count: 0 };
	}

	if (!ECOMMERCE_STORE_ID) {
		throw new Error('Product search is unavailable: this site has no ecommerce sales channel');
	}

	const queryParams = new URLSearchParams({
		q: trimmedQuery.slice(0, MAX_SEARCH_QUERY_LENGTH),
		limit: String(Math.min(pageSize, MAX_SEARCH_LIMIT)),
	});

	try {
		const data = await request(`${ECOMMERCE_API_URL}/v2/channels/${ECOMMERCE_STORE_ID}/products?${queryParams}`);

		return {
			count: data.count || 0,
			products: (data.data || []).map((product: RawSearchProduct) => {
				const { price_in_cents, list_price_in_cents, currency_info } = getProductPrice(product);
				const priceRange = product.price;

				return {
					...normalizeProduct(product, product.images),
					list_price_formatted: list_price_in_cents > price_in_cents
						? formatCurrency(list_price_in_cents, currency_info)
						: null,
					is_price_range: Boolean(priceRange && priceRange.lowest_amount !== priceRange.highest_amount),
				};
			}),
		};
	} catch (error) {
		// A query with no word of 3 or more characters matches nothing, which is an ordinary
		// keystroke. Every other status propagates, so a missing or inactive sales channel is
		// never mistaken for 0 hits.
		if (error instanceof EcommerceApiError && error.status === 400) {
			return { products: [], count: 0 };
		}

		throw error;
	}
}

/**
 * GET /v2/channels/{sales_channel_id}/products/{id_or_slug}/reviews — a product's published reviews.
 *
 * Resolves to `null` when the merchant has not switched reviews on for this site (the store
 * answers 403), so a product page hides its reviews section instead of failing.
 * `product.reviews_analytics` already holds the average and per-star counts; use this for the
 * review list itself.
 *
 * @example
 * const reviews = await getProductReviews({ productId: product.id });
 */
export async function getProductReviews({
	productId,
	offset,
	limit,
}: GetProductReviewsParams): Promise<GetProductReviewsResponse | null> {
	const queryParams = new URLSearchParams();

	if (offset !== undefined) {
		queryParams.append('offset', String(offset));
	}

	if (limit) {
		queryParams.append('limit', String(limit));
	}

	const queryString = queryParams.toString();

	try {
		const data = await request(
			`${ECOMMERCE_API_URL}/v2/channels/${ECOMMERCE_STORE_ID}/products/${encodeURIComponent(productId)}/reviews${queryString ? `?${queryString}` : ''}`,
		);

		return {
			reviews: data.data || [],
			count: data.count || 0,
			offset: data.offset || 0,
			limit: data.limit || 0,
		};
	} catch (error) {
		if (error instanceof EcommerceApiError && error.status === 403) {
			return null;
		}

		throw error;
	}
}

/**
 * POST /v2/channels/{sales_channel_id}/products/{id_or_slug}/reviews — submit a shopper's review.
 *
 * The store decides whether it is published at once or waits for the merchant's approval, so
 * read `status` before adding it to the visible list. A second review from the same email for
 * the same product throws an `EcommerceApiError` with status 409.
 */
export async function createProductReview({
	productId,
	email,
	rating,
	reviewerName,
	comment,
	verificationToken,
}: CreateProductReviewParams): Promise<ProductReview> {
	const data = await request(
		`${ECOMMERCE_API_URL}/v2/channels/${ECOMMERCE_STORE_ID}/products/${encodeURIComponent(productId)}/reviews`,
		{
			method: 'POST',
			body: JSON.stringify({
				email,
				rating,
				reviewer_name: reviewerName || '',
				comment: comment || '',
				...(verificationToken ? { verification_token: verificationToken } : {}),
			}),
		},
	);

	return data.data;
}
