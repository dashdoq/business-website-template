/**
 * PocketBase access for loaders and actions that runs under collection access
 * rules. This is the default for server-side reads; `pocketbaseAdmin` in
 * `pocketbase-client.server.ts` is only for work that must bypass the rules.
 *
 * - `pocketbasePublic(request)` acts as an anonymous visitor: it sees exactly
 *   what the collection's guest rules allow, including guest creates such as a
 *   contact form. Use it in loaders and actions.
 * - `pocketbaseAsUser(request, token)` acts as the signed-in user whose token
 *   the browser sent, so owner rules apply. Use it in actions only: published
 *   sites edge-cache every GET response for all visitors, so a loader must
 *   never render per-user data (see `require-auth.ts`).
 *
 * Both take the incoming request so PocketBase sees each visitor's own IP
 * (`X-Real-IP`, a trusted proxy header in its settings). Without it every
 * visitor reaches PocketBase from this server's address and shares one
 * per-IP rate limit.
 *
 * Requires PocketBase to be running.
 */
import type { ListResult, RecordModel } from 'pocketbase';
import PocketBase, { ClientResponseError } from 'pocketbase';
import { clientAddress } from '@/lib/rate-limit.server';

const pocketbaseUrl = () => process.env.POCKETBASE_URL || 'http://localhost:8090';

export type RecordListResult<T> = ListResult<T>;

/** `page` and `perPage` are positional in the SDK; everything else is a query option. */
type ListQuery = Record<string, string | number | boolean>;

/** `FormData` keeps file uploads multipart; a plain object is sent as JSON. */
type RecordData = FormData | Record<string, unknown>;

const splitListQuery = ({ page, perPage, ...options }: ListQuery) => ({
	page: Number(page ?? 1),
	perPage: Number(perPage ?? 30),
	options,
});

// A fresh SDK client per request: its authStore and forwarded address must
// never carry one visitor's identity into another request.
const createSdkClient = (request: Request, token?: string) => {
	const pb = new PocketBase(pocketbaseUrl());
	const address = clientAddress(request);

	// The SDK cancels an in-flight request when a later one reuses its key, which
	// would let concurrent loaders abort each other.
	pb.autoCancellation(false);

	if (address) {
		pb.beforeSend = (url, options) => ({
			url,
			options: { ...options, headers: { ...options.headers, 'X-Real-IP': address } },
		});
	}

	if (token) {
		pb.authStore.save(token, null);
	}

	return pb;
};

const createClient = (request: Request, token?: string) => {
	const pb = createSdkClient(request, token);

	return {
		/**
		 * Builds a `filter` with values bound as parameters, e.g.
		 * `filter('slug = {:slug}', { slug })`. Never interpolate request values
		 * into a filter string.
		 */
		filter: (expression: string, params: Record<string, unknown>) => pb.filter(expression, params),

		listRecords: <T>(collection: string, query: ListQuery = {}) => {
			const { page, perPage, options } = splitListQuery(query);

			return pb.collection(collection).getList<T>(page, perPage, options);
		},

		getRecord: <T>(collection: string, id: string, query: ListQuery = {}) =>
			pb.collection(collection).getOne<T>(id, query),

		/**
		 * First record matching `filter`, or `null` when none does (or the rules hide it).
		 * A list query, not `getFirstListItem`: PocketBase answers 404 for a missing
		 * collection too, and that must throw instead of looking like "no match".
		 */
		findFirstRecord: async <T>(collection: string, filter: string, query: ListQuery = {}): Promise<T | null> => {
			const { items } = await pb.collection(collection).getList<T>(1, 1, { ...query, filter, skipTotal: true });

			return items[0] ?? null;
		},

		createRecord: <T>(collection: string, data: RecordData) =>
			pb.collection(collection).create<T>(data),

		updateRecord: <T>(collection: string, id: string, data: RecordData) =>
			pb.collection(collection).update<T>(id, data),

		deleteRecord: async (collection: string, id: string): Promise<void> => {
			await pb.collection(collection).delete(id);
		},
	};
};

export type PocketbaseRulesClient = ReturnType<typeof createClient>;

/** Anonymous visitor access for this request: guest list/view/create rules apply. */
export const pocketbasePublic = (request: Request): PocketbaseRulesClient => createClient(request);

/**
 * Access as the user whose PocketBase token the browser sent in the request
 * body or `Authorization` header. Returns `null` when the token is missing,
 * expired or invalid; otherwise the verified user record and a client whose
 * calls run under that user's access rules. Throws when PocketBase can't be
 * reached, so an outage isn't reported to the user as "sign in again".
 */
export const pocketbaseAsUser = async (
	request: Request,
	token: string | null | undefined,
	authCollection = 'users',
): Promise<{ user: RecordModel; pocketbase: PocketbaseRulesClient } | null> => {
	if (!token) {
		return null;
	}

	const verifier = createSdkClient(request, token);

	const refreshed = await verifier.collection(authCollection).authRefresh().catch((error: unknown) => {
		if (error instanceof ClientResponseError && [400, 401, 403, 404].includes(error.status)) {
			return null;
		}

		throw error;
	});

	if (!refreshed) {
		return null;
	}

	return { user: refreshed.record, pocketbase: createClient(request, refreshed.token) };
};

export default pocketbasePublic;
