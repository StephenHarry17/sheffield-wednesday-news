import type { Metadata } from "next";
import "./globals.css";
import { startFixtureCron, startArticlesCron, startVideosCron } from "@/lib/cron";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Sheffield Wednesday News",
  description: "Your home for the latest Sheffield Wednesday Owls updates",
};

// Prevent cron jobs from being registered multiple times (dev HMR / multi-process)
declare global {
  // eslint-disable-next-line no-var
  var __cron_started__: boolean | undefined;
}

// Initialize cron jobs on server startup
if (typeof window === "undefined") {
  if (!global.__cron_started__) {
    global.__cron_started__ = true;
    startFixtureCron();
    startArticlesCron();
    startVideosCron();
  }
}

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