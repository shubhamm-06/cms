import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { ogImage, siteName } from "@/app/seo";
import { FaqPublicPage } from "@/components/home/reference-home";

const faqCanonicalUrl = "https://curatemystay.net/faq";

const faqItems = [
  {
    question: "What does CurateMyStay do?",
    answer:
      "CurateMyStay helps property owners manage short-term rental properties in Goa. The service includes property operations, booking visibility, property expense tracking, owner reporting, payout visibility and owner communication.",
  },
  {
    question: "What types of properties does CurateMyStay manage?",
    answer:
      "CurateMyStay is focused on eligible apartments, villas and holiday homes in Goa. Property suitability is reviewed based on location, configuration, condition and short-term rental potential.",
  },
  {
    question: "Can NRI property owners use CurateMyStay?",
    answer:
      "Yes. Owners living outside Goa or outside India can work with CurateMyStay and view relevant property information, bookings, expenses, performance and payouts through the owner dashboard.",
  },
  {
    question: "How can I estimate my property's rental potential?",
    answer:
      "You can submit your property details through the CurateMyStay forecast form. The calculator uses details such as property type, configuration, location, size and amenities to provide an estimated rental forecast.",
  },
  {
    question: "Is the revenue forecast guaranteed?",
    answer:
      "No. The forecast is an estimate based on the property details submitted and the assumptions used by the calculator. Actual rental performance may vary.",
  },
  {
    question: "What is included in the property management proposal?",
    answer:
      "The customised proposal may include estimated annual revenue, seasonal performance, estimated operating costs, estimated net profit, property setup recommendations and suggested next steps.",
  },
  {
    question: "Does the public proposal include management fees or revenue-sharing terms?",
    answer:
      "No fixed commercial terms are shown in the public proposal. Management fees and commercial terms are discussed separately after reviewing the property and the owner's requirements.",
  },
  {
    question: "What information can owners view?",
    answer:
      "Owners can view information related to their assigned property, including property details, bookings, property expenses, current-month performance, payout history and owner queries.",
  },
  {
    question: "Can owners view other properties or CurateMyStay's internal expenses?",
    answer:
      "No. Owners can view only the information connected to their assigned property. They cannot view other owners, other properties, CurateMyStay's internal expenses or admin-only information.",
  },
  {
    question: "How are owner payouts handled?",
    answer:
      "Payouts are calculated for the previous completed calendar month using the applicable booking revenue, property expenses, carry-forward adjustments and agreed commercial terms. Eligible owners can review the payout or raise a query during the review period.",
  },
  {
    question: "Can I raise a question about my property or payout?",
    answer:
      "Yes. Owners can raise queries through the owner dashboard. The CurateMyStay team can review and resolve those queries through the admin system.",
  },
  {
    question: "How do I get started?",
    answer:
      "You can generate a property forecast, request a customised proposal, contact the CurateMyStay team through WhatsApp or book a call to discuss your property.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

const faqFont = Figtree({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-homepage",
});

export const metadata: Metadata = {
  title: {
    absolute: "Frequently Asked Questions | CurateMyStay",
  },
  description:
    "Find answers about CurateMyStay's Goa property management services, revenue forecasts, owner reporting, property operations and onboarding process.",
  alternates: {
    canonical: faqCanonicalUrl,
  },
  openGraph: {
    title: "CurateMyStay Frequently Asked Questions",
    description:
      "Answers to common questions about CurateMyStay's property management services for Goa property owners.",
    images: [ogImage],
    siteName,
    type: "website",
    url: faqCanonicalUrl,
  },
};

export default function FaqPage() {
  return (
    <div className={`${faqFont.variable} cms-homepage`}>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
        type="application/ld+json"
      />
      <FaqPublicPage faqs={faqItems} />
    </div>
  );
}
