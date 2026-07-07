"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

const propertyNoticeMessages = {
  property_created: "Property created.",
  property_deleted: "Property deleted.",
  property_delete_blocked_dependency: "Property is still linked to records that cannot be cascaded yet.",
  property_delete_blocked_owner_queries: "Property is still linked to owner queries. Apply the cascade migration and retry.",
  property_delete_failed: "Property could not be deleted.",
  property_delete_not_found: "Property was not found.",
  property_updated: "Property updated.",
} as const;

type PropertyNoticeCode = keyof typeof propertyNoticeMessages;
type PropertyFailureNoticeCode = Extract<
  PropertyNoticeCode,
  "property_delete_blocked_dependency" | "property_delete_blocked_owner_queries" | "property_delete_failed" | "property_delete_not_found"
>;

function isPropertyNoticeCode(value: string | undefined): value is PropertyNoticeCode {
  return Boolean(value && value in propertyNoticeMessages);
}

function isPropertyFailureNoticeCode(value: PropertyNoticeCode): value is PropertyFailureNoticeCode {
  return (
    value === "property_delete_blocked_dependency" ||
    value === "property_delete_blocked_owner_queries" ||
    value === "property_delete_failed" ||
    value === "property_delete_not_found"
  );
}

export function PropertyNoticeToast({ notice }: { notice?: string }) {
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current || !isPropertyNoticeCode(notice)) return;

    shown.current = true;
    if (isPropertyFailureNoticeCode(notice)) {
      toast.error(propertyNoticeMessages[notice]);
    } else {
      toast.success(propertyNoticeMessages[notice]);
    }

    const url = new URL(window.location.href);
    url.searchParams.delete("notice");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [notice]);

  return null;
}
