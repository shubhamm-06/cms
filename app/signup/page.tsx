import type { Metadata } from "next";
import { AuthForm } from "@/components/forms/auth-form";
import { noIndexMetadata } from "@/app/seo";

export const metadata: Metadata = {
  title: "Signup",
  ...noIndexMetadata,
};

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[#fbf7f1] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl place-items-center sm:min-h-[calc(100vh-4rem)]">
        <AuthForm mode="signup" />
      </div>
    </main>
  );
}
