import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AcroHavura",
  description: "Find acro partners and events near you",
};

// Root layout: minimal wrapper only.
// lang, dir, and font are set in app/[locale]/layout.tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
