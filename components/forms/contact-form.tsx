"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    const form = event.currentTarget;
    const response = await fetch("/api/contact", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
      headers: { "Content-Type": "application/json" },
    });
    const data = (await response.json()) as { message?: string };
    setStatus(response.ok ? "success" : "error");
    setMessage(data.message || (response.ok ? "Enquiry sent." : "Could not send enquiry."));
    if (response.ok) form.reset();
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <Input name="name" required />
        </Field>
        <Field label="Email">
          <Input name="email" required type="email" />
        </Field>
      </div>
      <Field label="Phone">
        <Input name="phone" />
      </Field>
      <Field label="Property details">
        <Textarea name="message" placeholder="Tell us where the property is and what support you need." required />
      </Field>
      {message ? (
        <p className={`text-sm ${status === "success" ? "text-green-700" : "text-red-700"}`}>{message}</p>
      ) : null}
      <Button pending={status === "loading"} type="submit" variant="primary">
        <Send className="h-4 w-4" />
        Send enquiry
      </Button>
    </form>
  );
}
