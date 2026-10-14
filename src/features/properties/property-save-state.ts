import { toast } from "sonner";

/**
 * Save state for the property form. The Save button sits below the image manager,
 * outside the `<form>` (it uses the `form` attribute), so it cannot read React's
 * `useFormStatus`. The form's action reports start and finish through a window
 * event instead, and the button listens for its own form.
 *
 * Do not disable the Save button from its click handler: React flushes that
 * synchronously, before the browser's submit step, and the disabled submit button
 * cancels the submission. That left the button on "Saving..." with nothing sent.
 */

export const PROPERTY_SAVE_EVENT = "cms-property-save-state";

/** A server action that never answers must not leave the button stuck. */
export const PROPERTY_SAVE_TIMEOUT_MS = 30_000;

function announce(formId: string, pending: boolean) {
  window.dispatchEvent(new CustomEvent(PROPERTY_SAVE_EVENT, { detail: { formId, pending } }));
}

/**
 * Call from the form's `onSubmit`, not from the action: React holds state updates made
 * inside a form action's transition until the action finishes, so "Saving..." would
 * never show while the request is in flight.
 */
export function announcePropertySaveStart(formId: string) {
  announce(formId, true);
}

/** Next.js signals `redirect()` and `notFound()` by throwing; those must reach the router. */
function isNavigationError(error: unknown) {
  const digest = typeof error === "object" && error && "digest" in error ? String(error.digest) : "";
  return digest.startsWith("NEXT_REDIRECT") || digest.startsWith("NEXT_HTTP_ERROR_FALLBACK");
}

/**
 * Runs the save and ALWAYS clears the pending state afterwards. A thrown error or
 * a missing response shows a visible message and is logged, instead of leaving a
 * spinner that never stops.
 */
export async function trackPropertySave(formId: string, run: () => Promise<unknown>) {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    await Promise.race([
      run(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("property-save-timeout")), PROPERTY_SAVE_TIMEOUT_MS);
      }),
    ]);
  } catch (error) {
    if (isNavigationError(error)) throw error;

    console.error("Property save failed", error);
    toast.error(
      error instanceof Error && error.message === "property-save-timeout"
        ? "Saving is taking too long. Check your connection, then reload before trying again."
        : "Property could not be saved. Try again.",
    );
  } finally {
    clearTimeout(timer);
    announce(formId, false);
  }
}
