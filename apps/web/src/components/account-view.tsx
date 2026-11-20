import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { pocketbaseClient as pb } from '@/lib/pocketbase-client';
import { cn } from '@/lib/utils';

export function AccountView() {
	const a = useAuth();
	const [mode, setMode] = useState('login');
	const [message, setMessage] = useState('');
	const [busy, setBusy] = useState(false);

	if (a.isLoading) return <main className="wrap min-h-[65vh] pt-12">Uw account wordt geladen…</main>;

	return (
		<main className="wrap min-h-[65vh] pt-8 pb-20 lg:pt-12">
			<div className="max-w-xl">
				<span className="caps text-[0.75rem] text-muted-foreground">Uw persoonlijke Woolup</span>
				<h1 className="display-xl mt-3 mb-8">Mijn account.</h1>
				{a.user ? (
					<div className="space-y-8">
						<div className="panel space-y-5 p-6">
							<p>Welkom, {a.user.name || a.user.email}.</p>
							<form
								className="space-y-4"
								onSubmit={async e => {
									e.preventDefault();
									setBusy(true);
									try {
										await pb.collection('users').update(a.user!.id, { name: new FormData(e.currentTarget).get('name') });
										setMessage('Uw gegevens zijn opgeslagen.');
									} catch {
										setMessage('Opslaan is niet gelukt.');
									}
									setBusy(false);
								}}
							>
								<label className="block space-y-1.5 text-sm">
									Naam
									<input name="name" defaultValue={a.user.name} className="field" />
								</label>
								<label className="block space-y-1.5 text-sm">
									E-mail
									<input value={a.user.email} disabled className="field bg-secondary text-muted-foreground" />
								</label>
								<button className="btn-primary" disabled={busy}>
									Gegevens opslaan
								</button>
							</form>
						</div>
						<div className="space-y-3">
							<h2 className="display-md">Uw bestellingen</h2>
							<p className="text-muted-foreground">
								Uw bestelgegevens en bestelstatus ontvangt u per e-mail. Een besteloverzicht in dit account is nog niet beschikbaar.
							</p>
						</div>
						<button type="button" className="btn-outline" onClick={a.logout}>
							Uitloggen
						</button>
					</div>
				) : (
					<div className="panel space-y-6 p-6">
						<div className="grid grid-cols-2 gap-1 rounded-md bg-secondary p-1">
							{[
								['login', 'Inloggen'],
								['signup', 'Account aanmaken'],
							].map(([value, label]) => (
								<button
									key={value}
									type="button"
									aria-pressed={mode === value}
									onClick={() => setMode(value)}
									className={cn(
										'min-h-11 rounded-[5px] text-sm font-semibold transition-colors',
										mode === value ? 'bg-background shadow-[0_1px_3px_rgb(0_0_0/0.08)]' : 'text-muted-foreground hover:text-foreground',
									)}
								>
									{label}
								</button>
							))}
						</div>
						<form
							className="space-y-4"
							onSubmit={async e => {
								e.preventDefault();
								const f = new FormData(e.currentTarget);
								setBusy(true);
								setMessage('');
								try {
									if (mode === 'reset') {
										await pb.collection('users').requestPasswordReset(String(f.get('email')));
										setMessage('Als dit e-mailadres bekend is, ontvangt u een herstelmail.');
									} else if (mode === 'signup') {
										await a.signup(String(f.get('email')), String(f.get('password')), { name: f.get('name') });
									} else await a.login(String(f.get('email')), String(f.get('password')));
								} catch {
									setMessage('Controleer uw gegevens en probeer opnieuw.');
								}
								setBusy(false);
							}}
						>
							{mode === 'signup' && (
								<label className="block space-y-1.5 text-sm">
									Naam
									<input name="name" required className="field" />
								</label>
							)}
							<label className="block space-y-1.5 text-sm">
								E-mail
								<input name="email" type="email" required autoComplete="email" className="field" />
							</label>
							{mode !== 'reset' && (
								<label className="block space-y-1.5 text-sm">
									Wachtwoord
									<input
										name="password"
										type="password"
										minLength={8}
										required
										autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
										className="field"
									/>
								</label>
							)}
							<button className="btn-primary w-full" disabled={busy}>
								{busy ? 'Even geduld…' : mode === 'signup' ? 'Account aanmaken' : mode === 'reset' ? 'Herstelmail aanvragen' : 'Inloggen'}
							</button>
						</form>
						<button type="button" className="link text-sm text-muted-foreground hover:text-foreground" onClick={() => setMode('reset')}>
							Wachtwoord vergeten?
						</button>
					</div>
				)}
				{message && (
					<p className="mt-6 rounded-md bg-accent px-4 py-3 text-sm" role="status">
						{message}
					</p>
				)}
			</div>
		</main>
	);
}
