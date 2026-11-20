/**
 * Number, money and date formatting that renders the same on the server and in
 * the browser, so it never breaks hydration. Every function takes the site's
 * locale explicitly (the BCP 47 tag in `<html lang>`), because the server's own
 * locale and time zone are not the visitor's.
 *
 * Store prices are not formatted here: use `formatCurrency(cents, currencyInfo)`
 * or `price_formatted` from `@/api/ecommerce-api`, which follow the merchant's
 * currency settings.
 */

type DateInput = Date | string | number;

type LocaleOption = {
	/** BCP 47 tag of the site's language, e.g. `'en'`, `'de-AT'`, `'pt-BR'`. */
	locale: string;
};

type DateOptions = LocaleOption & Intl.DateTimeFormatOptions & {
	/**
	 * IANA zone the date or time belongs to. Defaults to UTC so a date-only value
	 * (`'2026-05-01'`) prints as that day everywhere. Pass the business's own zone
	 * (`'Europe/Vilnius'`) for opening hours, events and anything with a time.
	 */
	timeZone?: string;
};

const toDate = (value: DateInput) => (value instanceof Date ? value : new Date(value));

/** The caller's own parts (`month`, `weekday`, …) win; a style is only the fallback for none. */
const dateFormatter = (
	{ locale, timeZone = 'UTC', ...options }: DateOptions,
	fallback: Intl.DateTimeFormatOptions,
) => new Intl.DateTimeFormat(locale, { timeZone, ...(Object.keys(options).length ? options : fallback) });

/** `formatNumber(1234.5, { locale: 'de' })` → `"1.234,5"` */
export const formatNumber = (
	value: number,
	{ locale, ...options }: LocaleOption & Intl.NumberFormatOptions,
): string => new Intl.NumberFormat(locale, options).format(value);

/**
 * Amounts in major units (`12.5`, not cents) with an ISO currency code, for menus,
 * price lists and quotes that do not come from the store.
 *
 * `formatMoney(12.5, { locale: 'fr', currency: 'EUR' })` → `"12,50 €"`
 */
export const formatMoney = (
	amount: number,
	{ locale, currency, ...options }: LocaleOption & { currency: string } & Intl.NumberFormatOptions,
): string => new Intl.NumberFormat(locale, { style: 'currency', currency, ...options }).format(amount);

/** `formatDate('2026-05-01', { locale: 'en' })` → `"May 1, 2026"` */
export const formatDate = (value: DateInput, options: DateOptions): string =>
	dateFormatter(options, { dateStyle: 'long' }).format(toDate(value));

/** `formatTime('2026-05-01T09:30:00Z', { locale: 'en', timeZone: 'Europe/London' })` → `"10:30 AM"` */
export const formatTime = (value: DateInput, options: DateOptions): string =>
	dateFormatter(options, { timeStyle: 'short' }).format(toDate(value));

/** `formatDateRange('2026-05-01', '2026-05-03', { locale: 'en' })` → `"May 1 – 3, 2026"` */
export const formatDateRange = (start: DateInput, end: DateInput, options: DateOptions): string =>
	dateFormatter(options, { dateStyle: 'long' }).formatRange(toDate(start), toDate(end));
