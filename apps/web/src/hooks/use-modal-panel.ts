import { type RefObject, useEffect } from 'react';

const FOCUSABLE =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal behaviour for the cart drawer, the mobile menu and the filter drawer:
 * Escape closes, Tab stays inside the panel, the page behind does not scroll,
 * and focus returns to whatever opened the panel.
 */
export function useModalPanel(isOpen: boolean, onClose: () => void, panelRef: RefObject<HTMLElement | null>) {
	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const panel = panelRef.current;

		if (!panel) {
			return;
		}

		const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		const previousOverflow = document.body.style.overflow;

		document.body.style.overflow = 'hidden';

		const focusables = () => Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));

		(focusables()[0] ?? panel).focus();

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				event.preventDefault();
				onClose();

				return;
			}

			if (event.key !== 'Tab') {
				return;
			}

			const items = focusables();
			const first = items[0];
			const last = items[items.length - 1];

			if (!first || !last) {
				return;
			}

			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		};

		document.addEventListener('keydown', onKeyDown);

		return () => {
			document.removeEventListener('keydown', onKeyDown);
			document.body.style.overflow = previousOverflow;

			if (opener?.isConnected) {
				opener.focus();
			}
		};
	}, [isOpen, onClose, panelRef]);
}
