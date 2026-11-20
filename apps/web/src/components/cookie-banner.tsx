import { useCookieBanner } from '@/hooks/use-cookie-banner';

export function CookieBanner() {
	const b = useCookieBanner();

	if (!b.isOpen) return null;

	return (
		<section
			className="fixed right-3 bottom-3 left-3 z-40 max-w-md animate-fade-in space-y-3 rounded-xl border border-line bg-paper p-5 shadow-[0_12px_40px_rgb(0_0_0/0.10)] sm:right-auto sm:bottom-5 sm:left-5"
			role="dialog"
			aria-label="Cookiekeuze"
		>
			<span className="caps text-[0.75rem] text-stone">Uw voorkeuren</span>
			<p className="text-sm">
				We gebruiken noodzakelijke cookies voor uw winkelervaring. Met uw toestemming meten we bezoek en advertenties.
			</p>
			{b.isCustomizing && (
				<div className="space-y-2 text-sm">
					<label className="flex gap-3">
						<input type="checkbox" className="mt-1 size-4 accent-ink" checked={b.choices.analytics} onChange={e => b.setChoice('analytics', e.target.checked)} />
						<span>Statistieken — inzicht in websitebezoek.</span>
					</label>
					<label className="flex gap-3">
						<input type="checkbox" className="mt-1 size-4 accent-ink" checked={b.choices.marketing} onChange={e => b.setChoice('marketing', e.target.checked)} />
						<span>Marketing — meten van advertenties.</span>
					</label>
					<label className="flex gap-3">
						<input
							type="checkbox"
							className="mt-1 size-4 accent-ink"
							checked={b.choices.platformAnalytics}
							onChange={e => b.setChoice('platformAnalytics', e.target.checked)}
						/>
						<span>Platformstatistieken — Hostinger verbetert de winkel en checkout zonder u direct te identificeren.</span>
					</label>
				</div>
			)}
			<div className="flex flex-wrap gap-2">
				<button type="button" className="btn-outline min-h-10 flex-1 px-3 text-[0.6875rem]" onClick={b.rejectOptional}>
					Alleen noodzakelijk
				</button>
				<button type="button" className="btn-outline min-h-10 flex-1 px-3 text-[0.6875rem]" onClick={b.isCustomizing ? b.saveChoices : b.customize}>
					{b.isCustomizing ? 'Keuze opslaan' : 'Aanpassen'}
				</button>
				<button type="button" className="btn-primary min-h-10 flex-1 px-3 text-[0.6875rem]" onClick={b.acceptAll}>
					Alles toestaan
				</button>
			</div>
		</section>
	);
}
