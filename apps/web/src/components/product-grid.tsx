import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Children, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { formatCurrency, type ProductListItem, type ProductVariant } from '@/api/ecommerce-api';
import { cartLineFromVariant, useCart } from '@/hooks/use-ecommerce-cart';
import { openCartDrawer } from '@/components/cart-view';
import { SockMark } from '@/components/site-footer';
import { cn } from '@/lib/utils';

/*
 * Everything a product listing needs, in one file because the Hostinger AI
 * Builder code editor cannot add new files: the grid, the product card with its
 * quick "In de winkelwagen" button, the sideways carousel, and price helpers.
 */

// --- Price and option helpers ---

/** The variant whose price the card shows: the cheapest one, like `price_in_cents`. */
function displayVariant(product: Pick<ProductListItem, 'variants'>): ProductVariant | undefined {
	return [...product.variants].sort(
		(a, b) => (a.sale_price_in_cents ?? a.price_in_cents) - (b.sale_price_in_cents ?? b.price_in_cents),
	)[0];
}

/** Regular price and discount when the shown variant is on sale; undefined otherwise. */
export function saleInfo(product: Pick<ProductListItem, 'variants'>, variant = displayVariant(product)) {
	if (!variant || variant.sale_price_in_cents === null || variant.sale_price_in_cents >= variant.price_in_cents) {
		return undefined;
	}

	return {
		regularFormatted: variant.price_formatted || formatCurrency(variant.price_in_cents, variant.currency_info),
		percent: Math.round((1 - variant.sale_price_in_cents / variant.price_in_cents) * 100),
	};
}

/** The option a card can pick from directly (e.g. "Maat"), when it is the only one. */
export function singleOption(product: Pick<ProductListItem, 'options'>) {
	return product.options.length === 1 ? product.options[0] : undefined;
}

export const uniqueValues = (option: { values: { value: string }[] }) => [
	...new Set(option.values.map(v => v.value)),
];

/** The variant that carries exactly this value of a single-option product. */
export function variantFor(product: Pick<ProductListItem, 'variants'>, optionId: string, value: string) {
	return product.variants.find(v => v.options.some(o => o.option_id === optionId && o.value === value));
}

export const isVariantAvailable = (variant: ProductVariant) =>
	!variant.manage_inventory || (variant.inventory_quantity ?? 0) > 0;

// --- Grid ---

export function ProductGrid({ products }: { products: ProductListItem[] }) {
	return products.length ? (
		<ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4 xl:grid-cols-4">
			{products.map((p, index) => (
				<li key={p.id}>
					<ProductCard product={p} priority={index < 4} />
				</li>
			))}
		</ul>
	) : (
		<p className="panel px-6 py-12 text-center text-muted-foreground">Er zijn geen edities die bij uw selectie passen.</p>
	);
}

// --- Card ---

const BADGE = 'caps inline-block rounded-sm px-2 py-[0.3rem] text-[0.6875rem] leading-none';

export function ProductCard({ product: p, priority }: { product: ProductListItem; priority?: boolean }) {
	const href = `/product/${p.url_handle}`;
	const sale = saleInfo(p);
	const isDonation = p.variants.length > 0 && p.variants.every(v => v.donation);

	return (
		<article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background transition-[border-color] duration-150 hover:border-muted-foreground/40">
			<Link to={href} tabIndex={-1} aria-hidden="true" className="relative block aspect-square overflow-hidden bg-secondary">
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
						<SockMark className="h-[46%] w-auto text-border" />
					</span>
				)}
				{sale && <span className={cn(BADGE, 'absolute top-3 left-3 bg-primary text-primary-foreground')}>-{sale.percent}%</span>}
				<span
					className={cn(
						BADGE,
						'absolute top-3 right-3',
						p.ribbon_text ? 'bg-[#45513b] text-primary-foreground' : 'bg-background/90 text-foreground ring-1 ring-border',
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
							{sale && <s className="mr-2 text-muted-foreground">{sale.regularFormatted}</s>}
							<span className="font-semibold">{p.price_formatted}</span>
						</>
					)}
				</p>
				<p className="text-xs text-muted-foreground">100% wol · Eigen ontwerp</p>
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
		openCartDrawer();
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
			<p className="mb-1.5 text-xs text-muted-foreground">{option.title}</p>
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
							className="min-h-10 rounded-md border border-border px-1 text-sm tabular-nums transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:text-border disabled:hover:border-border disabled:hover:bg-background"
						>
							{value}
						</button>
					);
				})}
			</div>
		</div>
	);
}

// --- Carousel ---

/**
 * A row of product cards that scrolls sideways. Touch and trackpad scroll
 * natively with snap points; the round arrow buttons page through on desktop.
 */
export function ProductCarousel({ label, children }: { label: string; children: ReactNode }) {
	const trackRef = useRef<HTMLUListElement>(null);
	const [canPrev, setCanPrev] = useState(false);
	const [canNext, setCanNext] = useState(false);

	const update = useCallback(() => {
		const track = trackRef.current;

		if (!track) {
			return;
		}

		setCanPrev(track.scrollLeft > 4);
		setCanNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 4);
	}, []);

	useEffect(() => {
		const track = trackRef.current;

		if (!track) {
			return;
		}

		update();
		track.addEventListener('scroll', update, { passive: true });
		const observer = new ResizeObserver(update);
		observer.observe(track);

		return () => {
			track.removeEventListener('scroll', update);
			observer.disconnect();
		};
	}, [update]);

	const page = (direction: 1 | -1) => {
		const track = trackRef.current;

		if (!track) {
			return;
		}

		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		track.scrollBy({ left: direction * track.clientWidth * 0.9, behavior: reduceMotion ? 'auto' : 'smooth' });
	};

	return (
		<div className="relative" role="region" aria-roledescription="carrousel" aria-label={label}>
			<ul
				ref={trackRef}
				className="no-scrollbar relative -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:scroll-px-0 sm:px-0 lg:gap-4"
			>
				{Children.map(children, child => (
					<li className="w-[68%] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/3)] lg:w-[calc((100%-3rem)/4)]">
						{child}
					</li>
				))}
			</ul>
			{(['prev', 'next'] as const).map(direction => {
				const disabled = direction === 'prev' ? !canPrev : !canNext;
				const Icon = direction === 'prev' ? ArrowLeft : ArrowRight;
				return (
					<button
						key={direction}
						type="button"
						onClick={() => page(direction === 'prev' ? -1 : 1)}
						disabled={disabled}
						aria-label={direction === 'prev' ? 'Vorige' : 'Volgende'}
						className={cn(
							'absolute top-[34%] z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-border bg-background shadow-[0_4px_16px_rgb(0_0_0/0.08)] transition-[opacity,border-color] duration-150 hover:border-muted-foreground sm:grid',
							direction === 'prev' ? '-left-4' : '-right-4',
							disabled && 'pointer-events-none opacity-0',
						)}
					>
						<Icon size={18} aria-hidden="true" />
					</button>
				);
			})}
		</div>
	);
}
