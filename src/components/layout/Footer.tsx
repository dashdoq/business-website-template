import Link from "next/link";
import { Logo } from "@/components/Logo";
import { footerNav, site } from "@/content/site";

export function Footer() {
  return (
    <footer className="on-dark mt-24 bg-ink text-paper">
      <div className="wrap grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs space-y-5">
          <Logo className="h-8 w-auto" />
          <p className="text-sm text-paper/75">{site.description}</p>
          <a href={`mailto:${site.email}`} className="link text-sm">
            {site.email}
          </a>
        </div>
        {footerNav.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="caps mb-4 text-[1.0625rem]">{group.title}</h2>
            <ul className="space-y-2.5 text-sm text-paper/75">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-paper hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-paper/15">
        <p className="wrap py-6 text-xs text-paper/60">
          © {new Date().getFullYear()} woolup. Alle prijzen zijn inclusief btw.
        </p>
      </div>
    </footer>
  );
}
