import type { RecordModel, RecordSubscription } from 'pocketbase';
import { useCallback, useEffect, useRef, useState } from 'react';
import pb from '@/lib/pocketbase-client';

type RecordsOptions = {
	/** PocketBase sort, e.g. `'-created'`. */
	sort?: string;
	/** PocketBase filter; build it with `pb.filter()` when it contains user input. */
	filter?: string;
	/** Relation fields to expand, e.g. `'owner'`. */
	expand?: string;
	/** Page the list with `page` / `setPage` instead of loading every record. */
	perPage?: number;
	/** Apply creates, updates and deletes from other visitors as they happen. */
	realtime?: boolean;
	/** `false` skips loading, e.g. until `useAuth().isAuthed` for an owner-scoped collection. */
	enabled?: boolean;
};

/** `FormData` keeps file uploads multipart; a plain object is sent as JSON. */
type RecordData = FormData | Record<string, unknown>;

// Auto-cancellation is for repeated reads; a write must never be dropped because another one started.
const NO_CANCEL = { requestKey: null };

/**
 * One collection on the page: its records with loading and error state, and
 * `create` / `update` / `remove` that keep the list in step. It holds no markup:
 * the table, the cards, the form and the empty state are the site's to design.
 *
 *   const tasks = usePocketbaseRecords<Task>('tasks', { sort: '-created', realtime: true });
 *   await tasks.create({ title, owner: user.id });
 *   await tasks.update(task.id, { done: !task.done });
 *   await tasks.remove(task.id);
 *
 * Access rules still apply: an owner-scoped collection returns the signed-in
 * user's rows, and every `create` on it must set `owner`. Pass `enabled:
 * isAuthed` for those so nothing loads before the session is restored. After a
 * `create` the list reloads, because where the new record sorts is the
 * server's call; `update` and `remove` change the list in place. Mutations throw
 * PocketBase's `ClientResponseError` for the caller to show.
 */
export function usePocketbaseRecords<T extends RecordModel = RecordModel>(
	collection: string,
	{ sort, filter, expand, perPage, realtime = false, enabled = true }: RecordsOptions = {},
) {
	const [records, setRecords] = useState<T[]>([]);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [isLoading, setIsLoading] = useState(enabled);
	const [error, setError] = useState<unknown>(null);
	const request = useRef(0);

	const load = useCallback(async () => {
		if (!enabled) {
			setRecords([]);
			setIsLoading(false);

			return;
		}

		const current = ++request.current;
		const query = { sort, filter, expand };

		setIsLoading(true);
		setError(null);

		try {
			if (perPage) {
				const result = await pb.collection<T>(collection).getList(page, perPage, query);

				if (current === request.current) {
					setRecords(result.items);
					setTotalPages(result.totalPages);
					setTotalItems(result.totalItems);
				}
			} else {
				const items = await pb.collection<T>(collection).getFullList(query);

				if (current === request.current) {
					setRecords(items);
					setTotalPages(1);
					setTotalItems(items.length);
				}
			}
		} catch (loadError) {
			if (current === request.current) {
				setError(loadError);
			}
		} finally {
			if (current === request.current) {
				setIsLoading(false);
			}
		}
	}, [collection, sort, filter, expand, perPage, page, enabled]);

	useEffect(() => {
		void load();
	}, [load]);

	useEffect(() => {
		if (!realtime || !enabled) {
			return;
		}

		// Expanded the same way as the list, so a live update keeps `record.expand` intact.
		const subscription = pb.collection<T>(collection).subscribe('*', (event: RecordSubscription<T>) => {
			if (event.action === 'create') {
				void load();
			} else if (event.action === 'update') {
				setRecords(current => current.map(record => (record.id === event.record.id ? event.record : record)));
			} else if (event.action === 'delete') {
				setRecords(current => current.filter(record => record.id !== event.record.id));
			}
		}, { expand });

		subscription.catch(() => {
			// Realtime is a nicety on top of the loaded list; the list itself already succeeded or failed above.
		});

		// Only this listener: `unsubscribe('*')` would also silence other instances on the same collection.
		return () => {
			void subscription.then(unsubscribe => unsubscribe()).catch(() => {});
		};
	}, [collection, expand, realtime, enabled, load]);

	const create = useCallback(async (data: RecordData) => {
		const record = await pb.collection<T>(collection).create(data, NO_CANCEL);

		await load();

		return record;
	}, [collection, load]);

	const update = useCallback(async (id: string, data: RecordData) => {
		const record = await pb.collection<T>(collection).update(id, data, { ...NO_CANCEL, expand });

		setRecords(current => current.map(item => (item.id === id ? record : item)));

		return record;
	}, [collection, expand]);

	const remove = useCallback(async (id: string) => {
		await pb.collection(collection).delete(id, NO_CANCEL);

		setRecords(current => current.filter(item => item.id !== id));
		setTotalItems(current => Math.max(0, current - 1));
	}, [collection]);

	return {
		records,
		isLoading,
		error,
		reload: load,
		page,
		setPage,
		totalPages,
		totalItems,
		create,
		update,
		remove,
	};
}
