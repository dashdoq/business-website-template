import { type KeyboardEvent, useCallback, useEffect, useState } from 'react';

type CarouselOptions = {
	count: number;
	/** Advance every N ms. Paused while hovered, focused, off-screen tab or under reduced motion. */
	autoplayMs?: number;
	/** Wrap from the last slide to the first; false stops at both ends. */
	loop?: boolean;
};

const wrapIndex = (index: number, count: number, loop: boolean) => {
	if (count <= 0) {
		return 0;
	}

	if (loop) {
		return ((index % count) + count) % count;
	}

	return Math.min(Math.max(index, 0), count - 1);
};

/**
 * Index state for a slider, testimonial rotator or hero slideshow whose markup
 * and transitions the site designs itself. For a swipeable track, the template
 * also ships `embla-carousel-react`.
 *
 *   const carousel = useCarousel({ count: slides.length, autoplayMs: 6000 });
 *   <section {...carousel.regionProps} aria-label="Testimonials">
 *     {slides.map((slide, i) => <article key={slide.id} hidden={i !== carousel.index}>…</article>)}
 *     <button type="button" onClick={carousel.prev} aria-label="Previous">…</button>
 *   </section>
 *
 * The region pauses autoplay on hover and focus and moves with the arrow keys.
 */
export function useCarousel({ count, autoplayMs, loop = true }: CarouselOptions) {
	const [index, setIndex] = useState(0);
	const [isPaused, setIsPaused] = useState(false);

	const goTo = useCallback((next: number) => setIndex(wrapIndex(next, count, loop)), [count, loop]);
	const next = useCallback(() => setIndex(current => wrapIndex(current + 1, count, loop)), [count, loop]);
	const prev = useCallback(() => setIndex(current => wrapIndex(current - 1, count, loop)), [count, loop]);
	const pause = useCallback(() => setIsPaused(true), []);
	const resume = useCallback(() => setIsPaused(false), []);

	useEffect(() => {
		setIndex(current => wrapIndex(current, count, false));
	}, [count]);

	useEffect(() => {
		if (!autoplayMs || isPaused || count < 2) {
			return;
		}

		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			return;
		}

		const timer = window.setInterval(() => {
			if (document.visibilityState === 'visible') {
				setIndex(current => wrapIndex(current + 1, count, true));
			}
		}, autoplayMs);

		return () => window.clearInterval(timer);
	}, [autoplayMs, isPaused, count]);

	const onKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
		if (event.key === 'ArrowRight') {
			event.preventDefault();
			next();
		} else if (event.key === 'ArrowLeft') {
			event.preventDefault();
			prev();
		}
	}, [next, prev]);

	return {
		index,
		count,
		next,
		prev,
		goTo,
		isFirst: index === 0,
		isLast: index === count - 1,
		isPaused,
		pause,
		resume,
		regionProps: {
			onMouseEnter: pause,
			onMouseLeave: resume,
			onFocus: pause,
			onBlur: resume,
			onKeyDown,
			'aria-roledescription': 'carousel',
		},
	};
}
