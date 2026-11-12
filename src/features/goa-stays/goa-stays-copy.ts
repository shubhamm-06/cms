export const goaStaysCopy = {
  metadata: {
    title: "Goa Villa Rental & Booking | Book Direct | Curate My Stay",
    description:
      "Villas and holiday homes in Goa, managed by our local team. Compare stays, then book direct on WhatsApp and pay by UPI.",
  },
  hero: {
    heading: "Goa Villa Rental and Holiday Homes, Booked Directly",
    intro:
      "Villas, apartments and studios in South Goa and Panjim, looked after by our own team. Send your dates on WhatsApp and we confirm the direct rate before you pay.",
    primaryCta: "Chat on WhatsApp",
    secondaryCta: "See villas",
    trustLine: "Direct rate. Pay by UPI. Confirmed on WhatsApp.",
  },
  picker: {
    heading: "Find your stay",
  },
  howItWorks: {
    heading: "How direct booking works",
    steps: [
      { title: "Choose your stay", line: "Pick a stay and your dates on its page." },
      { title: "Send your dates", line: "Tap Ask about this stay. Your dates and guest count are filled into WhatsApp." },
      { title: "Get the direct rate", line: "We reply with availability and the direct rate." },
      { title: "Pay by UPI", line: "We confirm your booking on WhatsApp. Nothing is booked or charged until we confirm." },
    ],
  },
  compare: {
    heading: "Book direct, with a hotel or on Airbnb?",
    intro: "How booking with us compares.",
    caption: "Comparison of a hotel, Airbnb and booking with us",
    columns: ["Hotel", "Airbnb", "Booking with us"],
    rows: [
      { label: "Who you talk to", cells: ["Front desk", "Host through the app", "Our team on WhatsApp, before, during and after your stay"] },
      { label: "Price", cells: ["Per room", "Includes the platform fee", "Direct rate, typically 10 to 15% lower than Airbnb"] },
      { label: "Space for a group", cells: ["Separate rooms", "Varies by listing", "Whole villas for up to 8 guests"] },
      { label: "Payment", cells: ["At the hotel or online", "Through the platform", "UPI, confirmed on WhatsApp"] },
      { label: "Extras", cells: ["Hotel services", "Varies by host", "Chef, airport pickup, scooter rental and day trips"] },
    ],
    note: "Direct rates are quoted per stay and confirmed on WhatsApp before you pay.",
  },
  villaOrHotel: {
    heading: "Villa or hotel for your group?",
    cards: [
      {
        title: "For groups and families",
        line: "A villa keeps everyone under one roof, with shared living space and one rate for the whole stay.",
      },
      {
        title: "For two or a small family",
        line: "Our studios and apartments give you a private place close to the beach or the city.",
      },
    ],
  },
  areas: {
    heading: "Choosing an area",
    intro: "Where our stays are, and what each area is like.",
    stayCount: { one: "stay", other: "stays" },
    /** Add an area key here once public/areas/<key>.jpg exists. */
    areaPhotoKeys: [] as string[],
    /** Keyed by lowercase area name. */
    entries: {
      varca: {
        tagline: "White sand and the gateway to deep South Goa",
        paragraph: "Our Varca villa is a short walk from one of South Goa's cleanest and least crowded beaches, lined with fishing boats and palm groves. Cavelossim and Mobor are just down the coast for river cruises and dolphin trips, with Cabo de Rama, Agonda and Palolem further south.",
        facts: [
          { label: "Beach", text: "About 700 m from the villa, quiet and family-friendly" },
          { label: "Down the coast", text: "Cavelossim and Mobor for backwater cruises and dolphin trips, Benaulim and Colva to the north" },
          { label: "Day trips", text: "Cabo de Rama, Agonda and Palolem, about an hour's drive" },
          { label: "Getting here", text: "Madgaon station 9 km" },
        ],
      },
      majorda: {
        tagline: "One of Goa's longest unbroken beach stretches",
        paragraph: "Our Majorda villa sits on a long, open stretch of sand that runs south for over 20 km, through Betalbatim, Colva and Benaulim to Varca and Cavelossim. You can walk for an hour without a crowd and pick a different beach every evening. Some of South Goa's best-loved restaurants are close by.",
        facts: [
          { label: "Beaches", text: "Majorda 2 km, Betalbatim (known for its sunsets) 2.6 km, Colva 4.7 km" },
          { label: "Food", text: "Some of South Goa's best restaurants nearby" },
          { label: "Getting here", text: "Dabolim Airport 19 km, Madgaon station 10 km" },
        ],
      },
      panjim: {
        tagline: "The capital, on foot",
        paragraph: "Our Panjim apartments are in the heart of Goa's capital, a 10-minute walk from Miramar Beach. The Portuguese lanes of Fontainhas, the white Immaculate Conception Church and the floating casinos on the Mandovi are all within 3 km. Old Goa, a UNESCO World Heritage site with the Basilica of Bom Jesus and Se Cathedral, is 11 km away.",
        facts: [
          { label: "Events", text: "International Film Festival of India (November), Serendipity Arts Festival (December), the Feast of St Francis Xavier in Old Goa (3 December), Christmas and New Year, Carnival and Shigmo (February to March). Dates vary each year." },
          { label: "Heritage", text: "Fontainhas, the Immaculate Conception Church, the Old Secretariat, Reis Magos Fort, Dona Paula" },
          { label: "Convenience", text: "A walkable city with malls, hospitals, cafes and delivery apps, busy all year" },
        ],
      },
      bogmalo: {
        title: "Dabolim and Bogmalo",
        tagline: "The best-connected base in Goa",
        paragraph: "Stay near Dabolim Airport and reach your room in about 10 minutes. Our studios are 3.7 km from the airport on a quiet hilltop, close to the Bogmalo and Hollant beaches. BITS Pilani Goa and the Birla Mandir are minutes away, and the port, shipyard and Verna industrial estate bring steady business travel. North and South Goa are both within easy reach.",
        facts: [
          { label: "Getting around", text: "Dabolim Airport 3.7 km, Vasco station 8.6 km, and the Zuari bridge to Panjim and North Goa" },
          { label: "Nearby", text: "BITS Pilani Goa campus, Birla Mandir, the Naval Aviation Museum" },
          { label: "Beaches", text: "Bogmalo 3.3 km and Hollant 3.9 km, two of Goa's quieter beaches" },
          { label: "Ideal for", text: "First and last nights, BITS parents and visitors, business trips, families travelling through" },
        ],
      },
    } as Record<string, { title?: string; tagline: string; paragraph: string; facts: { label: string; text: string }[] }>,
  },
  faq: {
    heading: "Frequently asked questions",
    eyebrow: "FAQ",
    lead: "Quick answers about booking a stay with us in Goa.",
    items: [
      { question: "How do I book a villa in Goa directly?", answer: "Open the stay you like, choose your dates and guests, and tap \"Ask about this stay\". It opens WhatsApp with your details filled in. We reply with availability and the direct rate, you pay by UPI, and we confirm your booking on WhatsApp." },
      { question: "Is booking direct cheaper than Airbnb?", answer: "Direct rates are typically 10 to 15% lower because you skip the platform fee. Send us your dates and we will quote the direct price so you can compare." },
      { question: "How do I pay?", answer: "You pay by UPI. Nothing is booked or charged until we confirm your dates and rate on WhatsApp." },
      { question: "Which villas do you have in Goa?", answer: "Our villas are listed on this page with photos, guest capacity and beach distance. Open any stay to see its full details, amenities and house rules." },
      { question: "Do the villas have a pool?", answer: "Several of our stays have a shared pool. The pool type is shown on each stay page." },
      { question: "Is a villa or a hotel better for a group?", answer: "A villa keeps your group together with shared living space and one rate for the whole stay, instead of paying for several separate rooms." },
      { question: "Which area of Goa should I choose?", answer: "Our stays are in the areas shown in the area guide on this page. Quieter beach areas suit families and groups, while the city suits guests who want cafes and restaurants close by." },
      { question: "Are pets allowed?", answer: "It depends on the stay. Each stay page lists whether pets are welcome." },
      { question: "What are the check-in and check-out times?", answer: "Check-in and check-out times are listed on each stay page." },
      { question: "Is breakfast included?", answer: "Some of our stays include breakfast. The stay page and its badge show which ones." },
      { question: "Can you arrange more than the room?", answer: "Yes. We can arrange an in-villa chef, airport pickup, scooter rental and day trips, and our team is on WhatsApp throughout your stay." },
      { question: "Are your stays also on Airbnb?", answer: "Some are. Where a stay has an Airbnb listing, its page links to the listing and guest reviews. Booking direct gets you the direct rate." },
    ],
  },
  closingCta: {
    heading: "Ready to book your Goa villa?",
    text: "Send us your dates and group size. We will confirm availability and the direct rate on WhatsApp before you pay.",
    button: "Chat on WhatsApp",
  },
  breadcrumbs: { home: "Home", page: "Goa villa stays" },
  /** Keyed by the section anchor id. `title` is both the picker card title and the group's H2. */
  groups: {
    villas: {
      title: "Villas in Goa",
      line: "Space for the whole group, with a shared pool at our villas.",
    },
    apartments: {
      title: "Apartments in Goa",
      line: "Comfortable city stays for small groups and families.",
    },
    studios: {
      title: "Studios in Goa",
      line: "Simple, well-kept stays for two.",
    },
    "more-stays": {
      title: "More stays",
      line: "Other stays in our collection.",
    },
  },
} as const;

export type GoaStayGroupId = keyof typeof goaStaysCopy.groups;
