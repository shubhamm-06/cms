import { Figtree } from "next/font/google";
import { ReferenceHome } from "@/components/home/reference-home";

const homepageFont = Figtree({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-homepage",
});

export default function Home() {
  return (
    <div className={`${homepageFont.variable} cms-homepage`}>
      <ReferenceHome />
    </div>
  );
}
