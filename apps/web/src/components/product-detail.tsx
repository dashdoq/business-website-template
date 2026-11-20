import { ChevronDown, Minus, Plus } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { EcommerceTrackingEvent, type Product, trackEcommerceEvent } from '@/api/ecommerce-api';
import { cartLineFromVariant, useCart } from '@/hooks/use-ecommerce-cart';
import { useProductOptions } from '@/hooks/use-product-options';
import { useCartDrawer } from '@/components/cart-drawer';
import { SockMark } from '@/components/logo';
import { saleInfo } from '@/components/product-meta';
import { ProductReviews } from '@/components/product-reviews';
import { cn } from '@/lib/utils';

function InfoPanel({ title, children }: { title: string; children: ReactNode }) {
	return (
		<details className="group border-b border-line last:border-0">
			<summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
				{title}
				<ChevronDown size={18} aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-180" />
			</summary>
			<div className="pb-5">{children}</div>
		</details>
	);
}

export function ProductDetail({ product: p }: { product: Product }) {
	const o = useProductOptions(p);
	const cart = useCart();
	const drawer = useCartDrawer();
	const [quantity, setQuantity] = useState(1);
	const [added, setAdded] = useState(false);
	const [image, setImage] = useState(p.image);
	const images = [...p.images].sort((a, b) => a.order - b.order);
	const sale = o.variant ? saleInfo(p, o.variant) : saleInfo(p);
	const max = o.maxQuantity ?? 99;

	useEffect(() => {
		if (o.variant) trackEcommerceEvent({ event: EcommerceTrackingEvent.ViewItem, items: [{ product: p, variant: o.variant, quantity: 1 }] });
	}, [p, o.variant]);

	return (
		<main className="wrap pt-8 lg:pt-12">
			<nav aria-label="Kruimelpad" className="mb-6 text-sm text-stone">
				<Link to="/collectie" className="hover:underline">
					De collectie
				</Link>{' '}
				/ <span className="text-ink">{p.title}</span>
			</nav>

			<div className="grid gap-8 md:grid-cols-2 lg:gap-14">
				<div className="space-y-3">
					<div className="aspect-square overflow-hidden rounded-xl bg-tile">
						{image ? (
							<img src={image} width={800} height={800} alt={p.title} className="size-full object-cover" />
						) : (
							<span className="grid size-full place-items-center">
								<SockMark className="h-1/2 w-auto text-line" />
							</span>
						)}
					</div>
					{images.length > 1 && (
						<div className="grid grid-cols-5 gap-2">
							{images.map(i => (
								<button
									key={i.url}
									type="button"
									onClick={() => setImage(i.url)}
									aria-label="Bekijk productfoto"
									aria-pressed={image === i.url}
									className={cn(
										'aspect-square overflow-hidden rounded-md border-2 bg-tile',
										image === i.url ? 'border-ink' : 'border-transparent hover:border-line',
									)}
								>
									<img src={i.url} width={110} height={110} alt={p.title} className="size-full object-cover" />
								</button>
							))}
						</div>
					)}
				</div>

				<div className="space-y-7">
					<div className="space-y-4">
						<span className="caps text-[0.75rem] text-stone">Gelimiteerde editie · 100% wol</span>
						<h1 className="display-lg">{p.title}</h1>
						<p className="flex items-center gap-3 text-xl tabular-nums">
							{sale && <s className="text-stone">{sale.regularFormatted}</s>}
							<strong className="font-semibold">
								{o.variant?.sale_price_formatted || o.variant?.price_formatted || p.price_formatted}
							</strong>
							{sale && (
								<span className="caps rounded-sm bg-ink px-2 py-[0.3rem] text-[0.6875rem] leading-none text-paper">
									-{sale.percent}%
								</span>
							)}
						</p>
						<div className="rich-text" dangerouslySetInnerHTML={{ __html: p.description }} />
					</div>

					{p.options.map(option => {
						const values = [...new Set(option.values.map(v => v.value))];
						return (
							<fieldset key={option.id}>
								<legend className="mb-3 text-sm">
									{option.title}
									{o.selection[option.id] && (
										<>
											: <span className="font-semibold">{o.selection[option.id]}</span>
										</>
									)}
								</legend>
								<div className="flex flex-wrap gap-2">
									{values.map(v => (
										<button
											key={v}
											type="button"
											aria-pressed={o.selection[option.id] === v}
											disabled={!o.isValueAvailable(option.id, v)}
											onClick={() => {
												o.select(option.id, v);
												setQuantity(1);
												setAdded(false);
											}}
											className={cn(
												'min-h-12 min-w-16 rounded-md border px-4 tabular-nums transition-colors disabled:cursor-not-allowed disabled:text-line',
												o.selection[option.id] === v ? 'border-ink bg-ink text-paper' : 'border-line hover:border-stone',
											)}
										>
											{v}
										</button>
									))}
								</div>
							</fieldset>
						);
					})}
					{!p.options.length && <p className="text-sm text-stone">Maatinformatie: nog niet opgegeven voor deze editie.</p>}

					<p className="text-sm text-stone">
						{!p.purchasable || !o.isInStock
							? 'Momenteel niet beschikbaar'
							: o.maxQuantity !== null
								? `${o.maxQuantity} paar beschikbaar in deze uitvoering`
								: 'Beschikbaar · Geproduceerd in kleine oplages'}
					</p>

					<div className="flex gap-3">
						<div className="inline-flex items-center rounded-md border border-line" role="group" aria-label="Aantal paren">
							<button
								type="button"
								aria-label="Minder"
								disabled={quantity <= 1}
								onClick={() => setQuantity(q => Math.max(1, q - 1))}
								className="grid size-12 place-items-center rounded-l-md hover:bg-tile disabled:text-line"
							>
								<Minus size={16} aria-hidden="true" />
							</button>
							<span className="w-8 text-center tabular-nums" aria-live="polite">
								{quantity}
							</span>
							<button
								type="button"
								aria-label="Meer"
								disabled={quantity >= max}
								onClick={() => setQuantity(q => Math.min(max, q + 1))}
								className="grid size-12 place-items-center rounded-r-md hover:bg-tile disabled:text-line"
							>
								<Plus size={16} aria-hidden="true" />
							</button>
						</div>
						<button
							type="button"
							className="btn-primary flex-1"
							disabled={!p.purchasable || !o.canAddToCart || cart.isLoading}
							onClick={() => {
								if (o.variant) {
									cart.addLine(cartLineFromVariant({ product: p, variant: o.variant, quantity }));
									setAdded(true);
									drawer.open();
								}
							}}
						>
							{added ? 'Toegevoegd aan winkelwagen' : 'In de winkelwagen'}
						</button>
					</div>
					{added && (
						<Link className="link text-sm" to="/winkelwagen">
							Bekijk uw winkelwagen →
						</Link>
					)}

					<div className="panel px-5">
						<InfoPanel title="Materiaal & verzorging">
							<p className="text-sm text-stone">
								100% wol. Lucht na het dragen. Volg voor wassen en drogen altijd het verzorgingslabel bij uw sokken.
							</p>
						</InfoPanel>
						{p.additional_info.map(info => (
							<InfoPanel key={info.id} title={info.title}>
								<div className="rich-text text-sm" dangerouslySetInnerHTML={{ __html: info.description }} />
							</InfoPanel>
						))}
						<InfoPanel title="Bewust kleine oplages">
							<p className="text-sm text-stone">
								Geen massaproductie, maar eigen ontwerpen in beperkte hoeveelheden. Beschikbaarheid wordt bij checkout opnieuw
								gecontroleerd.
							</p>
						</InfoPanel>
					</div>
				</div>
			</div>
			<ProductReviews product={p} />
		</main>
	);
}
