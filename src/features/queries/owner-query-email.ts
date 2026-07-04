import "server-only";

import { Resend } from "resend";

type OwnerQueryEmailInput = {
  message: string;
  ownerEmail: string | null;
  ownerName: string | null;
  ownerPhone: string | null;
  propertyName: string | null;
  queryType: "normal" | "statement";
};

function cleanText(value: string | null | undefined) {
  return (value || "-").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim() || "-";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function adminQueriesUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!siteUrl) return "/dashboard/queries";

  try {
    return new URL("/dashboard/queries", siteUrl).toString();
  } catch {
    return "/dashboard/queries";
  }
}

function buildOwnerQueryEmail(input: OwnerQueryEmailInput) {
  const dashboardUrl = adminQueriesUrl();
  const queryType = input.queryType === "statement" ? "Payout/statement-related query" : "Normal query";
  const text = [
    "New Owner Query",
    "",
    `Owner name: ${cleanText(input.ownerName)}`,
    `Owner email: ${cleanText(input.ownerEmail)}`,
    `Owner phone: ${cleanText(input.ownerPhone)}`,
    `Property: ${cleanText(input.propertyName)}`,
    `Query type: ${queryType}`,
    "",
    "Query message:",
    cleanText(input.message),
    "",
    "Admin dashboard:",
    dashboardUrl,
  ].join("\n");

  const escapedUrl = escapeHtml(dashboardUrl);
  const html = escapeHtml(text)
    .replaceAll("\n", "<br>")
    .replaceAll(escapedUrl, `<a href="${escapedUrl}">${escapedUrl}</a>`);

  return { html: `<div style="font-family:Arial,sans-serif;line-height:1.55">${html}</div>`, text };
}

export async function sendOwnerQueryAdminEmail(input: OwnerQueryEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    console.error("Owner query email is not configured.");
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const ownerName = cleanText(input.ownerName);
    const result = await resend.emails.send({
      from,
      to: process.env.ADMIN_CONTACT_EMAIL || "curatemystay@gmail.com",
      subject: `New owner query — ${ownerName}`,
      ...buildOwnerQueryEmail(input),
    });

    if (result.error) throw new Error("Resend rejected the owner query email.");
  } catch {
    console.error("Owner query admin email failed.");
  }
}
