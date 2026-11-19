import Link from "next/link";
import type { ReactNode } from "react";

type ContentPageProps = {
  title: string;
  intro?: ReactNode;
  /** Marks pages whose text still has to be written or checked. */
  draft?: boolean;
  children: ReactNode;
};

export function ContentPage({ title, intro, draft, children }: ContentPageProps) {
  return (
    <div className="wrap pt-8 lg:pt-12">
      <nav aria-label="Kruimelpad" className="mb-6 text-sm text-stone">
        <ol className="flex gap-2">
          <li>
            <Link href="/" className="hover:underline">Home</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink">{title}</li>
        </ol>
      </nav>
      <header className="max-w-3xl space-y-5">
        <h1 className="display-xl">{title}</h1>
        {intro && <div className="max-w-[52ch] text-lg">{intro}</div>}
      </header>
      {draft && (
        <p className="mt-8 max-w-[68ch] border-l-4 border-loden bg-ecru px-4 py-3 text-sm">
          Conceptpagina. Deze tekst is een opzet en moet nog worden aangevuld en gecontroleerd
          voordat de webshop opengaat.
        </p>
      )}
      <div className="mt-10 lg:mt-14">{children}</div>
    </div>
  );
}
