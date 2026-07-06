"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const adminPayoutNoticeMessages = {
  admin_payout_marked_paid: "Payout marked paid.",
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

    toast.success(adminPayoutNoticeMessages[notice]);

    const url = new URL(window.location.href);
    url.searchParams.delete("notice");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [notice]);

  return null;
}
