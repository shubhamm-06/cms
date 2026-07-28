import "server-only";

import { Resend } from "resend";
import { Webhook } from "standardwebhooks";
import { z } from "zod";

export const runtime = "nodejs";

class AuthHookConfigurationError extends Error {}

const emailActionSchema = z.enum([
  "signup",
  "recovery",
  "invite",
  "magiclink",
  "email_change",
  "reauthentication",
]);

type EmailAction = z.infer<typeof emailActionSchema>;

const emailDataSchema = z
  .object({
    email_action_type: emailActionSchema,
    factor_type: z.string().optional().default(""),
    old_email: z.string().optional().default(""),
    old_phone: z.string().optional().default(""),
    provider: z.string().optional().default(""),
    redirect_to: z.string().optional().default(""),
    site_url: z.string().optional().default(""),
    token: z.string().optional().default(""),
    token_hash: z.string().optional().default(""),
    token_hash_new: z.string().optional().default(""),
    token_new: z.string().optional().default(""),
  })
  .passthrough();

const userSchema = z
  .object({
    email: z.string().email().nullable().optional(),
    id: z.string().min(1),
    new_email: z.string().email().nullable().optional(),
  })
  .passthrough();

const hookPayloadSchema = z
  .object({
    email_data: emailDataSchema,
    user: userSchema,
  })
  .passthrough()
  .superRefine((payload, ctx) => {
    const actionType = payload.email_data.email_action_type;

    if (actionType !== "email_change") {
      if (!payload.user.email) {
        ctx.addIssue({
          code: "custom",
          message: "Missing recipient email.",
          path: ["user", "email"],
        });
      }

      if (!payload.email_data.token_hash) {
        ctx.addIssue({
          code: "custom",
          message: "Missing token hash.",
          path: ["email_data", "token_hash"],
        });
      }

      return;
    }

    const hasCurrentEmailConfirmation = Boolean(payload.user.email && payload.email_data.token_hash_new);
    const hasNewEmailConfirmation = Boolean(payload.user.new_email && payload.email_data.token_hash);

    if (!hasCurrentEmailConfirmation && !hasNewEmailConfirmation) {
      ctx.addIssue({
        code: "custom",
        message: "Missing email change recipient or token hash.",
        path: ["email_data"],
      });
    }
  });

type HookPayload = z.infer<typeof hookPayloadSchema>;

type EmailMessage = {
  button: string;
  heading: string;
  explanation: string;
  subject: string;
  to: string;
  verificationUrl: string;
};

const emailCopy: Record<Exclude<EmailAction, "email_change">, { button: string; heading: string; subject: string }> = {
  invite: {
    button: "Accept invitation",
    heading: "Accept your invitation",
    subject: "You have been invited to CurateMyStay",
  },
  magiclink: {
    button: "Sign in",
    heading: "Sign in to CurateMyStay",
    subject: "Your CurateMyStay sign-in link",
  },
  reauthentication: {
    button: "Confirm action",
    heading: "Confirm it\u2019s you",
    subject: "Confirm your CurateMyStay action",
  },
  recovery: {
    button: "Reset password",
    heading: "Reset your password",
    subject: "Reset your CurateMyStay password",
  },
  signup: {
    button: "Confirm email",
    heading: "Confirm your email",
    subject: "Confirm your CurateMyStay account",
  },
};

function json(status: number, body: Record<string, unknown>) {
  return Response.json(body, { status });
}

function normalizeHookSecret(secret: string) {
  return secret.trim().replace(/^v\d+,whsec_/, "").replace(/^whsec_/, "");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cleanText(value: string) {
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
}

function getSafeActionType(payload: unknown) {
  if (!payload || typeof payload !== "object") return undefined;

  const emailData = (payload as { email_data?: unknown }).email_data;
  if (!emailData || typeof emailData !== "object") return undefined;

  const actionType = (emailData as { email_action_type?: unknown }).email_action_type;
  const parsed = emailActionSchema.safeParse(actionType);

  return parsed.success ? parsed.data : undefined;
}

function logValidationFailure(error: z.ZodError, payload: unknown) {
  console.error("Supabase auth email hook payload validation failed.", {
    actionType: getSafeActionType(payload),
    issues: error.issues.map((issue) => ({
      code: issue.code,
      path: issue.path,
    })),
  });
}

function getRequiredUrl(name: "NEXT_PUBLIC_SITE_URL" | "NEXT_PUBLIC_SUPABASE_URL") {
  const value = process.env[name]?.trim();
  if (!value) throw new AuthHookConfigurationError(`${name} is not configured.`);

  const url = new URL(value);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new AuthHookConfigurationError(`${name} must be an HTTP URL.`);
  }

  return url;
}

function getSafeRedirect(rawRedirect: string) {
  const appUrl = getRequiredUrl("NEXT_PUBLIC_SITE_URL");
  if (!rawRedirect.trim()) return appUrl.toString();

  try {
    const redirectUrl = new URL(rawRedirect, appUrl);
    if (redirectUrl.origin !== appUrl.origin) return appUrl.toString();
    return redirectUrl.toString();
  } catch {
    return appUrl.toString();
  }
}

function buildVerificationUrl(tokenHash: string, actionType: EmailAction, redirectTo: string) {
  if (!tokenHash) throw new Error("Missing token hash.");

  const supabaseUrl = getRequiredUrl("NEXT_PUBLIC_SUPABASE_URL");
  const verifyUrl = new URL("/auth/v1/verify", supabaseUrl);
  verifyUrl.search = new URLSearchParams({
    redirect_to: redirectTo,
    token: tokenHash,
    type: actionType,
  }).toString();

  return verifyUrl.toString();
}

function normalActionExplanation(actionType: Exclude<EmailAction, "email_change">) {
  switch (actionType) {
    case "invite":
      return "You have been invited to access the CurateMyStay owner portal. Use the button below to accept the invitation.";
    case "magiclink":
      return "Use this secure link to sign in to your CurateMyStay account.";
    case "reauthentication":
      return "Use this secure link to confirm the account action you just requested.";
    case "recovery":
      return "Use this secure link to reset your CurateMyStay account password.";
    case "signup":
      return "Thanks for creating a CurateMyStay account. Confirm your email to continue.";
  }
}

function buildStandardMessage(payload: HookPayload): EmailMessage[] {
  const actionType = payload.email_data.email_action_type;
  if (actionType === "email_change") return buildEmailChangeMessages(payload);

  const recipient = payload.user.email;
  if (!recipient) throw new Error("Missing recipient email.");

  const copy = emailCopy[actionType];
  const redirectTo = getSafeRedirect(payload.email_data.redirect_to);
  const verificationUrl = buildVerificationUrl(payload.email_data.token_hash, actionType, redirectTo);

  return [
    {
      ...copy,
      explanation: normalActionExplanation(actionType),
      to: recipient,
      verificationUrl,
    },
  ];
}

function buildEmailChangeMessages(payload: HookPayload): EmailMessage[] {
  const redirectTo = getSafeRedirect(payload.email_data.redirect_to);
  const currentEmail = payload.user.email || "";
  const newEmail = payload.user.new_email || "";
  const messages: EmailMessage[] = [];
  const copy = {
    button: "Confirm email change",
    heading: "Confirm your email change",
    subject: "Confirm your CurateMyStay email change",
  };

  if (payload.email_data.token_hash_new && currentEmail) {
    messages.push({
      ...copy,
      explanation: `Confirm this CurateMyStay email change from your current email address (${cleanText(currentEmail)}).`,
      to: currentEmail,
      verificationUrl: buildVerificationUrl(payload.email_data.token_hash_new, "email_change", redirectTo),
    });
  }

  if (payload.email_data.token_hash && newEmail) {
    messages.push({
      ...copy,
      explanation: `Confirm this CurateMyStay email change from your new email address (${cleanText(newEmail)}).`,
      to: newEmail,
      verificationUrl: buildVerificationUrl(payload.email_data.token_hash, "email_change", redirectTo),
    });
  }

  if (!messages.length) throw new Error("Missing email change recipient or token hash.");
  return messages;
}

function buildEmailBody(message: EmailMessage) {
  const escapedHeading = escapeHtml(message.heading);
  const escapedExplanation = escapeHtml(message.explanation);
  const escapedButton = escapeHtml(message.button);
  const escapedUrl = escapeHtml(message.verificationUrl);
  const securityNote =
    "If you did not request this email, you can safely ignore it. This link is time-sensitive and should not be forwarded.";

  const text = [
    message.heading,
    "",
    message.explanation,
    "",
    message.button,
    message.verificationUrl,
    "",
    securityNote,
    "",
    "CurateMyStay",
  ].join("\n");

  const html = `<!doctype html>
<html>
  <body style="margin:0;background:#fffbf7;padding:0;font-family:Arial,Helvetica,sans-serif;color:#243b53;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fffbf7;margin:0;padding:28px 14px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #eadfd3;border-radius:18px;box-shadow:0 12px 32px rgba(36,59,83,0.10);overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 10px;">
                <div style="font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#e45b5f;">CurateMyStay</div>
                <h1 style="margin:14px 0 0;font-size:28px;line-height:1.18;color:#1f2933;">${escapedHeading}</h1>
                <p style="margin:14px 0 0;font-size:16px;line-height:1.65;color:#40566b;">${escapedExplanation}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px 10px;">
                <a href="${escapedUrl}" style="display:inline-block;background:#e45b5f;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;line-height:1;border-radius:10px;padding:15px 20px;">${escapedButton}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 28px 0;">
                <p style="margin:0 0 8px;font-size:13px;line-height:1.55;color:#6b7c8f;">If the button does not work, open this link:</p>
                <p style="margin:0;word-break:break-word;font-size:13px;line-height:1.55;">
                  <a href="${escapedUrl}" style="color:#e45b5f;text-decoration:underline;">${escapedUrl}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 28px 28px;">
                <p style="margin:0;border-top:1px solid #eadfd3;padding-top:16px;font-size:12px;line-height:1.6;color:#6b7c8f;">${escapeHtml(securityNote)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { html, text };
}

async function sendAuthEmails(messages: EmailMessage[]) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) throw new Error("Resend auth email configuration is missing.");

  const resend = new Resend(apiKey);
  for (const message of messages) {
    const result = await resend.emails.send({
      from,
      to: message.to,
      subject: message.subject,
      ...buildEmailBody(message),
    });

    if (result.error) throw new Error("Resend rejected an auth email.");
  }
}

function verifyPayload(rawBody: string, headers: Headers) {
  const hookSecret = process.env.SUPABASE_SEND_EMAIL_HOOK_SECRET?.trim();
  if (!hookSecret) throw new AuthHookConfigurationError("Supabase send email hook secret is not configured.");

  const webhook = new Webhook(normalizeHookSecret(hookSecret));
  return webhook.verify(rawBody, Object.fromEntries(headers));
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  let verifiedPayload: unknown;
  try {
    verifiedPayload = verifyPayload(rawBody, request.headers);
  } catch (error) {
    if (error instanceof AuthHookConfigurationError) {
      console.error("Supabase auth email hook configuration is missing.");
      return json(500, { ok: false });
    }

    return json(401, { ok: false });
  }

  let messages: EmailMessage[];
  try {
    const parsed = hookPayloadSchema.parse(verifiedPayload);
    messages = buildStandardMessage(parsed);
  } catch (error) {
    if (error instanceof AuthHookConfigurationError) {
      console.error("Supabase auth email hook configuration is missing.");
      return json(500, { ok: false });
    }

    if (error instanceof z.ZodError) {
      logValidationFailure(error, verifiedPayload);
    }

    return json(400, { ok: false });
  }

  try {
    await sendAuthEmails(messages);
  } catch {
    console.error("Supabase auth email delivery failed.");
    return json(500, { ok: false });
  }

  return Response.json({ ok: true });
}
