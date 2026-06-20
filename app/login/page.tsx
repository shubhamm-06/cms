import { AuthForm } from "@/components/forms/auth-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <AuthForm mode="login" />
    </main>
  );
}
