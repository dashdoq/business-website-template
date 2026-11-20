import PocketBase, { type SendOptions } from 'pocketbase';

const POCKETBASE_API_URL = '/hcgi/platform';

const pocketbaseClient = new PocketBase(POCKETBASE_API_URL);

// PocketBase 0.42+ answers 401 to any request carrying an expired or unknown
// token, public reads included.
if (typeof window !== 'undefined') {
	const { authStore } = pocketbaseClient;

	pocketbaseClient.afterSend = (response: Response, data: unknown, options?: SendOptions) => {
		if (response.status === 401 && authStore.token && options?.headers?.Authorization === authStore.token) {
			authStore.clear();
			window.location.reload();
		}

		return data;
	};

	if (authStore.token && !authStore.isValid) {
		authStore.clear();
	} else if (authStore.isValid && authStore.record?.collectionName) {
		pocketbaseClient
			.collection(authStore.record.collectionName)
			.authRefresh({ requestKey: null })
			.catch(() => {});
	}
}

export default pocketbaseClient;

export { pocketbaseClient, POCKETBASE_API_URL };
