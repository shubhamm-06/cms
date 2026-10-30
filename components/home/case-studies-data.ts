export type CaseStudyMetric = {
  emphasis?: "coral" | "dark";
  label: string;
  value: string;
};

export type RevenueProgressionPoint = {
  month: string;
  value: number;
};

export type CaseStudyReview = {
  date: string;
  excerpt: string;
  name: string;
};

export type PropertyCaseStudy = {
  airbnbUrl: string;
  managedSince: string;
  metrics: CaseStudyMetric[];
  narrative: string;
  photos: string[];
  propertyLabel: string;
  revenueProgression: RevenueProgressionPoint[];
  reviews: CaseStudyReview[];
  slug: "panjim" | "varca";
  testimonial: string;
  title: string;
};

export const portfolioProof = [
  { label: "Airbnb rating across all listings", value: "4.9+ / 5" },
  { label: "Five-star guest reviews", value: "230+" },
  { label: "Successful stays delivered", value: "300+" },
  { label: "15+ months running", value: "Superhost" },
] as const;

export const propertyCaseStudies: PropertyCaseStudy[] = [
  {
    slug: "panjim",
    managedSince: "Managed since November 2025",
    title: "Designed for Short-Term Rentals from Day One",
    propertyLabel: "Modern 2 BHK Apartment in Panjim",
    narrative:
      "Rather than adapting a residential apartment for short-term rentals, this property was designed from day one with guests in mind. From workstation-friendly interiors and fully air-conditioned spaces to a furnished balcony, modern kitchen, pool access and a central Panjim location, every element was optimised to maximise guest appeal and occupancy throughout the year.",
    photos: ["panjim-1.jpg", "panjim-2.jpg", "panjim-3.jpg", "panjim-4.jpg"],
    metrics: [
      { label: "Average occupancy", value: "77%", emphasis: "coral" },
      { label: "Location average occupancy", value: "28.7%" },
      { label: "Guest rating", value: "5 stars", emphasis: "dark" },
      { label: "Expense ratio", value: "9.9%" },
    ],
    revenueProgression: [
      { month: "Nov '25", value: 1 },
      { month: "Dec '25", value: 1.73 },
      { month: "Jan '26", value: 1.38 },
      { month: "Feb '26", value: 1.18 },
      { month: "Mar '26", value: 1.16 },
    ],
    testimonial:
      "Aravind has been managing several of our rental properties and has been a dependable partner throughout. He is professional, responsive, and has great attention to detail. He strives hard to ensure both a great guest experience and adequate property care, making day-to-day hosting much easier.",
    reviews: [
      {
        name: "Nirupama",
        date: "December 2025",
        excerpt:
          "The apartment has been maintained very well, is ultra-clean and is perfect for up to four guests. Aravind was extremely responsive, and the location was convenient for exploring Panjim.",
      },
      {
        name: "Nabendu",
        date: "December 2025",
        excerpt:
          "The property is well located near Miramar Beach and was clean and exactly as shown. Aravind was extremely helpful, responsive, friendly and approachable.",
      },
      {
        name: "Sucheth",
        date: "March 2026",
        excerpt:
          "An extremely high-value stay in the heart of Panjim, with a proactive and helpful host, clean interiors and all amenities exactly as listed.",
      },
    ],
    airbnbUrl:
      "https://www.airbnb.co.in/h/2bhk-panjim-apartment-with-pool-800m-to-beach",
  },
  {
    slug: "varca",
    managedSince: "Managed since September 2025",
    title: "From Underperforming Asset to Proven Performer",
    propertyLabel: "Private 3 BHK Villa in Varca, South Goa",
    narrative:
      "When CurateMyStay took over this 3 BHK villa in Varca, the property was not operationally ready for the short-term rental market. We invested in setup, operational improvements and guest readiness during the first month. That investment was recovered the following month, with revenue more than doubling shortly afterwards and transforming the villa into a high-performing holiday home just 700 metres from the beach.",
    photos: ["varca-1.jpg", "varca-2.jpg", "varca-3.jpg"],
    metrics: [
      { label: "Average occupancy", value: "65.4%", emphasis: "coral" },
      { label: "Location average occupancy", value: "31.2%" },
      { label: "Guest rating", value: "4.95", emphasis: "dark" },
      { label: "Expense ratio", value: "15.5%" },
    ],
    revenueProgression: [
      { month: "Oct '25", value: 1 },
      { month: "Nov '25", value: 1.36 },
      { month: "Dec '25", value: 2.11 },
      { month: "Jan '26", value: 1.81 },
      { month: "Feb '26", value: 1.29 },
      { month: "Mar '26", value: 1.37 },
    ],
    testimonial:
      "Aravind has been an outstanding host. He is extremely honest, responsible, disciplined and punctual in managing the Airbnb. The house is always kept clean, guests are well cared for, and he handles everything with great sincerity. Highly appreciated and fully trusted.",
    reviews: [
      {
        name: "Harshavardhan",
        date: "April 2026",
        excerpt:
          "The villa was exactly as shown in the images, with well-maintained amenities. The hosts responded quickly whenever support was needed, and the property was quiet, comfortable and close to the beach.",
      },
      {
        name: "Abhirup",
        date: "October 2025",
        excerpt:
          "The villa was spacious enough for our full group, with a relaxing community pool and the beach within walking distance. Aravind was attentive, proactive and quick to solve issues.",
      },
      {
        name: "Alan",
        date: "October 2025",
        excerpt:
          "The accommodation was clean, well maintained and equipped with everything needed for a comfortable stay. Aravind was responsive, sincere and proactive throughout.",
      },
    ],
    airbnbUrl:
      "https://www.airbnb.co.in/h/3bhk-private-villa-in-south-goa-with-pool-and-close-to-the-beach",
  },
];
