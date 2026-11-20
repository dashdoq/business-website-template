import { Link } from 'react-router';

export const HERO_IMAGE =
	'https://images.hostinger.com/b08aafeb-3d4f-4942-a6aa-da08f6fb8112/a7d17491-5489-4297-8004-be4ddceaa74a.png';

const VALUES = ['100% NATUURLIJKE WOL', 'EIGEN ONTWERPEN', 'BEWUST KLEINE OPLAGES', 'TIJDLOOS KARAKTER'];

export function Hero() {
	return (
		<>
			<section className="wrap pt-4 lg:pt-6" aria-labelledby="hero-title">
				<div className="grid items-center gap-8 overflow-hidden rounded-2xl bg-accent p-6 sm:p-10 md:grid-cols-[1fr_1.05fr] md:gap-12 lg:py-14 lg:pr-14 lg:pl-16">
					<div className="space-y-6">
						<span className="caps inline-block rounded-full bg-primary px-3 py-1.5 text-[0.6875rem] leading-none text-primary-foreground">
							Puur in materiaal. Eigen in karakter.
						</span>
						<h1 id="hero-title" className="display-xl">
							Voor wie zijn
							<br />
							eigen weg kiest.
						</h1>
						<p className="max-w-[40ch] text-lg">
							Exclusieve sokken van 100% wol. Eigen ontwerpen, in kleine oplages gemaakt. Voor buitengewone dagen —
							buiten én daarbuiten.
						</p>
						<Link to="/collectie" className="btn-primary">
							Ontdek de collectie
						</Link>
						<div className="flex flex-col gap-1 pt-2 text-xs text-muted-foreground sm:flex-row sm:gap-6">
							<span className="caps text-[0.6875rem]">WOOLUP — GELIMITEERDE EDITIES</span>
							<span className="caps text-[0.6875rem]">GEMAAKT MET AANDACHT. GEDRAGEN MET KARAKTER.</span>
						</div>
					</div>
					<div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-secondary md:aspect-[5/6]">
						<img
							src={HERO_IMAGE}
							width={1344}
							height={768}
							fetchPriority="high"
							alt="Mosgroene wollen sokken en leren wandelschoenen in de Schotse hooglanden"
							className="absolute inset-0 size-full object-cover object-[58%_62%]"
						/>
					</div>
				</div>
			</section>
			<div className="wrap mt-4">
				<ul className="panel grid grid-cols-2 divide-border text-center md:grid-cols-4 md:divide-x">
					{VALUES.map(value => (
						<li key={value} className="caps px-3 py-4 text-[0.6875rem] text-muted-foreground sm:text-[0.75rem]">
							{value}
						</li>
					))}
				</ul>
			</div>
		</>
	);
}
