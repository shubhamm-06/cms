"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const settingsNoticeMessages = {
  settings_updated: "Settings updated.",
} as const;

type SettingsNotice = keyof typeof settingsNoticeMessages;

function isSettingsNotice(value: string | undefined): value is SettingsNotice {
  return Boolean(value && value in settingsNoticeMessages);
}

export function SettingsNoticeToast({ notice }: { notice?: string }) {
  useEffect(() => {
    if (!isSettingsNotice(notice)) {
      return;
    }

    toast.success(settingsNoticeMessages[notice]);

    const url = new URL(window.location.href);
    url.searchParams.delete("notice");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [notice]);

  return null;
}
