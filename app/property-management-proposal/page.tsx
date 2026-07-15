import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { ogImage, siteName } from "@/app/seo";
import { PropertyManagementProposal } from "@/components/home/reference-home";

const proposalCanonicalUrl =
  "https://curatemystay.net/property-management-proposal";

const proposalFaqs = [
  {
    question: "Is the property management proposal free?",
    answer:
      "Yes. You can submit your property details and generate an initial forecast and customised pitch deck without any charge.",
  },
  {
    question: "How is the rental revenue forecast calculated?",
    answer:
      "The forecast uses the property type, configuration, location, size, amenities and other details submitted through the form. It provides an estimate and is not a guaranteed return.",
  },
  {
    question: "Does the proposal include CurateMyStay’s management fees?",
    answer:
      "No fixed commercial terms are shown in the public proposal. Management terms are discussed separately after understanding the property and the owner’s requirements.",
  },
  {
    question: "Can NRI property owners request a proposal?",
    answer:
      "Yes. Property owners living outside Goa or outside India can generate a proposal and connect with the CurateMyStay team remotely.",
  },
  {
    question: "What types of properties can use the proposal form?",
    answer:
      "The forecast currently supports eligible apartments and villas across the configurations and Goa locations available in the form.",
  },
  {
    question: "What happens after the pitch deck is generated?",
    answer:
      "You can review and download the customised pitch deck, then contact the CurateMyStay team through WhatsApp or book a call to discuss the next steps.",
  },
  {
    question: "Is the forecast a guaranteed rental return?",
    answer:
      "No. The forecast is an estimate based on the submitted property details and the assumptions used by the calculator. Actual performance may vary.",
  },
];

const proposalFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: proposalFaqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

const proposalFont = Figtree({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-homepage",
});

export const metadata: Metadata = {
  title: {
    absolute: "Goa Property Management Proposal | CurateMyStay",
  },
  description:
    "Get a customised Goa property management proposal with an estimated rental revenue forecast, operating costs, net profit and property setup recommendations.",
  keywords: ["Goa property management proposal"],
  alternates: {
    canonical: proposalCanonicalUrl,
  },
  openGraph: {
    title: "Get a Custom Goa Property Management Proposal",
    description:
      "Discover the estimated rental potential of your Goa property and receive a customised property management proposal from CurateMyStay.",
    images: [ogImage],
    siteName,
    type: "website",
    url: proposalCanonicalUrl,
  },
};

export default function PropertyManagementProposalPage() {
  return (
    <div className={`${proposalFont.variable} cms-homepage`}>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(proposalFaqJsonLd).replace(/</g, "\\u003c"),
        }}
        type="application/ld+json"
      />
      <PropertyManagementProposal faqs={proposalFaqs} />
    </div>
  );
}
