import { useRef, useState } from 'react';
import { Link } from 'react-router';
import type { ProductListItem } from '@/api/ecommerce-api';
import { cartLineFromVariant, useCart } from '@/hooks/use-ecommerce-cart';
import { useCartDrawer } from '@/components/cart-drawer';
import { SockMark } from '@/components/logo';
import { isVariantAvailable, saleInfo, singleOption, uniqueValues, variantFor } from '@/components/product-meta';
import { cn } from '@/lib/utils';

const BADGE = 'caps inline-block rounded-sm px-2 py-[0.3rem] text-[0.6875rem] leading-none';

export function ProductCard({ product: p, priority }: { product: ProductListItem; priority?: boolean }) {
	const href = `/product/${p.url_handle}`;
	const sale = saleInfo(p);
	const isDonation = p.variants.length > 0 && p.variants.every(v => v.donation);

	return (
		<article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-line bg-paper transition-[border-color] duration-150 hover:border-stone/40">
			<Link to={href} tabIndex={-1} aria-hidden="true" className="relative block aspect-square overflow-hidden bg-tile">
				{p.image ? (
					<img
						src={p.image}
						width={600}
						height={600}
						loading={priority ? 'eager' : 'lazy'}
						alt={p.title}
						className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
					/>
				) : (
					<span className="grid size-full place-items-center">
						<SockMark className="h-[46%] w-auto text-line" />
					</span>
				)}
				{sale && <span className={cn(BADGE, 'absolute top-3 left-3 bg-ink text-paper')}>-{sale.percent}%</span>}
				<span
					className={cn(
						BADGE,
						'absolute top-3 right-3',
						p.ribbon_text ? 'bg-loden text-paper' : 'bg-paper/90 text-ink ring-1 ring-line',
					)}
				>
					{p.ribbon_text || 'Gelimiteerde editie'}
				</span>
			</Link>

			<div className="flex flex-1 flex-col items-center gap-1.5 px-3 pt-4 pb-3 text-center">
				<h3 className="caps text-[0.8125rem] leading-snug">
					<Link to={href} className="hover:underline">
						{p.title}
					</Link>
				</h3>
				<p className="text-sm tabular-nums">
					{isDonation ? (
						'Kies uw bedrag'
					) : (
						<>
							{sale && <s className="mr-2 text-stone">{sale.regularFormatted}</s>}
							<span className="font-semibold">{p.price_formatted}</span>
						</>
					)}
				</p>
				<p className="text-xs text-stone">100% wol · Eigen ontwerp</p>
				<div className="mt-auto w-full pt-2.5">
					<QuickAdd product={p} href={href} isDonation={isDonation} />
				</div>
			</div>
		</article>
	);
}

const QUICK_BUTTON = 'btn-outline min-h-10 w-full whitespace-nowrap px-2 text-[0.75rem] sm:text-[0.8125rem]';

/**
 * "In de winkelwagen" on a card. One variant: add it straight away. One option
 * (such as a size): show its values first. Anything else opens the product page.
 */
function QuickAdd({ product: p, href, isDonation }: { product: ProductListItem; href: string; isDonation: boolean }) {
	const cart = useCart();
	const drawer = useCartDrawer();
	const [choosing, setChoosing] = useState(false);
	const firstValueRef = useRef<HTMLButtonElement>(null);
	const option = singleOption(p);

	if (!p.purchasable) {
		return (
			<button type="button" className={QUICK_BUTTON} disabled>
				Momenteel niet beschikbaar
			</button>
		);
	}

	const add = (variant: ProductListItem['variants'][number]) => {
		cart.addLine(cartLineFromVariant({ product: p, variant, quantity: 1 }));
		setChoosing(false);
		drawer.open();
	};

	const onlyVariant = p.variants.length === 1 ? p.variants[0] : undefined;

	if (isDonation || (!onlyVariant && !option)) {
		return (
			<Link to={href} className={QUICK_BUTTON}>
				In de winkelwagen
			</Link>
		);
	}

	if (onlyVariant) {
		return (
			<button
				type="button"
				className={QUICK_BUTTON}
				disabled={cart.isLoading || !isVariantAvailable(onlyVariant)}
				onClick={() => add(onlyVariant)}
			>
				In de winkelwagen
				<span className="sr-only">: {p.title}</span>
			</button>
		);
	}

	if (!option) {
		return null;
	}

	if (!choosing) {
		return (
			<button
				type="button"
				className={QUICK_BUTTON}
				aria-expanded={false}
				onClick={() => {
					setChoosing(true);
					requestAnimationFrame(() => firstValueRef.current?.focus());
				}}
			>
				In de winkelwagen
				<span className="sr-only">: {p.title}</span>
			</button>
		);
	}

	const values = uniqueValues(option);

	return (
		<div
			role="group"
			aria-label={`${option.title}: ${p.title}`}
			className="animate-fade-in"
			onKeyDown={event => {
				if (event.key === 'Escape') setChoosing(false);
			}}
		>
			<p className="mb-1.5 text-xs text-stone">{option.title}</p>
			<div className={cn('grid gap-1', values.length >= 3 ? 'grid-cols-3' : 'grid-cols-2')}>
				{values.map((value, index) => {
					const variant = variantFor(p, option.id, value);
					return (
						<button
							key={value}
							ref={index === 0 ? firstValueRef : undefined}
							type="button"
							disabled={!variant || !isVariantAvailable(variant)}
							onClick={() => variant && add(variant)}
							className="min-h-10 rounded-md border border-line px-1 text-sm tabular-nums transition-colors hover:border-ink hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:text-line disabled:hover:border-line disabled:hover:bg-paper"
						>
							{value}
						</button>
					);
				})}
			</div>
		</div>
	);
}
