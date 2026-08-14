"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const userNoticeMessages = {
  user_updated: { message: "User updated.", tone: "success" },
  user_update_failed: { message: "User could not be updated. Check the account and try again.", tone: "error" },
  user_deleted: { message: "User deleted.", tone: "success" },
  user_delete_blocked: { message: "Protected admin cannot be deleted.", tone: "error" },
  user_delete_auth_unavailable: {
    message: "User was not deleted. Supabase Auth admin deletion is unavailable.",
    tone: "error",
  },
  user_delete_blocked_linked_records: {
    message: "User has linked operational data. Reassign records or mark the account inactive instead.",
    tone: "error",
  },
  user_delete_failed: { message: "User was not deleted. Check the account and try again.", tone: "error" },
  user_delete_linked: {
    message: "User has linked operational data. Reassign records or mark the account inactive instead.",
    tone: "error",
  },
} as const;

type UserNotice = keyof typeof userNoticeMessages;

function isUserNotice(value: string | undefined): value is UserNotice {
  return Boolean(value && value in userNoticeMessages);
}

export function UserNoticeToast({ notice }: { notice?: string }) {
  useEffect(() => {
    if (!isUserNotice(notice)) {
      return;
    }

    const noticeConfig = userNoticeMessages[notice];
    if (noticeConfig.tone === "error") {
      toast.error(noticeConfig.message);
    } else {
      toast.success(noticeConfig.message);
    }

    const url = new URL(window.location.href);
    url.searchParams.delete("notice");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [notice]);

  return null;
}
