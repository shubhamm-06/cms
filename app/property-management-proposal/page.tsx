import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { buildMarketingMetadata } from "@/app/seo";
import { PropertyManagementProposal } from "@/components/home/reference-home";

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
  ...buildMarketingMetadata({
    title: "Airbnb Income Calculator for Goa Properties | Curate My Stay",
    description:
      "What could your Goa apartment or villa earn on Airbnb? Free season-adjusted revenue forecast plus a custom pitch deck in two minutes. No commitment.",
    canonicalPath: "/property-management-proposal",
  }),
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
