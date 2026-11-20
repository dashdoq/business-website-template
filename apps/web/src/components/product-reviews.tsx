import { useCallback, useRef, useState } from 'react';
import type { Product } from '@/api/ecommerce-api';
import { useModalPanel } from '@/hooks/use-modal-panel';
import { useProductReviews } from '@/hooks/use-product-reviews';

export function ProductReviews({ product }: { product: Product }) {
	const r = useProductReviews({ productId: product.id, reviewsAnalytics: product.reviews_analytics });
	const [message, setMessage] = useState('');
	const dialogRef = useRef<HTMLDivElement>(null);
	const setFormOpen = r.setIsFormOpen;
	const closeForm = useCallback(() => setFormOpen(false), [setFormOpen]);

	useModalPanel(r.isFormOpen, closeForm, dialogRef);

	return (
		<>
			<section className="mt-16 space-y-4 lg:mt-20">
				{r.isEnabled && (
					<>
						<h2 className="display-lg">Ervaringen</h2>
						{r.summary && (
							<p className="text-stone">
								{r.summary.total} beoordelingen · {r.summary.average.toFixed(1)} / 5
							</p>
						)}
						{r.reviews.length > 0 && (
							<ul className="grid gap-3 md:grid-cols-2">
								{r.reviews.map(v => (
									<li className="panel space-y-2 p-5" key={v.id}>
										<p className="text-sm font-semibold">
											{v.reviewer_name || 'Een Woolup-klant'} · {v.rating}/5
										</p>
										<p className="text-stone">{v.comment}</p>
									</li>
								))}
							</ul>
						)}
						<button type="button" className="btn-outline" onClick={() => r.setIsFormOpen(true)}>
							Deel uw ervaring
						</button>
					</>
				)}
				{message && (
					<p role="status" className="rounded-md bg-ecru px-4 py-3 text-sm">
						{message}
					</p>
				)}
			</section>
			{r.isFormOpen && (
				<div className="fixed inset-0 z-50 grid place-items-center p-5">
					<div className="absolute inset-0 animate-fade-in bg-ink/40" onClick={closeForm} aria-hidden="true" />
					<div
						ref={dialogRef}
						role="dialog"
						aria-modal="true"
						aria-label="Beoordeling schrijven"
						tabIndex={-1}
						className="relative max-h-[90vh] w-full max-w-md animate-fade-in overflow-auto rounded-2xl bg-paper p-6 sm:p-8"
					>
						<h2 className="display-lg mb-6">Uw ervaring.</h2>
						<form
							className="space-y-4"
							onSubmit={async e => {
								e.preventDefault();
								const f = new FormData(e.currentTarget);
								try {
									const result = await r.submit({
										email: String(f.get('email')),
										reviewerName: String(f.get('name')),
										rating: Number(f.get('rating')),
										comment: String(f.get('comment')),
									});
									setMessage(
										result === 'published'
											? 'Dank u. Uw beoordeling is gepubliceerd.'
											: result === 'pending'
												? 'Dank u. Uw beoordeling wacht op goedkeuring.'
												: 'U heeft deze editie al beoordeeld.',
									);
								} catch {
									setMessage('Uw beoordeling kon niet worden verstuurd. Probeer opnieuw.');
								}
							}}
						>
							<label className="block space-y-1.5 text-sm">
								Beoordeling
								<select name="rating" defaultValue={r.prefill.rating || 5} className="field">
									{[5, 4, 3, 2, 1].map(v => (
										<option key={v} value={v}>
											{v} / 5
										</option>
									))}
								</select>
							</label>
							<label className="block space-y-1.5 text-sm">
								Naam
								<input name="name" maxLength={255} defaultValue={r.prefill.reviewerName} className="field" />
							</label>
							<label className="block space-y-1.5 text-sm">
								E-mail
								<input name="email" type="email" required defaultValue={r.prefill.email} className="field" />
							</label>
							<label className="block space-y-1.5 text-sm">
								Uw ervaring
								<textarea name="comment" maxLength={1000} rows={5} className="field py-2" />
							</label>
							<div className="flex flex-wrap gap-2 pt-2">
								<button className="btn-primary" disabled={r.isSubmitting}>
									Versturen
								</button>
								<button type="button" className="btn-outline" onClick={closeForm}>
									Sluiten
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	);
}
