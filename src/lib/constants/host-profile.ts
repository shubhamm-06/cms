export type HostProfile = {
  name: string;
  photoUrl: string;
  isSuperhost: boolean;
  reviewCount: number;
  rating: number;
  yearsHosting: number;
  bio: string;
  coHosts: string[];
  /** Whole percentage, e.g. 100 for "100%". */
  responseRate: number;
  responseTime: string;
  airbnbProfileUrl: string;
};

/** Host shown in the "Meet your host" block on `/booking`. Edit here; nothing is read from Supabase. */
export const HOST_PROFILE: HostProfile = {
  name: "Aravind",
  photoUrl: "/images/host-aravind.png",
  isSuperhost: true,
  reviewCount: 229,
  rating: 4.97,
  yearsHosting: 1,
  bio: "Hey there, I love meeting new folks. My main work involves time behind a screen, so hospitality really helps me do something different. Looking forward to meeting you!",
  coHosts: ["Arul Peralath"],
  responseRate: 100,
  responseTime: "within the hour",
  // TODO: replace with the real Airbnb host profile URL, e.g. https://www.airbnb.co.in/users/show/<id>
  airbnbProfileUrl: "https://www.airbnb.co.in/",
};
