interface ImportMeta {
	hot?: {
		send(event: string, data?: unknown): void;
		on<T = unknown>(event: string, cb: (data: T) => void): void;
	};
}

declare module 'virtual:horizons-build-guard-config' {
	export const HEALTH_PATH: string;
	export const RELOAD_HOLD_LIMIT_MS: number;
	export const CODE_CHANGED_EVENT: string;
	export const TURN_STATE_EVENT: string;
	export const TURN_STATE_REQUEST_EVENT: string;
	export const ROOT_ROUTE_URL_PREFIX: string;
}

declare module 'virtual:horizons-editor-channel' {
	export const ALLOWED_PARENT_ORIGINS: string[];
	export function postToEditor(message: Record<string, unknown>): void;
}

declare module 'virtual:react-router/hmr-runtime' {
	type SignatureFunction = (type?: unknown, key?: string, forceReset?: boolean, getCustomHooks?: () => unknown[]) => unknown;

	const RefreshRuntime: {
		register: (type: unknown, id: string) => void;
		getFamilyByID: (id: string) => { current: unknown } | undefined;
		createSignatureFunctionForTransform: () => SignatureFunction;
		setSignature: (type: unknown, key: string, forceReset?: boolean, getCustomHooks?: () => unknown[]) => void;
	};
	export default RefreshRuntime;
}
