"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ConfirmDeleteButton({ label = "Delete" }: { label?: string }) {
  return (
    <Button
      onClick={(event) => {
        if (!window.confirm("Delete this record?")) event.preventDefault();
      }}
      type="submit"
      variant="danger"
    >
      <Trash2 className="h-4 w-4" />
      {label}
    </Button>
  );
}
