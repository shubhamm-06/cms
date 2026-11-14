import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { buildMarketingMetadata } from "@/app/seo";
import { CalendlyPopupLoader } from "@/components/home/calendly-popup";
import { PublicFooter } from "@/components/home/public-footer";
import { PublicHeader } from "@/components/home/public-header";
import { business } from "@/src/lib/business";

const privacyPolicyFont = Figtree({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-homepage",
});

export const metadata: Metadata = {
  ...buildMarketingMetadata({
    title: "Privacy Policy | CurateMyStay",
    description:
      "Learn how CurateMyStay handles information for booking enquiries, property owners, owner portal users, and website visitors.",
    canonicalPath: "https://curatemystay.net/privacy-policy",
  }),
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <div className={`${privacyPolicyFont.variable} cms-homepage`}>
      <CalendlyPopupLoader />
      <PublicHeader analyticsLocation="privacy_policy_page" />
      <main className="bg-[#fbf7f1] text-[#332c28]">
        <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 md:px-8 lg:py-20">
          <header className="border-b border-[#eadfd8] pb-8 sm:pb-10">
            {/* <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#9e4347]">Curate My Stay</p> */}
            <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.035em] text-[#222222] sm:text-5xl">Privacy Policy</h1>
            <p className="mt-4 text-sm font-medium text-[#6d625c]">Last updated: 14 November 2026</p>
          </header>

          <div className="mt-9 space-y-9 text-[16px] leading-7 text-[#4f4742] sm:mt-11 sm:text-[17px] sm:leading-8">
            <section>
              <p>
                CurateMyStay (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) respects your privacy. This policy explains how we collect, use, store, and share personal information when you use our website, submit a booking enquiry, request a property-management proposal, or access the owner portal.
              </p>
              <p className="mt-4">
                <strong className="font-bold text-[#222222]">Privacy contact: </strong>
                <a className="font-semibold text-[#9e4347] underline decoration-[#d8aaa2] underline-offset-4 hover:text-[#7e3438]" href={`mailto:${business.email}`}>
                  {business.email}
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-[#222222]">1. Information we collect</h2>
              <p className="mt-3">The information we collect depends on how you interact with CurateMyStay.</p>

              <h3 className="mt-6 text-lg font-bold text-[#222222]">Booking enquiries</h3>
              <p className="mt-2">If you enquire about a stay, we may collect your name, email address, phone number, requested dates, number of guests, message, and the property you are asking about. We use this information to respond to your enquiry. Submitting an enquiry does not create a confirmed reservation, and the website does not process booking payments.</p>

              <h3 className="mt-6 text-lg font-bold text-[#222222]">Property owners and prospective owners</h3>
              <p className="mt-2">If you are a property owner or prospective owner, we may collect your name, contact details, property location and characteristics, occupancy or revenue information you provide, account details, and communications with us. If you use our forecast or proposal tools, we use the information you submit to prepare an estimate or proposal and follow up about our services.</p>

              <h3 className="mt-6 text-lg font-bold text-[#222222]">Owner portal</h3>
              <p className="mt-2">If you use the owner portal, we process account and profile information, property and booking records, guest details associated with bookings, expenses, performance information, payout records, and support queries. Owners can access guest information relating to their assigned property to manage its operations.</p>

              <h3 className="mt-6 text-lg font-bold text-[#222222]">Website visits</h3>
              <p className="mt-2">When you visit the website, we may receive basic technical information such as your IP address, device and browser details, pages visited, and interactions with the site. Google Analytics and Google Tag Manager may be used on the public website to understand site usage.</p>
              <p className="mt-4">Please do not submit information that is not needed for your enquiry or account.</p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-[#222222]">2. How we use information</h2>
              <p className="mt-3">We use personal information to:</p>
              <ul className="mt-3 list-disc space-y-2 pl-6 marker:text-[#9e4347]">
                <li>Respond to stay and property-management enquiries.</li>
                <li>Prepare property forecasts and proposals.</li>
                <li>Manage owner accounts, properties, bookings, expenses, payouts, and support requests.</li>
                <li>Send service-related emails and account notices.</li>
                <li>Understand website usage and improve our services.</li>
                <li>Protect our services, investigate misuse, and meet legal obligations.</li>
              </ul>
              <p className="mt-4">We do not sell personal information.</p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-[#222222]">3. Who we share information with</h2>
              <p className="mt-3">We may share information with:</p>
              <ul className="mt-3 list-disc space-y-2 pl-6 marker:text-[#9e4347]">
                <li>Service providers that help us operate the website and services, including Supabase for database and authentication services, Resend for email, Google services for proposal documents and analytics, and Calendly if you use its booking link.</li>
                <li>You, through the owner portal, where you may see guest and operational information for your assigned property.</li>
                <li>Authorities or other parties, where required by law or necessary to protect rights, safety, or our services.</li>
              </ul>
              <p className="mt-4">WhatsApp may be used when you choose to contact us or follow a WhatsApp link. Its use is subject to WhatsApp&rsquo;s own privacy terms.</p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-[#222222]">4. Cookies and analytics</h2>
              <p className="mt-3">Our website may use cookies or similar technologies for functionality and Google Analytics measurement. You can manage or delete cookies through your browser settings. Blocking cookies may affect some site features.</p>
              <p className="mt-4">Google may process information according to its own privacy terms. We currently understand that Google Analytics and Google Tag Manager are used; this policy should be updated if advertising or remarketing tools are added.</p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-[#222222]">5. Storage and retention</h2>
              <p className="mt-3">We keep information for as long as reasonably needed to respond to enquiries, provide services, operate owner accounts, maintain business records, resolve disputes, and meet legal obligations. Retention periods may differ depending on the type of information and the reason it was collected.</p>
              <p className="mt-4">When information is no longer needed, we will take reasonable steps to delete it or remove identifying details, subject to applicable legal and operational requirements.</p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-[#222222]">6. Security</h2>
              <p className="mt-3">We use reasonable technical and organisational measures designed to protect information from unauthorised access, loss, or misuse. No online service can guarantee complete security. Please keep your account credentials confidential and contact us if you believe your account has been accessed without permission.</p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-[#222222]">7. Your choices and requests</h2>
              <p className="mt-3">You can contact us to request access to, correction of, or deletion of personal information you have provided, or to raise a privacy concern. We may need to verify your identity and may retain certain information where required or permitted by law.</p>
              <p className="mt-4">You can unsubscribe from non-essential promotional emails using the instructions in the email. Service and account messages may still be sent when needed to provide the service.</p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-[#222222]">8. Children&rsquo;s privacy</h2>
              <p className="mt-3">Our services are intended for adults. Booking enquiries and owner accounts should be submitted by adults. If you believe a child has provided personal information to us, contact us so we can review and take appropriate steps.</p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-[#222222]">9. External services and links</h2>
              <p className="mt-3">Our website may link to services operated by other organisations. Their privacy practices are governed by their own policies. We encourage you to review those policies before providing information to them.</p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-[#222222]">10. Changes to this policy</h2>
              <p className="mt-3">We may update this policy as our services or data practices change. We will post the updated version on this page and revise the &ldquo;Last updated&rdquo; date.</p>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-[#222222]">11. Contact</h2>
              <p className="mt-3">
                For questions or requests about this policy, contact{" "}
                <a className="font-semibold text-[#9e4347] underline decoration-[#d8aaa2] underline-offset-4 hover:text-[#7e3438]" href={`mailto:${business.email}`}>
                  {business.email}
                </a>.
              </p>
            </section>
          </div>
        </article>
      </main>
      <PublicFooter analyticsLocation="privacy_policy_page" homeAnchorPrefix="/" />
    </div>
  );
}
