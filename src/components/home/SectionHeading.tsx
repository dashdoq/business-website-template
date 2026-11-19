import Link from "next/link";
import type { ReactNode } from "react";

type SectionHeadingProps = {
  id: string;
  children: ReactNode;
  link?: { href: string; label: string };
};

export function SectionHeading({ id, children, link }: SectionHeadingProps) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 lg:mb-8">
      <h2 id={id} className="display-lg">
        {children}
      </h2>
      {link && (
        <Link href={link.href} className="link shrink-0 pb-1 text-sm">
          {link.label}
        </Link>
      )}
    </div>
  );
}
