import { Link } from 'react-router';
import { pages } from '@/data/pages';
import { HERO_IMAGE } from '@/components/home/hero';

export function EditorialPage({ slug }: { slug: string }) {
	const p = pages[slug];

	return (
		<main className="wrap pt-8 lg:pt-12">
			<nav aria-label="Kruimelpad" className="mb-6 text-sm text-muted-foreground">
				<Link to="/" className="hover:underline">
					Woolup
				</Link>{' '}
				/ <span className="text-foreground">{p.label}</span>
			</nav>
			<div className="grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-20">
				<article className="max-w-[62ch] space-y-6">
					<span className="caps text-[0.75rem] text-muted-foreground">{p.label}</span>
					<h1 className="display-xl">{p.title}</h1>
					{p.paragraphs.map(t => (
						<p className="text-lg text-muted-foreground" key={t}>
							{t}
						</p>
					))}
					<Link className="btn-primary" to="/collectie">
						Ontdek de collectie →
					</Link>
				</article>
				<div className="relative hidden aspect-[4/5] overflow-hidden rounded-2xl bg-accent lg:block">
					<img
						src={HERO_IMAGE}
						width={1344}
						height={768}
						loading="lazy"
						alt=""
						className="absolute inset-0 size-full object-cover object-[58%_62%]"
					/>
				</div>
			</div>
		</main>
	);
}
