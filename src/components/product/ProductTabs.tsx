"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/format";

type Tab = { id: string; label: string; content: ReactNode };

/** Accessible tabs; a link to #<tab id> (e.g. #maattabel) opens that tab. */
export function ProductTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const openFromHash = () => {
      const index = tabs.findIndex((t) => `#${t.id}` === window.location.hash);
      if (index >= 0) setActive(index);
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [tabs]);

  const onKeyDown = (event: KeyboardEvent) => {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (active + step + tabs.length) % tabs.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label="Productinformatie" className="no-scrollbar flex gap-6 overflow-x-auto border-b border-line" onKeyDown={onKeyDown}>
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            id={`${baseId}-tab-${index}`}
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-controls={`${baseId}-panel-${index}`}
            tabIndex={index === active ? 0 : -1}
            onClick={() => setActive(index)}
            className={cn(
              "caps -mb-px shrink-0 border-b-2 py-3 text-[1.0625rem]",
              index === active ? "border-ink" : "border-transparent text-stone hover:text-ink",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          id={`${baseId}-panel-${index}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${index}`}
          hidden={index !== active}
          className="pt-6"
        >
          <span id={tab.id} className="block scroll-mt-28" />
          {tab.content}
        </div>
      ))}
    </div>
  );
}
