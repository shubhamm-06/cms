"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const adminProfileNoticeMessages = {
  admin_profile_updated: "Profile updated.",
} as const;

type AdminProfileNotice = keyof typeof adminProfileNoticeMessages;

function isAdminProfileNotice(value: string | undefined): value is AdminProfileNotice {
  return Boolean(value && value in adminProfileNoticeMessages);
}

export function AdminProfileNoticeToast({ notice }: { notice?: string }) {
  useEffect(() => {
    if (!isAdminProfileNotice(notice)) {
      return;
    }

    toast.success(adminProfileNoticeMessages[notice]);

    const url = new URL(window.location.href);
    url.searchParams.delete("notice");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [notice]);

  return null;
}
