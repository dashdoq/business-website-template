import { Minus, Plus, X } from 'lucide-react';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { Link } from 'react-router';
import { EcommerceTrackingEvent, formatCurrency, trackEcommerceEvent } from '@/api/ecommerce-api';
import { useAuth } from '@/hooks/use-auth';
import { type CartLine, cartLineKey, useCart } from '@/hooks/use-ecommerce-cart';
import { useEcommerceCheckout } from '@/hooks/use-ecommerce-checkout';
import { SockMark, useModalPanel } from '@/components/site-footer';

/*
 * The cart page (/winkelwagen) and the cart drawer share the pieces in this file.
 * The drawer's open state is a tiny module store rather than a React context, so
 * it needs no provider in root.tsx: call openCartDrawer() from anywhere, and
 * <CartDrawer /> (rendered by the site header) shows itself.
 */

let drawerOpen = false;
const drawerListeners = new Set<() => void>();

const setDrawerOpen = (value: boolean) => {
	drawerOpen = value;
	drawerListeners.forEach(listener => listener());
};

export const openCartDrawer = () => setDrawerOpen(true);
export const closeCartDrawer = () => setDrawerOpen(false);

function useCartDrawerOpen() {
	return useSyncExternalStore(
		listener => {
			drawerListeners.add(listener);
			return () => drawerListeners.delete(listener);
		},
		() => drawerOpen,
		() => false,
	);
}

/** One cart line: photo, title, variant, quantity stepper, remove and line total. */
function CartLineItem({ line }: { line: CartLine }) {
	const cart = useCart();
	const key = cartLineKey(line);

	return (
		<li className="flex gap-4 py-5">
			<div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-md bg-secondary sm:size-24">
				{line.image ? (
					<img src={line.image} width={96} height={96} alt={line.title} className="size-full object-cover" />
				) : (
					<SockMark className="h-1/2 w-auto text-border" />
				)}
			</div>
			<div className="flex min-w-0 flex-1 flex-col gap-1">
				<div className="flex items-start justify-between gap-3">
					<h3 className="caps text-[0.8125rem] leading-snug">{line.title}</h3>
					<strong className="text-sm font-semibold tabular-nums">
						{formatCurrency(line.priceInCents * line.quantity, line.currencyInfo)}
					</strong>
				</div>
				<p className="text-sm text-muted-foreground">{[line.variantTitle, '100% wol'].filter(Boolean).join(' · ')}</p>
				<div className="mt-2 flex items-center justify-between gap-3">
					<div className="inline-flex items-center rounded-md border border-border">
						<button
							type="button"
							aria-label="Minder"
							onClick={() => cart.setQuantity(key, line.quantity - 1)}
							className="grid size-10 place-items-center rounded-l-md hover:bg-secondary"
						>
							<Minus size={16} aria-hidden="true" />
						</button>
						<span className="w-8 text-center tabular-nums" aria-live="polite">
							{line.quantity}
						</span>
						<button
							type="button"
							aria-label="Meer"
							onClick={() => cart.setQuantity(key, line.quantity + 1)}
							className="grid size-10 place-items-center rounded-r-md hover:bg-secondary"
						>
							<Plus size={16} aria-hidden="true" />
						</button>
					</div>
					<button
						type="button"
						onClick={() => cart.removeLine(key)}
						className="link text-sm text-muted-foreground hover:text-foreground"
					>
						Verwijder
					</button>
				</div>
			</div>
		</li>
	);
}

/** Subtotal, stock shortages and the checkout button. */
function CartSummary() {
	const cart = useCart();
	const checkout = useEcommerceCheckout();
	const auth = useAuth();

	return (
		<div className="space-y-4">
			<p className="flex items-baseline justify-between gap-4">
				<span>Subtotaal</span>
				<strong className="text-lg font-semibold tabular-nums">
					{formatCurrency(cart.totalInCents, cart.currencyInfo)}
				</strong>
			</p>
			<p className="text-sm text-muted-foreground">
				Verzendkosten en belastingen worden bij checkout getoond. Uw bestelling wordt veilig afgehandeld.
			</p>
			{checkout.shortages.map(s => (
				<p key={s.line.variantId} className="rounded-md bg-accent px-3 py-2 text-sm">
					{s.line.title}: nog {s.available} beschikbaar.
				</p>
			))}
			{checkout.shortages.length > 0 && (
				<button type="button" className="btn-outline w-full" onClick={checkout.applyAvailableStock}>
					Voorraad aanpassen
				</button>
			)}
			{Boolean(checkout.error) && (
				<p role="alert" className="text-sm font-semibold">
					Checkout kon niet worden gestart. Probeer opnieuw.
				</p>
			)}
			<button
				type="button"
				className="btn-primary w-full"
				disabled={checkout.isBusy}
				onClick={() =>
					checkout.start({
						locale: 'nl',
						customer: auth.user ? { external_id: auth.user.id, email: auth.user.email } : undefined,
					})
				}
			>
				{checkout.isBusy ? 'Uw selectie wordt gecontroleerd…' : 'Veilig naar checkout →'}
			</button>
		</div>
	);
}

function EmptyCart({ onNavigate }: { onNavigate?: () => void }) {
	return (
		<div className="flex flex-col items-start gap-5">
			<p className="text-lg">Uw winkelwagen is nog leeg. Een bijzondere editie wacht op u.</p>
			<Link className="btn-primary" to="/collectie" onClick={onNavigate}>
				Ontdek de collectie
			</Link>
		</div>
	);
}

/** Slides in from the right after something is added, with the same content as /winkelwagen. */
export function CartDrawer() {
	const isOpen = useCartDrawerOpen();
	const cart = useCart();
	const panelRef = useRef<HTMLDivElement>(null);

	useModalPanel(isOpen, closeCartDrawer, panelRef);

	if (!isOpen) {
		return null;
	}

	const count = cart.lines.reduce((sum, line) => sum + line.quantity, 0);

	return (
		<div className="fixed inset-0 z-50">
			<div className="animate-fade-in absolute inset-0 bg-primary/40" onClick={closeCartDrawer} aria-hidden="true" />
			<div
				ref={panelRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby="cart-drawer-title"
				tabIndex={-1}
				className="animate-drawer-in absolute inset-y-0 right-0 flex w-[min(28rem,100vw)] flex-col bg-background"
			>
				<div className="flex items-center justify-between border-b border-border px-5 py-4">
					<h2 id="cart-drawer-title" className="text-lg font-semibold">
						Uw selectie <span className="font-normal text-muted-foreground tabular-nums">({count})</span>
					</h2>
					<button
						type="button"
						onClick={closeCartDrawer}
						aria-label="Sluiten"
						className="-mr-2 grid size-11 place-items-center rounded-full hover:bg-secondary"
					>
						<X size={22} aria-hidden="true" />
					</button>
				</div>

				{cart.isLoading ? (
					<p className="p-5">Uw selectie wordt geladen…</p>
				) : !cart.lines.length ? (
					<div className="flex flex-1 items-center px-6">
						<EmptyCart onNavigate={closeCartDrawer} />
					</div>
				) : (
					<>
						<ul className="flex-1 divide-y divide-border overflow-y-auto px-5">
							{cart.lines.map(line => (
								<CartLineItem key={cartLineKey(line)} line={line} />
							))}
						</ul>
						<div className="space-y-3 border-t border-border px-5 py-5">
							<CartSummary />
							<Link to="/winkelwagen" onClick={closeCartDrawer} className="link block text-center text-sm">
								Winkelwagen
							</Link>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

export function CartView() {
	const c = useCart();

	useEffect(() => {
		if (!c.isLoading)
			trackEcommerceEvent({
				event: EcommerceTrackingEvent.ViewCart,
				items: c.lines.map(l => ({
					product: { id: l.productId, title: l.title },
					variant: { id: l.variantId, price_in_cents: l.priceInCents, currency_info: l.currencyInfo },
					quantity: l.quantity,
				})),
			});
	}, [c.isLoading, c.lines]);

	return (
		<main className="wrap min-h-[65vh] pt-8 pb-20 lg:pt-12">
			<span className="caps text-[0.75rem] text-muted-foreground">Uw selectie</span>
			<h1 className="display-xl mt-3 mb-8 lg:mb-12">De winkelwagen.</h1>
			{c.isLoading ? (
				<p>Uw selectie wordt geladen…</p>
			) : !c.lines.length ? (
				<EmptyCart />
			) : (
				<div className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:gap-12">
					<ul className="panel divide-y divide-border px-5">
						{c.lines.map(l => (
							<CartLineItem key={cartLineKey(l)} line={l} />
						))}
					</ul>
					<aside className="panel h-fit p-6 lg:sticky lg:top-28">
						<CartSummary />
					</aside>
				</div>
			)}
		</main>
	);
}
