import type { Metadata } from "next";
import { AuthForm } from "@/components/forms/auth-form";
import { noIndexMetadata, siteDescription, twitterImage, ogImage, siteName } from "@/app/seo";

export const metadata: Metadata = {
  title: {
    absolute: "Login | CurateMyStay",
  },
  description: siteDescription,
  alternates: {
    canonical: "/login",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName,
    url: "/login",
    title: "Login | CurateMyStay",
    description: siteDescription,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Login | CurateMyStay",
    description: siteDescription,
    images: [twitterImage],
  },
  ...noIndexMetadata,
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#fbf7f1] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl place-items-center sm:min-h-[calc(100vh-4rem)]">
        <AuthForm mode="login" />
      </div>
    </main>
  );
}
