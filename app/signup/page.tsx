import { AuthForm } from "@/components/forms/auth-form";

export default function SignupPage() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <AuthForm mode="signup" />
    </main>
  );
}
