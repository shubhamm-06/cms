import { Resend } from "resend";
import { contactSchema } from "@/src/lib/validators/contact";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ message: "Please check the form fields." }, { status: 400 });
  }

  const payload = {
    ...parsed.data,
    phone: parsed.data.phone || null,
    source_page: "landing_page",
  };

  try {
    const result = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? await createAdminClient().from("contact_submissions").insert(payload)
      : await (await createClient()).from("contact_submissions").insert(payload);
    const { error } = result;
    if (error) throw error;

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "CurateMyStay <onboarding@resend.dev>",
        to: process.env.ADMIN_CONTACT_EMAIL || "curatemystay@gmail.com",
        subject: `New CurateMyStay enquiry from ${payload.name}`,
        text: `Name: ${payload.name}\nEmail: ${payload.email}\nPhone: ${payload.phone || "-"}\n\n${payload.message}`,
      });
    }

    return Response.json({ message: "Thanks. We will get back to you shortly." });
  } catch (error) {
    console.error("Contact route failed", error);
    return Response.json({ message: "Could not submit the enquiry right now." }, { status: 500 });
  }
}
