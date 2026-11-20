import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import {
	type CreateProductReviewParams,
	createProductReview,
	EcommerceApiError,
	getProductReviews,
	type ProductReview,
	type ProductReviewsAnalytics,
} from '@/api/ecommerce-api';

/**
 * The store's review-request email links to `/product/{handle}` with these params, one link per
 * star, so a shopper lands on the product page with the review form already open.
 */
const REVIEW_MODAL_PARAM = 'open-modal';
const REVIEW_MODAL_NAME = 'EcommerceSubmitReviewModal';
const REVIEW_TOKEN_PARAM = 'reviewToken';
const REVIEW_LINK_PARAMS = [REVIEW_MODAL_PARAM, 'rating', 'reviewerName', 'reviewerEmail', REVIEW_TOKEN_PARAM];

export type ReviewFormPrefill = {
	/** 0 when the link carried no valid rating. */
	rating: number;
	reviewerName: string;
	email: string;
};

export type ReviewSummary = {
	total: number;
	/** Mean rating, 0 when there are no reviews. */
	average: number;
};

export type SubmitReviewResult = 'published' | 'pending' | 'already_reviewed';

const EMPTY_PREFILL: ReviewFormPrefill = { rating: 0, reviewerName: '', email: '' };

const toRating = (value: string | null): number => {
	const rating = Number.parseInt(value ?? '', 10);

	return rating >= 1 && rating <= 5 ? rating : 0;
};

const summarizeReviews = (reviews: ProductReview[]): ReviewSummary => ({
	total: reviews.length,
	average: reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0,
});

const addRating = (summary: ReviewSummary, rating: number): ReviewSummary => ({
	total: summary.total + 1,
	average: (summary.average * summary.total + rating) / (summary.total + 1),
});

/**
 * Reviews for one product page: the published list, a rating summary, a submit call and the
 * review form's open state. Everything loads in the browser after mount, so the page keeps its
 * normal `loader`. It holds no markup: stars, list, form and dialog are the site's to design.
 *
 *   const reviews = useProductReviews({ productId: product.id, reviewsAnalytics: product.reviews_analytics });
 *   {reviews.isEnabled && <section>{reviews.summary && …}{reviews.reviews.map(review => <li key={review.id}>…</li>)}</section>}
 *   <Dialog open={reviews.isFormOpen} onOpenChange={reviews.setIsFormOpen}>
 *     <form> seeded from reviews.prefill, sent with reviews.submit({ email, rating, reviewerName, comment }) </form>
 *   </Dialog>
 *
 * `isEnabled` is true only once this product's reviews have loaded; show no reviews section
 * while it is false, which also covers a failed request. Render the dialog regardless: when the
 * URL carries the review email's params the form opens with `prefill` filled in and the params
 * are removed from the address bar, so it has to open even if the list failed to load. The hook
 * closes it once the store says reviews are off.
 *
 * `summary` comes from `reviewsAnalytics`, or from the list when it holds every review, and is
 * null otherwise; show its total and average together so they never disagree. `submit` resolves
 * to `'published'` (already in the list and the summary), `'pending'` (awaits the merchant's
 * approval) or `'already_reviewed'`; anything else throws. A review sent from the email link
 * carries its `reviewToken`, which marks it as from a buyer.
 */
export function useProductReviews({
	productId,
	reviewsAnalytics,
}: {
	productId: string;
	reviewsAnalytics?: ProductReviewsAnalytics | null;
}) {
	const [searchParams] = useSearchParams();
	const [reviews, setReviews] = useState<ProductReview[]>([]);
	const [summary, setSummary] = useState<ReviewSummary | null>(null);
	const [isEnabled, setIsEnabled] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [prefill, setPrefill] = useState<ReviewFormPrefill>(EMPTY_PREFILL);
	const [verificationToken, setVerificationToken] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const analyticsTotal = reviewsAnalytics?.total_reviews ?? 0;
	const analyticsAverage = reviewsAnalytics?.average_rating ?? 0;

	useEffect(() => {
		let isCurrent = true;

		setIsLoading(true);
		setIsEnabled(false);
		setReviews([]);
		setSummary(null);

		getProductReviews({ productId })
			.then((result) => {
				if (!isCurrent) {
					return;
				}

				if (!result) {
					setIsFormOpen(false);
					return;
				}

				setIsEnabled(true);
				setReviews(result.reviews);

				if (analyticsTotal > 0) {
					setSummary({ total: analyticsTotal, average: analyticsAverage });
				} else if (result.count === result.reviews.length) {
					setSummary(summarizeReviews(result.reviews));
				}
			})
			.catch(() => {})
			.finally(() => {
				if (isCurrent) {
					setIsLoading(false);
				}
			});

		return () => {
			isCurrent = false;
		};
	}, [productId, analyticsTotal, analyticsAverage]);

	useEffect(() => {
		if (searchParams.get(REVIEW_MODAL_PARAM) !== REVIEW_MODAL_NAME) {
			return;
		}

		setPrefill({
			rating: toRating(searchParams.get('rating')),
			reviewerName: searchParams.get('reviewerName') ?? '',
			email: searchParams.get('reviewerEmail') ?? '',
		});
		setVerificationToken(searchParams.get(REVIEW_TOKEN_PARAM) ?? '');
		setIsFormOpen(true);

		// setSearchParams is a navigation in framework mode and would run the product loader again.
		// The router is not told about this edit, so searchParams keeps the old values and this
		// effect does not run a second time.
		const url = new URL(window.location.href);

		REVIEW_LINK_PARAMS.forEach(param => url.searchParams.delete(param));
		window.history.replaceState(window.history.state, '', url);
	}, [searchParams]);

	const submit = useCallback(async (review: Omit<CreateProductReviewParams, 'productId' | 'verificationToken'>): Promise<SubmitReviewResult> => {
		setIsSubmitting(true);

		try {
			const created = await createProductReview({
				...review,
				productId,
				verificationToken: verificationToken || undefined,
			});

			if (created.status === 'published') {
				setReviews(current => [created, ...current]);
				setSummary(current => (current ? addRating(current, created.rating) : current));
			}

			setPrefill(EMPTY_PREFILL);
			setVerificationToken('');
			setIsFormOpen(false);

			return created.status === 'published' ? 'published' : 'pending';
		} catch (error) {
			if (error instanceof EcommerceApiError && error.status === 409) {
				return 'already_reviewed';
			}

			throw error;
		} finally {
			setIsSubmitting(false);
		}
	}, [productId, verificationToken]);

	return {
		reviews,
		summary,
		isEnabled,
		isLoading,
		isFormOpen,
		setIsFormOpen,
		prefill,
		isSubmitting,
		submit,
	};
}
