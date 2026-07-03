"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const userNoticeMessages = {
  user_updated: { message: "User updated.", tone: "success" },
  user_deleted: { message: "User deleted.", tone: "success" },
  user_delete_blocked: { message: "Protected admin cannot be deleted.", tone: "error" },
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
