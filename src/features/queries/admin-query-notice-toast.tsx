"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const adminQueryNoticeMessages = {
  admin_query_deleted: "Query deleted.",
  admin_query_resolved: "Query resolved.",
} as const;

type AdminQueryNotice = keyof typeof adminQueryNoticeMessages;

function isAdminQueryNotice(value: string | undefined): value is AdminQueryNotice {
  return Boolean(value && value in adminQueryNoticeMessages);
}

export function AdminQueryNoticeToast({ notice }: { notice?: string }) {
  useEffect(() => {
    if (!isAdminQueryNotice(notice)) {
      return;
    }

    toast.success(adminQueryNoticeMessages[notice]);

    const url = new URL(window.location.href);
    url.searchParams.delete("notice");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [notice]);

  return null;
}
