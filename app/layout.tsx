import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aimlo.gg"),
  title: "AIMLO — AI-Powered Valorant Coach",
  description:
    "Get personalized post-round analysis and AI coaching feedback for Valorant. Improve your gameplay with round-by-round insights.",
  openGraph: {
    title: "AIMLO — AI-Powered Valorant Coach",
    description:
      "Personalized post-round analysis and AI coaching feedback for Valorant.",
    url: "https://aimlo.gg",
    siteName: "AIMLO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AIMLO — AI-Powered Valorant Coach",
    description:
      "Personalized post-round analysis and AI coaching feedback for Valorant.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
