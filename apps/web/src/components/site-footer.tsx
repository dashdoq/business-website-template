import { Link } from 'react-router';
import { openCookiePreferences } from '@/lib/cookie-consent';
import { Logo } from '@/components/logo';

const GROUPS = [
	{
		title: 'Ontdek Woolup',
		links: [
			{ to: '/collectie', label: 'De collectie' },
			{ to: '/verhaal', label: 'Ons verhaal' },
			{ to: '/wol', label: '100% wol' },
			{ to: '/productie', label: 'Kleine oplages' },
		],
	},
	{
		title: 'Tot uw dienst',
		links: [
			{ to: '/account', label: 'Mijn account' },
			{ to: '/contact', label: 'Contact' },
			{ to: '/winkelwagen', label: 'Winkelwagen' },
		],
	},
];

export function SiteFooter() {
	return (
		<footer className="on-dark mt-24 bg-ink text-paper">
			<div className="wrap grid gap-12 py-16 md:grid-cols-[2fr_1fr_1fr]">
				<div className="max-w-xs space-y-5">
					<Link to="/" aria-label="Woolup – naar de homepage" className="inline-block">
						<Logo className="h-8 w-auto" title="Woolup" />
					</Link>
					<p className="text-sm text-paper/75">
						Voor wie zijn eigen weg kiest.
						<br />
						Eigen ontwerpen. Puur wol. Bewust langzaam.
					</p>
				</div>
				{GROUPS.map(group => (
					<nav key={group.title} aria-label={group.title}>
						<h2 className="caps mb-4 text-[0.75rem] text-paper/60">{group.title}</h2>
						<ul className="space-y-2.5 text-sm text-paper/80">
							{group.links.map(link => (
								<li key={link.to}>
									<Link to={link.to} className="hover:text-paper hover:underline">
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</nav>
				))}
			</div>
			<div className="border-t border-paper/15">
				<div className="wrap flex flex-col gap-3 py-6 text-xs text-paper/60 sm:flex-row sm:items-center sm:justify-between">
					<span>© 2026 Woolup. Met aandacht gemaakt.</span>
					<span>100% wol. Niets meer, niets minder.</span>
					<button type="button" onClick={openCookiePreferences} className="w-fit hover:text-paper hover:underline">
						Cookie-instellingen
					</button>
				</div>
			</div>
		</footer>
	);
}
