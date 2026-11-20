import { useCallback, useEffect, useState } from 'react';
import {
	acceptAllCookies,
	CookieConsentCategory,
	hasConsentDecision,
	isConsentGranted,
	onCookiePreferencesRequested,
	rejectOptionalCookies,
	saveConsent,
} from '@/lib/cookie-consent';

export type CookieChoices = {
	analytics: boolean;
	marketing: boolean;
	platformAnalytics: boolean;
};

const NO_OPTIONAL_COOKIES: CookieChoices = {
	analytics: false,
	marketing: false,
	platformAnalytics: false,
};

const grantedChoices = (): CookieChoices => ({
	analytics: isConsentGranted(CookieConsentCategory.Analytics),
	marketing: isConsentGranted(CookieConsentCategory.Marketing),
	platformAnalytics: isConsentGranted(CookieConsentCategory.PlatformAnalytics),
});

/**
 * Everything the site's cookie banner does, and nothing about how it looks:
 * render whatever markup fits the site from these values.
 *
 * - `isOpen` is false on the server and during hydration, then true until the
 *   visitor decides, so the banner never flashes for someone who already chose.
 * - A footer "Cookie settings" link calling `openCookiePreferences()` from
 *   `@/lib/cookie-consent` reopens it with `isCustomizing` true and the toggles
 *   pre-filled from what the visitor granted before.
 * - Toggles start unticked: never pre-tick an optional category.
 *
 *   const banner = useCookieBanner();
 *   if (!banner.isOpen) return null;
 *   // banner.acceptAll, banner.rejectOptional, banner.customize,
 *   // banner.choices + banner.setChoice('analytics', checked), banner.saveChoices
 */
export function useCookieBanner() {
	const [isOpen, setIsOpen] = useState(false);
	const [isCustomizing, setIsCustomizing] = useState(false);
	const [choices, setChoices] = useState<CookieChoices>(NO_OPTIONAL_COOKIES);

	useEffect(() => {
		setIsOpen(!hasConsentDecision());

		return onCookiePreferencesRequested(() => {
			setChoices(grantedChoices());
			setIsCustomizing(true);
			setIsOpen(true);
		});
	}, []);

	const finish = useCallback((save: () => void) => {
		save();
		setIsCustomizing(false);
		setIsOpen(false);
	}, []);

	const setChoice = useCallback((category: keyof CookieChoices, isGranted: boolean) => {
		setChoices(current => ({ ...current, [category]: isGranted }));
	}, []);

	const customize = useCallback(() => {
		setChoices(grantedChoices());
		setIsCustomizing(true);
	}, []);

	const acceptAll = useCallback(() => finish(acceptAllCookies), [finish]);
	const rejectOptional = useCallback(() => finish(rejectOptionalCookies), [finish]);
	const saveChoices = useCallback(() => finish(() => saveConsent(choices)), [finish, choices]);

	return {
		isOpen,
		isCustomizing,
		choices,
		setChoice,
		customize,
		acceptAll,
		rejectOptional,
		saveChoices,
	};
}
