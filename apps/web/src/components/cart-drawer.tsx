import { X } from 'lucide-react';
import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { cartLineKey, useCart } from '@/hooks/use-ecommerce-cart';
import { useModalPanel } from '@/hooks/use-modal-panel';
import { CartLineItem, CartSummary, EmptyCart } from '@/components/cart-parts';

type DrawerState = { isOpen: boolean; open: () => void; close: () => void };

const CartDrawerContext = createContext<DrawerState | null>(null);

export function CartDrawerProvider({ children }: { children: ReactNode }) {
	const [isOpen, setIsOpen] = useState(false);
	const open = useCallback(() => setIsOpen(true), []);
	const close = useCallback(() => setIsOpen(false), []);
	const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);

	return (
		<CartDrawerContext.Provider value={value}>
			{children}
			<CartDrawer />
		</CartDrawerContext.Provider>
	);
}

export function useCartDrawer(): DrawerState {
	const context = useContext(CartDrawerContext);

	if (!context) {
		throw new Error('useCartDrawer must be used inside <CartDrawerProvider>');
	}

	return context;
}

/** Slides in from the right after something is added, with the same content as /winkelwagen. */
function CartDrawer() {
	const { isOpen, close } = useCartDrawer();
	const cart = useCart();
	const panelRef = useRef<HTMLDivElement>(null);

	useModalPanel(isOpen, close, panelRef);

	if (!isOpen) {
		return null;
	}

	const count = cart.lines.reduce((sum, line) => sum + line.quantity, 0);

	return (
		<div className="fixed inset-0 z-50">
			<div className="absolute inset-0 animate-fade-in bg-ink/40" onClick={close} aria-hidden="true" />
			<div
				ref={panelRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby="cart-drawer-title"
				tabIndex={-1}
				className="absolute inset-y-0 right-0 flex w-[min(28rem,100vw)] animate-drawer-in flex-col bg-paper"
			>
				<div className="flex items-center justify-between border-b border-line px-5 py-4">
					<h2 id="cart-drawer-title" className="text-lg font-semibold">
						Uw selectie <span className="font-normal text-stone tabular-nums">({count})</span>
					</h2>
					<button
						type="button"
						onClick={close}
						aria-label="Sluiten"
						className="-mr-2 grid size-11 place-items-center rounded-full hover:bg-tile"
					>
						<X size={22} aria-hidden="true" />
					</button>
				</div>

				{cart.isLoading ? (
					<p className="p-5">Uw selectie wordt geladen…</p>
				) : !cart.lines.length ? (
					<div className="flex flex-1 items-center px-6">
						<EmptyCart onNavigate={close} />
					</div>
				) : (
					<>
						<ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
							{cart.lines.map(line => (
								<CartLineItem key={cartLineKey(line)} line={line} />
							))}
						</ul>
						<div className="space-y-3 border-t border-line px-5 py-5">
							<CartSummary />
							<Link to="/winkelwagen" onClick={close} className="link block text-center text-sm">
								Winkelwagen
							</Link>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
