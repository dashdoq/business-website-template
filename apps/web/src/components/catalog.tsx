import { ArrowLeft, ArrowRight, Search, SlidersHorizontal, X } from 'lucide-react';
import { type FormEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { type ProductListItem, toPriceUnits } from '@/api/ecommerce-api';
import { useModalPanel } from '@/hooks/use-modal-panel';
import { ProductGrid } from '@/components/product-grid';
import { cn } from '@/lib/utils';

const SORTS = [
	{ value: 'order', label: 'Onze selectie' },
	{ value: 'low', label: 'Prijs: laag naar hoog' },
	{ value: 'high', label: 'Prijs: hoog naar laag' },
	{ value: 'name', label: 'Naam' },
] as const;

const PER_PAGE = [12, 24, 36] as const;

type Filters = {
	q: string;
	sort: string;
	size: string;
	stock: boolean;
	min?: number;
	max?: number;
	perPage: number;
	page: number;
};

const toNumber = (value: string | null) => {
	if (!value) return undefined;
	const n = Number(value.replace(',', '.'));
	return Number.isFinite(n) && n >= 0 ? n : undefined;
};

function readFilters(params: URLSearchParams): Filters {
	const sort = params.get('sort') ?? 'order';
	const perPage = Number(params.get('toon'));
	return {
		q: params.get('q') ?? '',
		sort: SORTS.some(s => s.value === sort) ? sort : 'order',
		size: params.get('maat') ?? 'all',
		stock: params.get('beschikbaar') === '1',
		min: toNumber(params.get('min')),
		max: toNumber(params.get('max')),
		perPage: PER_PAGE.find(n => n === perPage) ?? PER_PAGE[0],
		page: Math.max(1, Math.floor(toNumber(params.get('pagina')) ?? 1)),
	};
}

const priceOf = (p: ProductListItem) => Number(toPriceUnits(p.price_in_cents, p.currency_info));

export function Catalog({ products }: { products: ProductListItem[] }) {
	const [params, setParams] = useSearchParams();
	const filters = readFilters(params);

	const update = useCallback(
		(changes: Record<string, string | null>) => {
			setParams(
				current => {
					const next = new URLSearchParams(current);
					for (const [key, value] of Object.entries(changes)) {
						if (value === null || value === '') next.delete(key);
						else next.set(key, value);
					}
					if (!('pagina' in changes)) next.delete('pagina');
					return next;
				},
				{ replace: true, preventScrollReset: true },
			);
		},
		[setParams],
	);

	const sizes = useMemo(
		() => [
			...new Set(
				products.flatMap(p => p.options.filter(o => /maat|size/i.test(o.title)).flatMap(o => o.values.map(v => v.value))),
			),
		],
		[products],
	);

	const shown = products
		.filter(
			p =>
				p.title.toLowerCase().includes(filters.q.toLowerCase()) &&
				(!filters.stock || p.purchasable) &&
				(filters.size === 'all' || p.variants.some(v => v.options.some(o => o.value === filters.size))) &&
				(filters.min === undefined || priceOf(p) >= filters.min) &&
				(filters.max === undefined || priceOf(p) <= filters.max),
		)
		.sort((a, b) =>
			filters.sort === 'low'
				? a.price_in_cents - b.price_in_cents
				: filters.sort === 'high'
					? b.price_in_cents - a.price_in_cents
					: filters.sort === 'name'
						? a.title.localeCompare(b.title, 'nl')
						: a.order - b.order,
		);

	const pageCount = Math.max(1, Math.ceil(shown.length / filters.perPage));
	const page = Math.min(filters.page, pageCount);
	const pageItems = shown.slice((page - 1) * filters.perPage, page * filters.perPage);

	const chips: { label: string; clear: Record<string, null> }[] = [];
	if (filters.q) chips.push({ label: `“${filters.q}”`, clear: { q: null } });
	if (filters.size !== 'all') chips.push({ label: filters.size, clear: { maat: null } });
	if (filters.stock) chips.push({ label: 'Alleen beschikbaar', clear: { beschikbaar: null } });
	if (filters.min !== undefined || filters.max !== undefined)
		chips.push({ label: `€${filters.min ?? 0} – €${filters.max ?? '…'}`, clear: { min: null, max: null } });

	const sidebar = <FilterPanels filters={filters} sizes={sizes} update={update} />;

	return (
		<main className="wrap min-h-[65vh] pt-8 pb-10 lg:pt-12">
			<header className="mb-8 max-w-2xl space-y-3 lg:mb-10">
				<span className="caps text-[0.75rem] text-stone">Eigen ontwerpen · Gelimiteerde edities</span>
				<h1 className="display-xl">De collectie.</h1>
				<p className="text-stone">Geen massa. Wel karakter. Ontdek onze sokken van 100% wol.</p>
			</header>

			<div className="grid gap-6 lg:grid-cols-[17rem_1fr] lg:gap-8">
				<aside aria-label="Filters">
					<MobileFilters activeCount={chips.length}>{sidebar}</MobileFilters>
					<div className="hidden lg:block">{sidebar}</div>
				</aside>

				<div className="min-w-0 space-y-4">
					<div className="flex flex-col gap-3 rounded-lg border border-line bg-tile px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
						<p className="caps text-[0.75rem]" aria-live="polite">
							{shown.length} edities
						</p>
						<div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
							<label className="flex items-center gap-2">
								Toon
								<select
									value={filters.perPage}
									onChange={e => update({ toon: e.target.value === String(PER_PAGE[0]) ? null : e.target.value })}
									className="field min-h-10 w-auto py-1 pr-8"
								>
									{PER_PAGE.map(n => (
										<option key={n} value={n}>
											{n}
										</option>
									))}
								</select>
							</label>
							<label className="flex items-center gap-2">
								Sorteren
								<select
									value={filters.sort}
									onChange={e => update({ sort: e.target.value === 'order' ? null : e.target.value })}
									className="field min-h-10 w-auto py-1 pr-8"
								>
									{SORTS.map(s => (
										<option key={s.value} value={s.value}>
											{s.label}
										</option>
									))}
								</select>
							</label>
						</div>
					</div>

					{chips.length > 0 && (
						<ul className="flex flex-wrap gap-2" aria-label="Filters">
							{chips.map(chip => (
								<li key={chip.label}>
									<button
										type="button"
										onClick={() => update(chip.clear)}
										className="inline-flex items-center gap-1.5 rounded-full bg-tile py-1.5 pr-2.5 pl-3 text-sm ring-1 ring-line transition-colors hover:bg-ink hover:text-paper hover:ring-ink"
									>
										{chip.label}
										<X size={15} aria-hidden="true" />
									</button>
								</li>
							))}
						</ul>
					)}

					<ProductGrid products={pageItems} />

					{pageCount > 1 && (
						<nav aria-label="Pagina's" className="flex justify-center pt-6">
							<ul className="flex items-center gap-1.5">
								<li>
									<PageButton disabled={page <= 1} onClick={() => update({ pagina: String(page - 1) })} label="Vorige">
										<ArrowLeft size={16} aria-hidden="true" />
									</PageButton>
								</li>
								{Array.from({ length: pageCount }, (_, i) => i + 1).map(n => (
									<li key={n}>
										<PageButton
											current={n === page}
											onClick={() => update({ pagina: n === 1 ? null : String(n) })}
											label={String(n)}
										>
											{n}
										</PageButton>
									</li>
								))}
								<li>
									<PageButton
										disabled={page >= pageCount}
										onClick={() => update({ pagina: String(page + 1) })}
										label="Volgende"
									>
										<ArrowRight size={16} aria-hidden="true" />
									</PageButton>
								</li>
							</ul>
						</nav>
					)}
				</div>
			</div>
		</main>
	);
}

function PageButton({
	children,
	label,
	onClick,
	disabled,
	current,
}: {
	children: ReactNode;
	label: string;
	onClick: () => void;
	disabled?: boolean;
	current?: boolean;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			aria-label={label}
			aria-current={current ? 'page' : undefined}
			className={cn(
				'grid size-10 place-items-center rounded-md border text-sm tabular-nums transition-colors disabled:text-line',
				current ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink disabled:hover:border-line',
			)}
		>
			{children}
		</button>
	);
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section className="panel p-5">
			<h2 className="mb-3 text-base font-semibold">{title}</h2>
			{children}
		</section>
	);
}

function FilterPanels({
	filters,
	sizes,
	update,
}: {
	filters: Filters;
	sizes: string[];
	update: (changes: Record<string, string | null>) => void;
}) {
	const [query, setQuery] = useState(filters.q);
	useEffect(() => setQuery(filters.q), [filters.q]);

	const onPrice = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		update({ min: String(data.get('min') ?? '') || null, max: String(data.get('max') ?? '') || null });
	};

	return (
		<div className="space-y-3">
			<Panel title="Zoeken">
				<div className="relative">
					<input
						type="search"
						aria-label="Zoeken"
						placeholder="Zoek een editie"
						value={query}
						onChange={e => {
							setQuery(e.target.value);
							update({ q: e.target.value || null });
						}}
						className="field pr-11"
					/>
					<Search size={18} aria-hidden="true" className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-stone" />
				</div>
			</Panel>

			{sizes.length > 0 && (
				<Panel title="Maat">
					<ul className="grid grid-cols-3 gap-1.5">
						<li className="col-span-3">
							<SizeButton active={filters.size === 'all'} onClick={() => update({ maat: null })}>
								Alle maten
							</SizeButton>
						</li>
						{sizes.map(size => (
							<li key={size}>
								<SizeButton active={filters.size === size} onClick={() => update({ maat: filters.size === size ? null : size })}>
									{size}
								</SizeButton>
							</li>
						))}
					</ul>
				</Panel>
			)}

			<Panel title="Prijs">
				<form onSubmit={onPrice} className="space-y-3" key={`${filters.min}-${filters.max}`}>
					<div className="grid grid-cols-2 gap-2">
						<label className="space-y-1 text-sm text-stone">
							Min.
							<input name="min" type="number" inputMode="numeric" min={0} placeholder="0" defaultValue={filters.min} className="field text-ink" />
						</label>
						<label className="space-y-1 text-sm text-stone">
							Max.
							<input name="max" type="number" inputMode="numeric" min={0} placeholder="100" defaultValue={filters.max} className="field text-ink" />
						</label>
					</div>
					<button type="submit" className="btn-primary min-h-11 w-full">
						Toepassen
					</button>
				</form>
			</Panel>

			<Panel title="Beschikbaarheid">
				<label className="flex cursor-pointer items-center gap-3">
					<input
						type="checkbox"
						checked={filters.stock}
						onChange={e => update({ beschikbaar: e.target.checked ? '1' : null })}
						className="size-5 accent-ink"
					/>
					Alleen beschikbaar
				</label>
			</Panel>

			{(filters.q || filters.size !== 'all' || filters.stock || filters.min !== undefined || filters.max !== undefined) && (
				<Link to="/collectie" className="link block px-1 py-2 text-sm" preventScrollReset>
					Alle edities
				</Link>
			)}
		</div>
	);
}

function SizeButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
	return (
		<button
			type="button"
			aria-pressed={active}
			onClick={onClick}
			className={cn(
				'grid min-h-10 w-full place-items-center rounded-md border px-2 text-sm tabular-nums transition-colors',
				active ? 'border-ink bg-ink text-paper' : 'border-line hover:border-stone',
			)}
		>
			{children}
		</button>
	);
}

function MobileFilters({ activeCount, children }: { activeCount: number; children: ReactNode }) {
	const [isOpen, setIsOpen] = useState(false);
	const panelRef = useRef<HTMLDivElement>(null);
	const close = useCallback(() => setIsOpen(false), []);

	useModalPanel(isOpen, close, panelRef);

	return (
		<div className="lg:hidden">
			<button type="button" onClick={() => setIsOpen(true)} aria-expanded={isOpen} className="btn-outline min-h-11 w-full">
				<SlidersHorizontal size={18} aria-hidden="true" />
				Filters{activeCount > 0 && <span className="tabular-nums"> ({activeCount})</span>}
			</button>
			{isOpen && (
				<div className="fixed inset-0 z-50">
					<div className="absolute inset-0 animate-fade-in bg-ink/40" onClick={close} aria-hidden="true" />
					<div
						ref={panelRef}
						role="dialog"
						aria-modal="true"
						aria-label="Filters"
						tabIndex={-1}
						className="absolute inset-y-0 right-0 flex w-[min(24rem,100vw)] animate-drawer-in flex-col bg-paper"
					>
						<div className="flex items-center justify-between border-b border-line px-4 py-3">
							<p className="text-lg font-semibold">Filters</p>
							<button
								type="button"
								onClick={close}
								aria-label="Sluiten"
								className="-mr-2 grid size-11 place-items-center rounded-full hover:bg-tile"
							>
								<X size={22} aria-hidden="true" />
							</button>
						</div>
						<div className="flex-1 overflow-y-auto p-4">{children}</div>
						<div className="border-t border-line p-4">
							<button type="button" onClick={close} className="btn-primary w-full">
								Toepassen
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
