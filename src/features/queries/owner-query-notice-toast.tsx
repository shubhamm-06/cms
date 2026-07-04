"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const ownerQueryNoticeMessages = {
  owner_query_created: "Query sent. We will review it shortly.",
} as const;

type OwnerQueryNotice = keyof typeof ownerQueryNoticeMessages;

function isOwnerQueryNotice(value: string | undefined): value is OwnerQueryNotice {
  return Boolean(value && value in ownerQueryNoticeMessages);
}

export function OwnerQueryNoticeToast({ notice }: { notice?: string }) {
  useEffect(() => {
    if (!isOwnerQueryNotice(notice)) {
      return;
    }

    toast.success(ownerQueryNoticeMessages[notice]);

    const url = new URL(window.location.href);
    url.searchParams.delete("notice");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [notice]);

  return null;
}
