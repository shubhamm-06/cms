"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const adminPayoutNoticeMessages = {
  admin_payout_marked_paid: { message: "Payout marked paid.", tone: "success" },
  admin_payout_update_failed: { message: "Payout could not be updated. Please try again.", tone: "error" },
} as const;

type AdminPayoutNotice = keyof typeof adminPayoutNoticeMessages;

function isAdminPayoutNotice(value: string | undefined): value is AdminPayoutNotice {
  return Boolean(value && value in adminPayoutNoticeMessages);
}

export function AdminPayoutNoticeToast({ notice }: { notice?: string }) {
  useEffect(() => {
    if (!isAdminPayoutNotice(notice)) {
      return;
    }

    const config = adminPayoutNoticeMessages[notice];
    toast[config.tone](config.message);

    const url = new URL(window.location.href);
    url.searchParams.delete("notice");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [notice]);

  return null;
}
