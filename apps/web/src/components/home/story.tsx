import { Link } from 'react-router';
import { SockMark } from '@/components/logo';

export function Story({ image }: { image?: string }) {
	return (
		<section className="wrap mt-20 lg:mt-28" aria-labelledby="story-title">
			<div className="grid overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_12px_40px_rgb(0_0_0/0.05)] md:grid-cols-2">
				<div className="relative aspect-square bg-tile md:aspect-auto">
					{image ? (
						<img src={image} width={800} height={800} loading="lazy" alt="" className="absolute inset-0 size-full object-cover" />
					) : (
						<span className="absolute inset-0 grid place-items-center">
							<SockMark className="h-1/2 w-auto text-line" />
						</span>
					)}
				</div>
				<div className="flex flex-col justify-center gap-6 p-6 sm:p-10 lg:p-16">
					<span className="caps text-[0.75rem] text-stone">Minder, maar beter.</span>
					<h2 id="story-title" className="display-lg">
						Goed werk laat
						<br />
						zich niet haasten.
					</h2>
					<p className="max-w-[46ch] text-stone">
						Woolup begint bij een eenvoudige overtuiging: wat u dagelijks draagt, verdient uitzonderlijke aandacht. Daarom
						kiezen we voor 100% wol, onze eigen ontwerpen en bewust kleine oplages.
					</p>
					<p className="max-w-[46ch] text-stone">
						Van een ochtend in het veld tot een dag waarin u de richting bepaalt. Ingetogen in uitstraling. Uitgesproken in
						kwaliteit.
					</p>
					<div>
						<Link className="btn-primary" to="/verhaal">
							Het verhaal achter Woolup
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
