export type PropertySeo = {
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  quickFacts: { label: string; value: string }[];
  altBase: string;
  related?: { slug: string; text: string };
  schema: {
    type: "House" | "Apartment";
    locality: string;
    region: string;
    guests: number;
    bedrooms: number;
    bathrooms: number;
    petsAllowed: boolean;
    amenities: string[];
    registrationId?: string;
  };
};

export const propertySeo: Record<string, PropertySeo> = {
  "3bhk-villa-varca-pool-south-goa": {
    title: "3 BHK Villa in Varca, South Goa with Pool | CurateMyStay",
    metaDescription: "3BHK villa in a gated Varca community, a 5-minute walk to Varca Beach. Shared pool, 3 AC bedrooms with balconies, pet-friendly. Book direct for a better rate.",
    h1: "3BHK Villa near Varca Beach, South Goa",
    intro: "This 3BHK villa sits inside a gated community in Varca, South Goa, about a 5-minute walk (700 m) from Varca Beach. It sleeps up to 8 guests across three air-conditioned bedrooms, with balconies (the master bedroom has two, one with an attached open sitout). You get a dining hall, a fully equipped kitchen, fast Wi-Fi and study tables on the top floor, so it suits a family holiday as well as a group that needs to work for a few hours a day. The community pool is shared and open from 9 AM to 6 PM. Pets are welcome, parking is free, and the villa has inverter power backup. Stays longer than two nights include cleaning every other day, and our local team is on call through your stay. Madgaon Railway Station is under 9 km away and Dabolim Airport is 32 km.",
    quickFacts: [
      { label: "Guests", value: "Up to 8" },
      { label: "Layout", value: "3 AC bedrooms, 3.5 bathrooms" },
      { label: "Pool", value: "Shared community pool, 9 AM to 6 PM" },
      { label: "Beach", value: "Varca Beach, 700 m (about 5 min walk)" },
      { label: "Train", value: "Madgaon Railway Station, under 9 km" },
      { label: "Airport", value: "Dabolim (GOI), 32 km" },
      { label: "Pets", value: "Allowed" },
      { label: "Check-in / out", value: "2:00 PM / 11:00 AM" },
    ],
    altBase: "3 BHK villa in Varca, South Goa",
    schema: {
      type: "House",
      locality: "Varca",
      region: "South Goa",
      guests: 8,
      bedrooms: 3,
      bathrooms: 3.5,
      petsAllowed: true,
      amenities: ["Shared pool", "Wi-Fi", "Air conditioning", "Kitchen", "Free parking", "Workspace", "Washing machine", "Power backup", "TV"],
      // TODO: Add the Varca registration ID once it is confirmed.
    },
  },
  "3bhk-villa-majorda-shared-pool": {
    title: "3 BHK Villa near Majorda Beach, South Goa | CurateMyStay",
    metaDescription: "3 BHK villa stay near Majorda Beach, South Goa. Gated community, shared pool, 3 AC bedrooms, sleeps 8, pet-friendly, 19 km from Dabolim. Book direct.",
    h1: "Pet-Friendly 3BHK Villa near Majorda Beach, South Goa",
    intro: "A private three-bedroom villa inside the gated Saudades Homestay community in Majorda, South Goa, about 2 km from Majorda Beach, with the shared pool just outside the villa. All three bedrooms are air-conditioned and the villa sleeps up to 8. If you are comparing hotels and resorts at Majorda Beach for a family or a group, one villa with a kitchen, three bedrooms and a pool is often simpler than booking several rooms. The pool is open from 7:30 AM to 7:30 PM. Cook in the fully equipped kitchen (stove, fridge, microwave, water purifier) or order in, since food delivery is available. A study table on the top floor and high-speed Wi-Fi make it workable for remote days, and inverter backup covers power cuts. Two vehicles can park inside the community, security is on duty around the clock, and pets are welcome. Dabolim Airport is 19 km away, which makes this an easy first or last night in Goa, and Madgaon Station is about 10 km.",
    quickFacts: [
      { label: "Guests", value: "Up to 8" },
      { label: "Layout", value: "3 AC bedrooms, 3 bathrooms" },
      { label: "Pool", value: "Shared pool outside the villa, 7:30 AM to 7:30 PM" },
      { label: "Beach", value: "Majorda Beach, about 2 km" },
      { label: "Airport", value: "Dabolim (GOI), 19 km" },
      { label: "Train", value: "Madgaon Station, about 10 km" },
      { label: "Parking", value: "2 vehicles" },
      { label: "Pets", value: "Allowed" },
      { label: "Registration", value: "HOTS001949" },
      { label: "Check-in / out", value: "2:00 PM / 11:00 AM" },
    ],
    altBase: "3 BHK villa near Majorda Beach, South Goa",
    schema: {
      type: "House",
      locality: "Majorda",
      region: "South Goa",
      guests: 8,
      bedrooms: 3,
      bathrooms: 3,
      petsAllowed: true,
      amenities: ["Shared pool", "Wi-Fi", "Air conditioning", "Kitchen", "Parking", "Workspace", "Smart TV", "Microwave", "Power backup"],
      registrationId: "HOTS001949",
    },
  },
  "2bhk-modern-suite-panjim": {
    title: "2 BHK Apartment in Panjim near Miramar Beach | CurateMyStay",
    metaDescription: "Furnished 2BHK with a private balcony and shared pool, a 10-minute walk to Miramar Beach. Lift, reserved parking, EV charging. Book direct with CurateMyStay.",
    h1: "2BHK Apartment near Miramar Beach, Panjim",
    intro: "Walk to Miramar Beach in about 10 minutes from this furnished 2BHK at Risara Southern Creek Residences in Panjim. The apartment sleeps 4, with two air-conditioned bedrooms, two bathrooms, a private balcony and a roomy living area with a Smart TV. The building has a lift and wheelchair-friendly access, plus reserved parking and EV charging if you are driving. The shared pool is open from 7 AM to 7 PM. Inside, the kitchen has a stove, fridge and water purifier, and a washing machine sits in the adjoining washing area. Security is on 24 hours with exterior CCTV, and check-in is contactless. Dabolim Airport is about 29 km away and Manohar International Airport (Mopa) about 37 km. Travelling with a bigger group? Another 2BHK in the same building can be booked together with this one, subject to availability, giving you four bedrooms for up to 8 guests.",
    quickFacts: [
      { label: "Guests", value: "Up to 4" },
      { label: "Layout", value: "2 AC bedrooms, 2 bathrooms, private balcony" },
      { label: "Beach", value: "Miramar Beach, 800 m (about 10 min walk)" },
      { label: "Pool", value: "Shared pool, 7 AM to 7 PM" },
      { label: "Access", value: "Lift, wheelchair-friendly" },
      { label: "Parking", value: "Reserved, with EV charging" },
      { label: "Airports", value: "Dabolim 29 km, Mopa 37 km" },
      { label: "Registration", value: "HOTN008253" },
      { label: "Check-in / out", value: "2:00 PM (contactless) / 11:00 AM" },
    ],
    altBase: "2 BHK apartment near Miramar Beach, Panjim",
    related: {
      slug: "2bhk-suite-panjim",
      text: "Booking for a larger group? See the 2BHK in the same building that can be booked together with this one.",
    },
    schema: {
      type: "Apartment",
      locality: "Panjim",
      region: "North Goa",
      guests: 4,
      bedrooms: 2,
      bathrooms: 2,
      petsAllowed: false,
      amenities: ["Shared pool", "Wi-Fi", "Air conditioning", "Kitchen", "Parking", "EV charging", "Elevator", "Wheelchair accessible", "Balcony", "Washing machine", "Smart TV"],
      registrationId: "HOTN008253",
    },
  },
  "2bhk-suite-panjim": {
    title: "2 BHK Apartment in Panjim for Long Stays | CurateMyStay",
    metaDescription: "Work-ready 2BHK in Panjim with high-speed Wi-Fi, a workspace, balcony and shared pool. Washing machine, contactless check-in, long-stay cleaning. Book direct.",
    h1: "2BHK Workation Apartment in Panjim, Goa",
    intro: "Planning to spend a few weeks in Goa and still get work done? This 2BHK at Risara Southern Creek Residences in Panjim is set up for it. There is high-speed Wi-Fi, a dedicated workspace, and two air-conditioned bedrooms with two bathrooms, so two people can work without sharing a room. Daily life is easy here: a washing machine in the washing area, a kitchen with stove, fridge and water purifier, food and grocery deliveries to the building, and alternate-day cleaning on longer stays. Take a break on the private balcony or in the shared pool (7 AM to 7 PM), or walk about 10 minutes to Miramar Beach in the evening. The gated building has 24-hour security, a lift and reserved parking, and check-in is contactless, which helps if you arrive late. Sleeps up to 4, and another 2BHK in the same building can be booked alongside it for teams or families of up to 8, subject to availability.",
    quickFacts: [
      { label: "Best for", value: "Remote work and longer stays" },
      { label: "Work setup", value: "High-speed Wi-Fi, dedicated workspace" },
      { label: "Layout", value: "2 AC bedrooms, 2 bathrooms, private balcony" },
      { label: "Laundry", value: "Washing machine" },
      { label: "Cleaning", value: "Alternate days on long stays" },
      { label: "Pool", value: "Shared pool, 7 AM to 7 PM" },
      { label: "Beach", value: "Miramar Beach, 800 m" },
      { label: "Registration", value: "HOT25NI1539" },
      { label: "Check-in / out", value: "2:00 PM (contactless) / 11:00 AM" },
    ],
    altBase: "Workation 2 BHK apartment in Panjim, Goa",
    related: {
      slug: "2bhk-modern-suite-panjim",
      text: "Travelling with a team or family? See the 2BHK in the same building that can be booked together with this one.",
    },
    schema: {
      type: "Apartment",
      locality: "Panjim",
      region: "North Goa",
      guests: 4,
      bedrooms: 2,
      bathrooms: 2,
      petsAllowed: false,
      amenities: ["Shared pool", "Wi-Fi", "Workspace", "Air conditioning", "Kitchen", "Washing machine", "Parking", "Elevator", "Balcony", "Smart TV"],
      registrationId: "HOT25NI1539",
    },
  },
};

export function getPropertySeo(slug: string | null | undefined): PropertySeo | undefined {
  return slug && Object.hasOwn(propertySeo, slug) ? propertySeo[slug] : undefined;
}
