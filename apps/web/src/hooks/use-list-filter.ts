import { useCallback, useEffect, useMemo, useState } from 'react';

type ListFilterOptions<Item> = {
	items: readonly Item[];
	/** The text a search query matches against, e.g. `item => `${item.title} ${item.summary}``. */
	searchText?: (item: Item) => string;
	/** The category (or categories) an item belongs to, for filter chips or tabs. */
	categoryOf?: (item: Item) => string | readonly string[];
	/** Show this many results at a time; `results` is then the current page. */
	pageSize?: number;
};

const normalize = (value: string) => value
	.normalize('NFD')
	.replace(/\p{Diacritic}/gu, '')
	.toLocaleLowerCase()
	.trim();

const toList = (value: string | readonly string[]) => (typeof value === 'string' ? [value] : value);

/**
 * Search box + category filter over a list already on the page (menu, portfolio,
 * products, articles, team), with optional paging. Matching ignores case and
 * accents, so "cafe" finds "Café". It holds no markup: render the chips, the
 * input, `results` and the page controls however the site looks.
 *
 *   const filter = useListFilter({ items: dishes, searchText: d => d.name, categoryOf: d => d.course, pageSize: 12 });
 *   <input value={filter.query} onChange={e => filter.setQuery(e.target.value)} />
 *   {filter.categories.map(c => <button aria-pressed={filter.category === c} onClick={() => filter.setCategory(c)}>…)}
 *   {filter.results.map(…)}
 *   <button disabled={filter.page === 1} onClick={() => filter.setPage(filter.page - 1)}>…</button>
 *
 * `setCategory(null)` shows every category. `categories` keeps the order items
 * first use them. Changing the query or category goes back to page 1, and
 * `matches` is the full filtered list when the page is not what you need.
 */
export function useListFilter<Item>({ items, searchText, categoryOf, pageSize }: ListFilterOptions<Item>) {
	const [query, setQuery] = useState('');
	const [category, setCategory] = useState<string | null>(null);
	const [page, setPage] = useState(1);

	const categories = useMemo(() => {
		if (!categoryOf) {
			return [];
		}

		return [...new Set(items.flatMap(item => toList(categoryOf(item))))];
	}, [items, categoryOf]);

	const needle = normalize(query);

	const matches = useMemo(() => items.filter((item) => {
		if (category && categoryOf && !toList(categoryOf(item)).includes(category)) {
			return false;
		}

		if (needle && searchText && !normalize(searchText(item)).includes(needle)) {
			return false;
		}

		return true;
	}), [items, category, categoryOf, needle, searchText]);

	const pageCount = pageSize ? Math.max(1, Math.ceil(matches.length / pageSize)) : 1;
	const currentPage = Math.min(page, pageCount);
	const results = pageSize ? matches.slice((currentPage - 1) * pageSize, currentPage * pageSize) : matches;

	useEffect(() => {
		setPage(1);
	}, [needle, category]);

	const reset = useCallback(() => {
		setQuery('');
		setCategory(null);
		setPage(1);
	}, []);

	return {
		query,
		setQuery,
		category,
		setCategory,
		categories,
		matches,
		results,
		isFiltered: Boolean(needle || category),
		page: currentPage,
		pageCount,
		setPage,
		reset,
	};
}
