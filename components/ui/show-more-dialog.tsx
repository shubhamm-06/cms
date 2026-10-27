"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils/cn";

/**
 * Shared "show more" dialog for long public content: a bottom sheet below `sm`
 * and a centred modal from `sm`.
 *
 * Built on Radix Dialog like the photo tour, so focus is trapped, Esc closes it
 * and focus returns to the opener. `Dialog.Overlay` is rendered on purpose: it is
 * what carries Radix's page scroll lock (with scrollbar-width compensation), so
 * the dialog body is the only scroll container while it is open.
 *
 * Pass `trigger` for a single opening button, or `open`/`onOpenChange` when
 * several buttons open the same dialog.
 */
export function ShowMoreDialog({
  children,
  description,
  onOpenChange,
  open,
  title,
  trigger,
}: {
  children: ReactNode;
  /** Optional one-line summary under the title, also used as the accessible description. */
  description?: string;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  title: string;
  trigger?: ReactNode;
}) {
  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      {trigger ? <Dialog.Trigger asChild>{trigger}</Dialog.Trigger> : null}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-public-ink/50" />
        <Dialog.Content
          // Radix links a Dialog.Description automatically; without one, opt out explicitly.
          {...(description ? {} : { "aria-describedby": undefined })}
          className={cn(
            "fixed z-[80] flex flex-col bg-white text-public-ink shadow-[0_8px_28px_rgba(0,0,0,0.28)] outline-none",
            // Mobile: bottom sheet that slides up as it opens.
            "inset-x-0 bottom-0 max-h-[90dvh] rounded-t-[20px] pb-[env(safe-area-inset-bottom)] max-sm:transition-transform max-sm:duration-300 max-sm:ease-out max-sm:starting:translate-y-full motion-reduce:transition-none",
            // Desktop: centred modal.
            "sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[85dvh] sm:w-[calc(100vw-48px)] sm:max-w-[680px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[20px] sm:pb-0",
          )}
        >
          <div className="flex items-center gap-3 border-b border-public-hairline px-4 py-3 sm:px-6 sm:py-4">
            <Dialog.Close
              aria-label="Close"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full outline-none transition-colors hover:bg-public-hover focus-visible:ring-2 focus-visible:ring-public-coral focus-visible:ring-offset-2"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </Dialog.Close>
            <div className="min-w-0">
              <Dialog.Title className="truncate text-[18px] font-bold leading-tight tracking-[-0.01em] sm:text-[20px]">
                {title}
              </Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-0.5 truncate text-[13.5px] text-public-muted">
                  {description}
                </Dialog.Description>
              ) : null}
            </div>
          </div>
          {/* The only scroll container while the dialog is open. */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 sm:py-6">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
