"use client";

import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      toastOptions={{
        style: {
          borderColor: "var(--border)",
          borderRadius: "8px",
          fontFamily: "inherit",
        },
      }}
      {...props}
    />
  );
}

