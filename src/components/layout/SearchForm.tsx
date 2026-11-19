import { SearchIcon } from "@/components/Icons";

/** Plain GET form: works without JavaScript and lands on /shop?q=… */
export function SearchForm({ id, defaultValue }: { id: string; defaultValue?: string }) {
  return (
    <form action="/shop" method="get" role="search" className="relative">
      <label htmlFor={id} className="sr-only">
        Zoek in de shop
      </label>
      <input
        id={id}
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="Zoek sokken…"
        autoComplete="off"
        className="field rounded-full bg-tile pr-11 pl-4"
      />
      <button
        type="submit"
        className="absolute top-1/2 right-1 grid size-9 -translate-y-1/2 place-items-center rounded-full hover:bg-line/60"
        aria-label="Zoeken"
      >
        <SearchIcon className="size-5" />
      </button>
    </form>
  );
}
