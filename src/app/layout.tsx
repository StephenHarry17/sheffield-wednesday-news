import type { Metadata } from "next";
import "./globals.css";
import { startFixtureCron, startArticlesCron } from '@/lib/cron';

export const metadata: Metadata = {
  title: "Sheffield Wednesday News",
  description: "Your home for the latest Sheffield Wednesday Owls updates",
};

// Initialize cron jobs on server startup
if (typeof window === 'undefined') {
  try {
    if (process.env.DATABASE_URL) {
      startFixtureCron();
      startArticlesCron();
    } else {
      console.warn('[layout] Skipping cron job initialization: DATABASE_URL is not set');
    }
  } catch (error) {
    console.error('[layout] Failed to start cron jobs:', error);
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