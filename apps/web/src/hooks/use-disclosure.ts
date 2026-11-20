import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useLocation } from 'react-router';

type DisclosureOptions = {
	isInitiallyOpen?: boolean;
	/** Close when the route changes — what a mobile menu needs after a link is tapped. */
	closeOnNavigate?: boolean;
	closeOnEscape?: boolean;
	/** Stop the page scrolling behind a full-screen menu or drawer while it is open. */
	lockScroll?: boolean;
};

/**
 * Open/close behaviour for anything that shows and hides a panel: a mobile menu,
 * a dropdown, a drawer, a modal-like overlay, a "read more". It carries no markup
 * or styling; spread the props onto the elements the site designs.
 *
 *   const menu = useDisclosure({ lockScroll: true });
 *   <button type="button" {...menu.triggerProps} aria-label="Menu">…</button>
 *   {menu.isOpen && <nav {...menu.panelProps}>…</nav>}
 *
 * Escape closes it and returns focus to the trigger; navigating closes it by
 * default. For a list of independently opening items (an FAQ), give each item
 * its own `useDisclosure` or use a native `<details>`.
 */
export function useDisclosure({
	isInitiallyOpen = false,
	closeOnNavigate = true,
	closeOnEscape = true,
	lockScroll = false,
}: DisclosureOptions = {}) {
	const [isOpen, setIsOpen] = useState(isInitiallyOpen);
	const panelId = useId();
	const triggerRef = useRef<HTMLElement | null>(null);
	const { pathname } = useLocation();
	const previousPathname = useRef(pathname);

	const open = useCallback(() => setIsOpen(true), []);
	const close = useCallback(() => setIsOpen(false), []);
	const toggle = useCallback(() => setIsOpen(current => !current), []);
	const setTriggerRef = useCallback((node: HTMLElement | null) => {
		triggerRef.current = node;
	}, []);

	useEffect(() => {
		if (previousPathname.current === pathname) {
			return;
		}

		previousPathname.current = pathname;

		if (closeOnNavigate) {
			setIsOpen(false);
		}
	}, [pathname, closeOnNavigate]);

	useEffect(() => {
		if (!isOpen || !closeOnEscape) {
			return;
		}

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== 'Escape') {
				return;
			}

			setIsOpen(false);
			triggerRef.current?.focus();
		};

		document.addEventListener('keydown', onKeyDown);

		return () => document.removeEventListener('keydown', onKeyDown);
	}, [isOpen, closeOnEscape]);

	useEffect(() => {
		if (!isOpen || !lockScroll) {
			return;
		}

		const previousOverflow = document.body.style.overflow;

		document.body.style.overflow = 'hidden';

		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, [isOpen, lockScroll]);

	return {
		isOpen,
		open,
		close,
		toggle,
		triggerProps: {
			ref: setTriggerRef,
			onClick: toggle,
			'aria-expanded': isOpen,
			'aria-controls': panelId,
		},
		panelProps: {
			id: panelId,
		},
	};
}
