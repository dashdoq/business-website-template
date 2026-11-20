import { Minus, Plus } from 'lucide-react';
import { Link } from 'react-router';
import { formatCurrency } from '@/api/ecommerce-api';
import { useAuth } from '@/hooks/use-auth';
import { type CartLine, cartLineKey, useCart } from '@/hooks/use-ecommerce-cart';
import { useEcommerceCheckout } from '@/hooks/use-ecommerce-checkout';
import { SockMark } from '@/components/logo';

/** One cart line: photo, title, variant, quantity stepper, remove and line total. */
export function CartLineItem({ line }: { line: CartLine }) {
	const cart = useCart();
	const key = cartLineKey(line);

	return (
		<li className="flex gap-4 py-5">
			<div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-md bg-tile sm:size-24">
				{line.image ? (
					<img src={line.image} width={96} height={96} alt={line.title} className="size-full object-cover" />
				) : (
					<SockMark className="h-1/2 w-auto text-line" />
				)}
			</div>
			<div className="flex min-w-0 flex-1 flex-col gap-1">
				<div className="flex items-start justify-between gap-3">
					<h3 className="caps text-[0.8125rem] leading-snug">{line.title}</h3>
					<strong className="text-sm font-semibold tabular-nums">
						{formatCurrency(line.priceInCents * line.quantity, line.currencyInfo)}
					</strong>
				</div>
				<p className="text-sm text-stone">{[line.variantTitle, '100% wol'].filter(Boolean).join(' · ')}</p>
				<div className="mt-2 flex items-center justify-between gap-3">
					<div className="inline-flex items-center rounded-md border border-line">
						<button
							type="button"
							aria-label="Minder"
							onClick={() => cart.setQuantity(key, line.quantity - 1)}
							className="grid size-10 place-items-center rounded-l-md hover:bg-tile"
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
							className="grid size-10 place-items-center rounded-r-md hover:bg-tile"
						>
							<Plus size={16} aria-hidden="true" />
						</button>
					</div>
					<button type="button" onClick={() => cart.removeLine(key)} className="link text-sm text-stone hover:text-ink">
						Verwijder
					</button>
				</div>
			</div>
		</li>
	);
}

/** Subtotal, stock shortages and the checkout button. */
export function CartSummary() {
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
			<p className="text-sm text-stone">
				Verzendkosten en belastingen worden bij checkout getoond. Uw bestelling wordt veilig afgehandeld.
			</p>
			{checkout.shortages.map(s => (
				<p key={s.line.variantId} className="rounded-md bg-ecru px-3 py-2 text-sm">
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

export function EmptyCart({ onNavigate }: { onNavigate?: () => void }) {
	return (
		<div className="flex flex-col items-start gap-5">
			<p className="text-lg">Uw winkelwagen is nog leeg. Een bijzondere editie wacht op u.</p>
			<Link className="btn-primary" to="/collectie" onClick={onNavigate}>
				Ontdek de collectie
			</Link>
		</div>
	);
}
