import type { Metadata } from "next";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  title: "WAWAW News | Sheffield Wednesday News & Match Coverage",
  description:
    "Latest Sheffield Wednesday news, match previews, match reports, videos and fan opinion from WAWAW News.",
};

export default function Page() {
  return <HomePageClient />;
}