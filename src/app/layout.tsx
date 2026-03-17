import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sheffield Wednesday News",
  description: "Your home for the latest Sheffield Wednesday Owls updates",
};

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
