"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const ownerPayoutNotices = {
  owner_payout_action_failed: { message: "The payout action could not be completed. Please try again.", tone: "error" },
  owner_payout_action_unavailable: { message: "This statement is no longer available for that action.", tone: "error" },
  owner_payout_approved: { message: "Payout statement approved.", tone: "success" },
  owner_payout_query_raised: { message: "Your statement query was sent.", tone: "success" },
} as const;

type OwnerPayoutNotice = keyof typeof ownerPayoutNotices;

function isOwnerPayoutNotice(value: string | undefined): value is OwnerPayoutNotice {
  return Boolean(value && value in ownerPayoutNotices);
}

export function OwnerPayoutNoticeToast({ notice }: { notice?: string }) {
  useEffect(() => {
    if (!isOwnerPayoutNotice(notice)) return;

    const config = ownerPayoutNotices[notice];
    toast[config.tone](config.message);

    const url = new URL(window.location.href);
    url.searchParams.delete("notice");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [notice]);

  return null;
}
