import { useCallback, useEffect, useRef, useState } from 'react';
import {
	type CheckoutCustomer,
	type CheckoutItemCustomFieldValue,
	getAvailability,
	getTimeSlots,
	initializeCheckout,
	isBookingSlotTakenError,
} from '@/api/ecommerce-api';

const AVAILABILITY_WINDOW_DAYS = 60;

/** Local `YYYY-MM-DD`, which both availability calls take — not a UTC ISO slice. */
const toDateKey = (date: Date) =>
	date.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });

const addDays = (date: Date, days: number) => {
	const next = new Date(date);

	next.setDate(next.getDate() + days);

	return next;
};

type BookingAvailabilityOptions = {
	/** `variant.booking_event?.id`; nothing loads while it is missing. */
	bookingEventId: string | null | undefined;
	/** How many days ahead to offer. */
	windowDays?: number;
};

type BookOptions = {
	variantId: string;
	/** Where the buyer lands if they abandon checkout; the product page, not `/checkout/cancelled`. */
	cancelPath: string;
	successPath?: string;
	customFieldValues?: CheckoutItemCustomFieldValue[];
	/** Only when PocketBase is enabled and someone is signed in. */
	customer?: CheckoutCustomer;
};

/**
 * Days, times and checkout for one appointment product. Everything loads in the
 * browser after mount, in the visitor's time zone, so the product page keeps
 * its normal `loader`. It holds no markup: the calendar, the time chips, both
 * loading and both empty states are the site's to design.
 *
 *   const booking = useBookingAvailability({ bookingEventId: variant.booking_event?.id });
 *   {booking.availableDates.map(day => <button aria-pressed={day === booking.selectedDate} onClick={() => booking.selectDate(day)}>…)}
 *   {booking.slots.map(slot => <button aria-pressed={slot === booking.selectedSlot} onClick={() => booking.setSelectedSlot(slot)}>…)}
 *   <p>Times shown in {booking.timeZone}</p>
 *   <button disabled={!booking.selectedSlot || booking.isBooking} onClick={() => booking.book({ variantId: variant.id, cancelPath: `/product/${product.url_handle}` })}>…</button>
 *
 * It opens on the first available day with its times loaded. `book` redirects
 * to the hosted checkout; when someone paid for that slot first it reloads the
 * day, clears the selection and sets `isSlotTaken`, so the page can ask for
 * another time. Any other failure is left in `error`.
 */
export function useBookingAvailability({ bookingEventId, windowDays = AVAILABILITY_WINDOW_DAYS }: BookingAvailabilityOptions) {
	const [availableDates, setAvailableDates] = useState<string[]>([]);
	const [selectedDate, setSelectedDate] = useState<string | null>(null);
	const [slots, setSlots] = useState<string[]>([]);
	const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
	const [timeZone, setTimeZone] = useState<string | null>(null);
	const [isLoadingDates, setIsLoadingDates] = useState(false);
	const [isLoadingSlots, setIsLoadingSlots] = useState(false);
	const [isBooking, setIsBooking] = useState(false);
	const [isSlotTaken, setIsSlotTaken] = useState(false);
	const [error, setError] = useState<unknown>(null);
	const slotsRequest = useRef(0);

	const loadSlots = useCallback(async (date: string | null) => {
		if (!bookingEventId || !date) {
			setSlots([]);

			return;
		}

		const request = ++slotsRequest.current;

		setIsLoadingSlots(true);
		setError(null);

		try {
			const { slots: daySlots, time_zone } = await getTimeSlots({ bookingEventId, date });

			if (request === slotsRequest.current) {
				setSlots(daySlots);
				setTimeZone(time_zone);
			}
		} catch (loadError) {
			if (request === slotsRequest.current) {
				setSlots([]);
				setError(loadError);
			}
		} finally {
			if (request === slotsRequest.current) {
				setIsLoadingSlots(false);
			}
		}
	}, [bookingEventId]);

	const selectDate = useCallback(async (date: string) => {
		setSelectedDate(date);
		setSelectedSlot(null);
		setIsSlotTaken(false);
		await loadSlots(date);
	}, [loadSlots]);

	const refreshSlots = useCallback(async () => {
		setSelectedSlot(null);
		await loadSlots(selectedDate);
	}, [loadSlots, selectedDate]);

	useEffect(() => {
		if (!bookingEventId) {
			setAvailableDates([]);
			setSelectedDate(null);
			setSlots([]);

			return;
		}

		let isCurrent = true;

		const loadDates = async () => {
			setIsLoadingDates(true);
			setError(null);

			try {
				const today = new Date();
				const { available_dates, time_zone } = await getAvailability({
					bookingEventId,
					fromDate: toDateKey(today),
					toDate: toDateKey(addDays(today, windowDays)),
				});

				if (!isCurrent) {
					return;
				}

				const sortedDates = [...available_dates].sort();

				setAvailableDates(sortedDates);
				setTimeZone(time_zone);
				setSelectedDate(sortedDates[0] ?? null);
				setSelectedSlot(null);
				await loadSlots(sortedDates[0] ?? null);
			} catch (loadError) {
				if (isCurrent) {
					setAvailableDates([]);
					setError(loadError);
				}
			} finally {
				if (isCurrent) {
					setIsLoadingDates(false);
				}
			}
		};

		loadDates();

		return () => {
			isCurrent = false;
		};
	}, [bookingEventId, windowDays, loadSlots]);

	const book = useCallback(async ({
		variantId,
		cancelPath,
		successPath = '/checkout/success',
		customFieldValues,
		customer,
	}: BookOptions) => {
		if (!selectedSlot || !timeZone) {
			return;
		}

		setIsBooking(true);
		setIsSlotTaken(false);
		setError(null);

		try {
			const { url } = await initializeCheckout({
				items: [{
					variant_id: variantId,
					quantity: 1,
					time_slot: selectedSlot,
					time_zone: timeZone,
					...(customFieldValues?.length ? { custom_field_values: customFieldValues } : {}),
				}],
				successUrl: `${window.location.origin}${successPath}`,
				cancelUrl: `${window.location.origin}${cancelPath}`,
				customer,
			});

			window.location.href = url;
		} catch (bookError) {
			if (isBookingSlotTakenError(bookError)) {
				setIsSlotTaken(true);
				await refreshSlots();
			} else {
				setError(bookError);
			}

			setIsBooking(false);
		}
	}, [selectedSlot, timeZone, refreshSlots]);

	return {
		availableDates,
		selectedDate,
		selectDate,
		slots,
		selectedSlot,
		setSelectedSlot,
		refreshSlots,
		timeZone,
		isLoadingDates,
		isLoadingSlots,
		book,
		isBooking,
		isSlotTaken,
		error,
	};
}
