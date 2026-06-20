"use client";

import Link from "next/link";
import { useActionState } from "react";
import { googleLoginAction, loginAction, signupAction } from "@/src/features/auth/auth-actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const action = mode === "login" ? loginAction : signupAction;
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <div className="cms-card w-full max-w-md p-6">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {mode === "login" ? "Sign in to CurateMyStay." : "New accounts wait for admin approval."}
        </p>
      </div>
      <form action={formAction} className="space-y-4">
        {mode === "signup" ? (
          <>
            <Field label="Name">
              <Input name="name" required />
            </Field>
            <Field label="Phone">
              <Input name="phone" />
            </Field>
          </>
        ) : null}
        <Field label="Email">
          <Input name="email" required type="email" />
        </Field>
        <Field label="Password">
          <Input name="password" required type="password" />
        </Field>
        {state?.message ? <p className="text-sm text-red-700">{state.message}</p> : null}
        <Button className="w-full" pending={pending} type="submit" variant="primary">
          {mode === "login" ? "Login" : "Signup"}
        </Button>
      </form>
      <form action={googleLoginAction} className="mt-3">
        <Button className="w-full" type="submit">
          Continue with Google
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-[var(--muted)]">
        {mode === "login" ? "Need an account?" : "Already have an account?"}{" "}
        <Link className="font-bold text-[var(--brand-ink)]" href={mode === "login" ? "/signup" : "/login"}>
          {mode === "login" ? "Signup" : "Login"}
        </Link>
      </p>
    </div>
  );
}
