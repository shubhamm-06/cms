import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AccountDisabledPage() {
  return (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <div className="cms-card max-w-md p-8">
        <h1 className="text-2xl font-bold">Account inactive</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          This account is inactive. Contact CurateMyStay if you believe this should be changed.
        </p>
        <Button className="mt-6" variant="primary">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </main>
  );
}
