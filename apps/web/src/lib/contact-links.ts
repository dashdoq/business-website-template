/**
 * `href`s for the ways a visitor reaches the business: call, email, WhatsApp,
 * directions. Pass numbers in full international form (`+370 612 34567`);
 * spaces, dashes and brackets are stripped here.
 */

const digitsOnly = (value: string) => value.replace(/\D/g, '');

/** `telHref('+370 612 34567')` → `"tel:+37061234567"` */
export const telHref = (phone: string): string => {
	const isInternational = phone.trim().startsWith('+');

	return `tel:${isInternational ? '+' : ''}${digitsOnly(phone)}`;
};

/**
 * Encoded with `encodeURIComponent`, not `URLSearchParams`: mail clients show the
 * `+` that `URLSearchParams` uses for spaces literally.
 */
export const mailtoHref = ({ email, subject, body }: { email: string; subject?: string; body?: string }): string => {
	const params = [
		subject && `subject=${encodeURIComponent(subject)}`,
		body && `body=${encodeURIComponent(body)}`,
	].filter(Boolean);

	return `mailto:${email}${params.length ? `?${params.join('&')}` : ''}`;
};

/**
 * Opens a WhatsApp chat with an optional prefilled message. The number must
 * include the country code: wa.me rejects local numbers and a leading 0.
 *
 * `whatsappUrl({ phone: '+370 612 34567', text: 'Hi! I would like to book a table.' })`
 */
export const whatsappUrl = ({ phone, text }: { phone: string; text?: string }): string =>
	`https://wa.me/${digitsOnly(phone)}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

/** Directions or a pin for an address or place name, in whatever maps app the visitor uses. */
export const mapsUrl = ({ query }: { query: string }): string =>
	`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
