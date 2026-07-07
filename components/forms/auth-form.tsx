"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { CheckCircle2, Eye, EyeOff, Home, KeyRound } from "lucide-react";
import { useFormStatus } from "react-dom";
import { googleLoginAction, loginAction, signupAction } from "@/src/features/auth/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function GoogleButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      className="min-h-11 w-full border-[#d8d0c2] bg-white text-sm font-semibold text-[#25211d] shadow-[0_1px_2px_rgba(32,24,18,0.04)] hover:bg-[#fbf7f1]"
      disabled={pending}
      pending={pending}
      type="submit"
    >
      <span className="grid h-5 w-5 place-items-center rounded-full border border-[#e6ded1] bg-white text-xs font-bold text-[var(--brand-ink)]">
        G
      </span>
      {pending ? "Opening Google..." : "Continue with Google"}
    </Button>
  );
}

const valuePoints = ["Transparent performance reporting", "Owner-first visibility", "Managed property operations"];

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const action = mode === "login" ? loginAction : signupAction;
  const [state, formAction, pending] = useActionState(action, {});
  const [showPassword, setShowPassword] = useState(false);
  const isLogin = mode === "login";
  const panelTitle = isLogin ? "Your property operations, in one place." : "A clearer way to manage your Goa property.";
  const panelCopy = isLogin
    ? "Review performance, statements, and operating updates from a calm CurateMyStay workspace."
    : "Request access to the owner portal built for transparent short-term rental management.";

  return (
    <div className="w-full max-w-5xl">
      <div className="mb-5 flex items-center justify-between gap-3 px-1 sm:mb-6">
        <Link className="inline-flex items-center gap-3" href="/" aria-label="CurateMyStay home">
          <span className="relative block h-9 w-9 sm:h-10 sm:w-10">
            <Image
              alt="CurateMyStay"
              className="object-contain"
              fill
              priority
              sizes="40px"
              src="/logo.png"
            />
          </span>
          <span className="pt-0.5">
            <span className="block text-[0.95rem] font-semibold leading-none tracking-tight text-[#25211d]">
              CurateMyStay
            </span>
            <span className="mt-1 hidden text-[0.7rem] font-medium leading-none tracking-[0.01em] text-[#756d63] sm:block">
              Goa property management
            </span>
          </span>
        </Link>
        <Link
          className="inline-flex min-h-9 items-center gap-2 rounded-md px-2 text-sm font-bold text-[#62594f] underline-offset-4 hover:text-[var(--brand-ink)] hover:underline"
          href="/"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Public site</span>
          <span className="sm:hidden">Home</span>
        </Link>
      </div>

      <div className="grid overflow-hidden rounded-[18px] border border-[#e1d8ca] bg-white shadow-[0_24px_70px_rgba(32,24,18,0.12)] md:grid-cols-[0.92fr_1fr]">
        <aside className="hidden bg-[#211d1a] p-8 text-white md:flex md:flex-col md:justify-between lg:p-10">
          <div>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.055] px-3 py-1.5 text-xs font-semibold text-[#f2c9bb]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" />
              Owner portal
            </div>
            <h2 className="max-w-sm text-[1.8rem] font-bold leading-[1.1] tracking-tight text-[#fffaf4] lg:text-[2rem]">
              {panelTitle}
            </h2>
            <p className="mt-5 max-w-sm text-sm font-normal leading-6 text-[#d8cec2]">{panelCopy}</p>
          </div>

          <div className="mt-10 space-y-2.5">
            {valuePoints.map((point) => (
              <div key={point} className="flex items-center gap-2.5 rounded-lg border border-white/8 bg-white/[0.032] px-3.5 py-2.5">
                <CheckCircle2 className="h-3.5 w-3.5 flex-none text-[#eca08b]" />
                <span className="text-sm font-medium text-[#f7eee5]">{point}</span>
              </div>
            ))}
          </div>
        </aside>

        <section className="bg-[#fffdf9] px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
          <div className="mb-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand-ink)]">
              <KeyRound className="h-4 w-4" />
            </div>
            <h1 className="whitespace-nowrap text-[1.65rem] font-bold leading-tight tracking-tight text-[#25211d] sm:text-[1.85rem]">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-2 max-w-sm text-sm font-normal leading-6 text-[#62594f]">
              {isLogin
                ? "Sign in to access your CurateMyStay dashboard."
                : "Owner accounts are reviewed before dashboard access."}
            </p>
          </div>

          <form action={formAction}>
            <fieldset className="space-y-3.5" disabled={pending}>
              {mode === "signup" ? (
                <>
                  <label className="block">
                    <span className="mb-1.5 block text-[0.78rem] font-semibold text-[#4f4841]">Name *</span>
                    <Input
                      autoComplete="name"
                      className="min-h-11 border-[#d8d0c2] text-sm placeholder:text-[#a39a90]"
                      name="name"
                      placeholder="Your full name"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[0.78rem] font-semibold text-[#4f4841]">Phone</span>
                    <Input
                      autoComplete="tel"
                      className="min-h-11 border-[#d8d0c2] text-sm placeholder:text-[#a39a90]"
                      name="phone"
                      placeholder="98765 43210"
                    />
                  </label>
                </>
              ) : null}
              <label className="block">
                <span className="mb-1.5 block text-[0.78rem] font-semibold text-[#4f4841]">Email *</span>
                  <Input
                    autoComplete="email"
                    className="min-h-11 border-[#d8d0c2] text-sm placeholder:text-[#a39a90]"
                    name="email"
                    placeholder="you@example.com"
                    required
                    type="email"
                  />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[0.78rem] font-semibold text-[#4f4841]">Password *</span>
                <div className="relative">
                  <Input
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    className="min-h-11 border-[#d8d0c2] pr-12 text-sm placeholder:text-[#a39a90]"
                    name="password"
                    placeholder={isLogin ? "Enter your password" : "Create a secure password"}
                    required
                    type={showPassword ? "text" : "password"}
                  />
                  <button
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-[#756d63] hover:bg-[#f3eadf] hover:text-[#211d1a] disabled:opacity-60"
                    disabled={pending}
                    onClick={() => setShowPassword((value) => !value)}
                    type="button"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>
              {state?.message ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium leading-5 text-red-700">
                  {state.message}
                </div>
              ) : null}
              <Button className="min-h-11 w-full text-sm font-semibold shadow-[0_8px_18px_rgba(229,72,77,0.16)]" pending={pending} type="submit" variant="primary">
                {pending ? (isLogin ? "Signing in..." : "Creating account...") : isLogin ? "Sign in" : "Create account"}
              </Button>
            </fieldset>
          </form>

          <div className="my-4 flex items-center gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#8a8176]">
            <span className="h-px flex-1 bg-[#e6ded1]" />
            or
            <span className="h-px flex-1 bg-[#e6ded1]" />
          </div>

          <form action={googleLoginAction}>
            <GoogleButton />
          </form>

          <p className="mt-4 text-center text-sm font-normal text-[#62594f]">
            {isLogin ? "Need an owner account?" : "Already have an account?"}{" "}
            <Link className="font-semibold text-[var(--brand-ink)] hover:underline" href={isLogin ? "/signup" : "/login"}>
              {isLogin ? "Sign up" : "Sign in"}
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
