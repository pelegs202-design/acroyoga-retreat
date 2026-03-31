import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  subsets: ["latin", "hebrew"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
  variable: "--font-heebo",
  preload: true,
});

export const metadata: Metadata = {
  title: "AcroYoga Academy",
  description: "Find acro partners and events near you",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${heebo.variable} antialiased`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
