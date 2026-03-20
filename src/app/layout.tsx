import type { Metadata } from "next";
import "./globals.css";
import { startFixtureCron, startArticlesCron, startVideosCron } from "@/lib/cron";

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
      <body className="antialiased">{children}</body>
    </html>
  );
}