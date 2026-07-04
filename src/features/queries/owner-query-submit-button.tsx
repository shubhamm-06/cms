"use client";

import { useFormStatus } from "react-dom";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OwnerQuerySubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full sm:w-auto" pending={pending} type="submit" variant="primary">
      {pending ? null : <Send className="h-4 w-4" />}
      {pending ? "Sending..." : "Send query"}
    </Button>
  );
}
