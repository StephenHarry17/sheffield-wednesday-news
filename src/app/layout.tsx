import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://wawaw.news"),
  title: {
    default: "WAWAW News | Sheffield Wednesday News, Match Previews & Reports",
    template: "%s | WAWAW News",
  },
  description:
    "Latest Sheffield Wednesday news, match previews, match reports, transfers, opinion and fan-focused coverage from WAWAW News.",
  openGraph: {
    siteName: "WAWAW News",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}