"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

const propertyNoticeMessages = {
  property_created: "Property created.",
  property_deleted: "Property deleted.",
  property_updated: "Property updated.",
} as const;

type PropertyNoticeCode = keyof typeof propertyNoticeMessages;

function isPropertyNoticeCode(value: string | undefined): value is PropertyNoticeCode {
  return Boolean(value && value in propertyNoticeMessages);
}

export function PropertyNoticeToast({ notice }: { notice?: string }) {
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current || !isPropertyNoticeCode(notice)) return;

    shown.current = true;
    toast.success(propertyNoticeMessages[notice]);

    const url = new URL(window.location.href);
    url.searchParams.delete("notice");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [notice]);

  return null;
}
