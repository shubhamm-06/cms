"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { MAP_LOCATION_WARNING } from "@/src/lib/maps";

const propertyNoticeMessages = {
  property_created: "Property created.",
  property_created_map_warning: `Property created. ${MAP_LOCATION_WARNING}`,
  property_deleted: "Property deleted.",
  property_deleted_with_image_warning: "Property deleted, but some Storage images may need manual cleanup.",
  property_delete_blocked_dependency: "Property is still linked to records that cannot be cascaded yet.",
  property_delete_blocked_owner_queries: "Property is still linked to owner queries. Apply the cascade migration and retry.",
  property_delete_failed: "Property could not be deleted.",
  property_delete_not_found: "Property was not found.",
  property_save_failed: "Property could not be saved.",
  property_slug_taken: "That website slug is already in use. Choose a different one.",
  property_updated: "Property updated.",
  property_updated_map_warning: `Property updated. ${MAP_LOCATION_WARNING}`,
  property_validation_failed: "Review the required property fields before saving.",
} as const;

type PropertyNoticeCode = keyof typeof propertyNoticeMessages;
type PropertyFailureNoticeCode = Extract<
  PropertyNoticeCode,
  "property_delete_blocked_dependency" | "property_delete_blocked_owner_queries" | "property_delete_failed" | "property_delete_not_found"
    | "property_save_failed" | "property_slug_taken" | "property_validation_failed"
>;

function isPropertyNoticeCode(value: string | undefined): value is PropertyNoticeCode {
  return Boolean(value && value in propertyNoticeMessages);
}

function isPropertyFailureNoticeCode(value: PropertyNoticeCode): value is PropertyFailureNoticeCode {
  return (
    value === "property_delete_blocked_dependency" ||
    value === "property_delete_blocked_owner_queries" ||
    value === "property_delete_failed" ||
    value === "property_delete_not_found" ||
    value === "property_save_failed" ||
    value === "property_slug_taken" ||
    value === "property_validation_failed"
  );
}

function isPropertyWarningNoticeCode(value: PropertyNoticeCode) {
  return value === "property_deleted_with_image_warning" || value === "property_created_map_warning" || value === "property_updated_map_warning";
}

export function PropertyNoticeToast({ notice }: { notice?: string }) {
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current || !isPropertyNoticeCode(notice)) return;

    shown.current = true;
    if (isPropertyFailureNoticeCode(notice)) {
      toast.error(propertyNoticeMessages[notice]);
    } else if (isPropertyWarningNoticeCode(notice)) {
      toast.warning(propertyNoticeMessages[notice]);
    } else {
      toast.success(propertyNoticeMessages[notice]);
    }

    const url = new URL(window.location.href);
    url.searchParams.delete("notice");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [notice]);

  return null;
}
