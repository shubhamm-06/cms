"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const bookingNoticeMessages = {
  booking_created: "Booking created.",
  booking_updated: "Booking updated.",
  booking_save_failed: "Booking could not be saved. Please review the record and try again.",
  booking_deleted: "Booking deleted.",
  booking_delete_failed: "Booking could not be deleted. Please try again.",
  booking_delete_not_found: "Booking was already deleted or could not be found.",
} as const;

type BookingNotice = keyof typeof bookingNoticeMessages;

const bookingFailureNotices = new Set<BookingNotice>(["booking_save_failed", "booking_delete_failed", "booking_delete_not_found"]);

function isBookingNotice(value: string | undefined): value is BookingNotice {
  return Boolean(value && value in bookingNoticeMessages);
}

export function BookingNoticeToast({ notice }: { notice?: string }) {
  useEffect(() => {
    if (!isBookingNotice(notice)) {
      return;
    }

    toast[bookingFailureNotices.has(notice) ? "error" : "success"](bookingNoticeMessages[notice]);

    const url = new URL(window.location.href);
    url.searchParams.delete("notice");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [notice]);

  return null;
}
