"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const ownerProfileNoticeMessages = {
  owner_profile_updated: "Profile updated.",
} as const;

type OwnerProfileNotice = keyof typeof ownerProfileNoticeMessages;

function isOwnerProfileNotice(value: string | undefined): value is OwnerProfileNotice {
  return Boolean(value && value in ownerProfileNoticeMessages);
}

export function OwnerProfileNoticeToast({ notice }: { notice?: string }) {
  useEffect(() => {
    if (!isOwnerProfileNotice(notice)) {
      return;
    }

    toast.success(ownerProfileNoticeMessages[notice]);

    const url = new URL(window.location.href);
    url.searchParams.delete("notice");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [notice]);

  return null;
}
