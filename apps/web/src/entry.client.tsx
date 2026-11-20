import { type ReactNode, startTransition, StrictMode, useEffect } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { isRouteErrorResponse } from 'react-router';
import { HydratedRouter } from 'react-router/dom';
import { isHydrationError, reportHydrationError } from 'virtual:horizons-runtime';

function onRecoverableError(error: unknown, errorInfo: { componentStack?: string }) {
	try {
		if (isHydrationError(error)) {
			reportHydrationError({ error, componentStack: errorInfo?.componentStack });

			return;
		}
	} catch {
		reportError(error);

		return;
	}

	reportError(error);
}

// The root boundary renders nothing in the preview, so the session journal reports the error to the editor,
// which shows a toast. A 4xx response renders its own message.
function onRouteError(error: unknown) {
	if (import.meta.env.DEV && !(isRouteErrorResponse(error) && error.status < 500)) {
		window.dispatchEvent(new Event('horizons:route-error'));
	}
}

// `onError` hears only errors raised after hydration, so a page the server rendered with an error reports here.
// It wraps the router instead of sitting beside it: a root sibling would shift every `useId` from the server's.
function ReportServerRouteErrors({ children }: { children: ReactNode }) {
	useEffect(() => {
		const { __reactRouterDataRouter: router } = window as Window & { __reactRouterDataRouter?: { state: { errors: Record<string, unknown> | null } } };

		Object.values(router?.state.errors ?? {}).forEach(onRouteError);
	}, []);

	return children;
}

startTransition(() => {
	hydrateRoot(
		document,
		<ReportServerRouteErrors>
			<StrictMode>
				<HydratedRouter onError={onRouteError} />
			</StrictMode>
		</ReportServerRouteErrors>,
		{ onRecoverableError },
	);
});
