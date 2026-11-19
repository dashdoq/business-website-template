import Link from "next/link";
import { CartButton } from "@/components/layout/CartButton";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { NavLinks } from "@/components/layout/NavLinks";
import { SearchForm } from "@/components/layout/SearchForm";
import { Logo } from "@/components/Logo";
import { usps } from "@/content/site";

export function Header() {
  return (
    <>
      <a
        href="#inhoud"
        className="sr-only z-50 bg-ink px-4 py-3 text-paper focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Direct naar de inhoud
      </a>

      <div className="on-dark bg-ink text-paper">
        <ul className="wrap no-scrollbar flex h-9 items-center justify-center gap-8 overflow-x-auto text-xs whitespace-nowrap md:justify-between">
          {usps.map((usp, index) => (
            <li key={usp} className={index > 0 ? "hidden md:block" : undefined}>
              {usp}
            </li>
          ))}
        </ul>
      </div>

      <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85">
        <div className="wrap flex h-16 items-center gap-4 lg:h-20 lg:gap-8">
          <MobileMenu />
          <Link href="/" className="shrink-0" aria-label="woolup, naar de homepage">
            <Logo className="h-7 w-auto lg:h-8" title="woolup" />
          </Link>
          <div className="hidden flex-1 lg:block lg:max-w-sm">
            <SearchForm id="zoeken-header" />
          </div>
          <nav aria-label="Hoofdmenu" className="ml-auto hidden lg:block">
            <NavLinks className="flex items-center gap-7" />
          </nav>
          <div className="ml-auto lg:ml-0">
            <CartButton />
          </div>
        </div>
      </header>
    </>
  );
}
