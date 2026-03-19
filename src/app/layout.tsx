import type { Metadata } from "next";
import "./globals.css";
import { startFixtureCron, startArticlesCron } from '@/lib/cron';

export const metadata: Metadata = {
  title: "Sheffield Wednesday News",
  description: "Your home for the latest Sheffield Wednesday Owls updates",
};

// Initialize cron jobs on server startup
if (typeof window === 'undefined') {
  startFixtureCron();
  startArticlesCron();
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