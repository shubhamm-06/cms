import { AuthForm } from "@/components/forms/auth-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#fbf7f1] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl place-items-center sm:min-h-[calc(100vh-4rem)]">
        <AuthForm mode="login" />
      </div>
    </main>
  );
}
