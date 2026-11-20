import { Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Form, Link, NavLink, useLocation } from 'react-router';
import { useCart } from '@/hooks/use-ecommerce-cart';
import { useModalPanel } from '@/hooks/use-modal-panel';
import { useCartDrawer } from '@/components/cart-drawer';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

const NAV = [
	{ to: '/collectie', label: 'De collectie' },
	{ to: '/verhaal', label: 'Ons verhaal' },
	{ to: '/wol', label: '100% wol' },
	{ to: '/productie', label: 'Kleine oplages' },
];

const TOPLINE = ['100% wol', 'Eigen ontwerpen', 'Kleine oplages'];

function SearchField({ id }: { id: string }) {
	return (
		<Form action="/collectie" method="get" role="search" className="relative">
			<label htmlFor={id} className="sr-only">
				Zoeken
			</label>
			<input
				id={id}
				name="q"
				type="search"
				placeholder="Zoek een editie"
				autoComplete="off"
				className="field rounded-full border-transparent bg-tile pr-11 pl-4 hover:border-line"
			/>
			<button
				type="submit"
				aria-label="Zoeken"
				className="absolute top-1/2 right-1 grid size-9 -translate-y-1/2 place-items-center rounded-full hover:bg-line/70"
			>
				<Search size={18} aria-hidden="true" />
			</button>
		</Form>
	);
}

function NavLinks({
	className,
	linkClassName,
	onNavigate,
}: {
	className?: string;
	linkClassName?: string;
	onNavigate?: () => void;
}) {
	return (
		<ul className={className}>
			{NAV.map(item => (
				<li key={item.to}>
					<NavLink
						to={item.to}
						onClick={onNavigate}
						className={({ isActive }) =>
							cn(
								'caps text-[0.8125rem] decoration-[1.5px] underline-offset-[0.6em] hover:underline',
								isActive && 'underline',
								linkClassName,
							)
						}
					>
						{item.label}
					</NavLink>
				</li>
			))}
		</ul>
	);
}

function MobileMenu() {
	const [isOpen, setIsOpen] = useState(false);
	const panelRef = useRef<HTMLDivElement>(null);
	const close = useCallback(() => setIsOpen(false), []);
	const { pathname, search } = useLocation();

	useModalPanel(isOpen, close, panelRef);
	useEffect(close, [pathname, search, close]);

	return (
		<div className="lg:hidden">
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				aria-label="Menu"
				aria-expanded={isOpen}
				className="-ml-2 grid size-11 place-items-center rounded-full hover:bg-tile"
			>
				<Menu size={22} aria-hidden="true" />
			</button>
			{isOpen && (
				<div className="fixed inset-0 z-50">
					<div className="absolute inset-0 animate-fade-in bg-ink/40" onClick={close} aria-hidden="true" />
					<div
						ref={panelRef}
						role="dialog"
						aria-modal="true"
						aria-label="Hoofdnavigatie"
						tabIndex={-1}
						className="absolute inset-y-0 left-0 flex w-[min(22rem,88vw)] animate-drawer-in-left flex-col gap-8 bg-paper p-5"
					>
						<div className="flex items-center justify-between">
							<Logo className="h-7 w-auto" />
							<button
								type="button"
								onClick={close}
								aria-label="Sluiten"
								className="-mr-2 grid size-11 place-items-center rounded-full hover:bg-tile"
							>
								<X size={22} aria-hidden="true" />
							</button>
						</div>
						<SearchField id="zoeken-menu" />
						<nav aria-label="Hoofdnavigatie">
							<NavLinks className="flex flex-col gap-5" linkClassName="text-base" onNavigate={close} />
						</nav>
						<Link to="/account" onClick={close} className="caps mt-auto text-[0.8125rem]">
							Mijn account
						</Link>
					</div>
				</div>
			)}
		</div>
	);
}

export function SiteHeader() {
	const cart = useCart();
	const drawer = useCartDrawer();
	const count = cart.lines.reduce((sum, line) => sum + line.quantity, 0);

	return (
		<>
			<div className="on-dark bg-ink text-paper">
				<ul className="wrap flex h-9 items-center justify-center gap-10 text-xs md:justify-between">
					{TOPLINE.map((item, index) => (
						<li key={item} className={index > 0 ? 'hidden md:block' : undefined}>
							<span className="md:hidden">{TOPLINE.join(' · ')}</span>
							<span className="hidden md:inline">{item}</span>
						</li>
					))}
				</ul>
			</div>
			<header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85">
				<div className="wrap flex h-16 items-center gap-4 lg:h-20 lg:gap-8">
					<MobileMenu />
					<Link to="/" aria-label="Woolup – naar de homepage" className="shrink-0">
						<Logo className="h-7 w-auto lg:h-8" title="Woolup" />
					</Link>
					<div className="hidden flex-1 lg:block lg:max-w-sm">
						<SearchField id="zoeken-header" />
					</div>
					<nav aria-label="Hoofdnavigatie" className="ml-auto hidden lg:block">
						<NavLinks className="flex items-center gap-7" />
					</nav>
					<div className="ml-auto flex items-center gap-1 lg:ml-0">
						<Link
							to="/account"
							aria-label="Mijn account"
							className="hidden size-11 place-items-center rounded-full hover:bg-tile sm:grid"
						>
							<UserRound size={21} aria-hidden="true" />
						</Link>
						<button
							type="button"
							onClick={drawer.open}
							aria-label="Winkelwagen"
							className="relative grid size-11 place-items-center rounded-full hover:bg-tile"
						>
							<ShoppingBag size={21} aria-hidden="true" />
							{!cart.isLoading && count > 0 && (
								<span
									aria-hidden="true"
									className="absolute top-0.5 right-0 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[0.75rem] leading-none font-semibold text-paper tabular-nums"
								>
									{count}
								</span>
							)}
						</button>
					</div>
				</div>
			</header>
		</>
	);
}
