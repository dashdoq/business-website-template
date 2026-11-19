"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/Icons";
import { cn } from "@/lib/format";

type ProductCarouselProps = {
  label: string;
  children: ReactNode;
};

/**
 * A row of product cards that scrolls sideways. Touch and trackpad scroll
 * natively (with snap points); the round arrow buttons page through on desktop.
 */
export function ProductCarousel({ label, children }: ProductCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setCanPrev(track.scrollLeft > 4);
    setCanNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    update();
    track.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(track);
    return () => {
      track.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [update]);

  const page = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({
      left: direction * track.clientWidth * 0.9,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <div className="relative" role="region" aria-roledescription="carrousel" aria-label={label}>
      <ul
        ref={trackRef}
        className="no-scrollbar relative -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:scroll-px-0 sm:px-0 lg:gap-4"
      >
        {Children.map(children, (child) => (
          <li className="w-[68%] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/3)] lg:w-[calc((100%-3rem)/4)]">
            {child}
          </li>
        ))}
      </ul>
      <CarouselButton direction="prev" disabled={!canPrev} onClick={() => page(-1)} />
      <CarouselButton direction="next" disabled={!canNext} onClick={() => page(1)} />
    </div>
  );
}

function CarouselButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = direction === "prev" ? ArrowLeftIcon : ArrowRightIcon;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Vorige producten" : "Volgende producten"}
      className={cn(
        "absolute top-[34%] z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-paper shadow-[0_4px_16px_rgb(0_0_0/0.08)] transition-[opacity,border-color] duration-150 hover:border-stone sm:grid",
        direction === "prev" ? "-left-4" : "-right-4",
        disabled && "pointer-events-none opacity-0",
      )}
    >
      <Icon className="size-5" />
    </button>
  );
}
