import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "KisanAI - Autonomous Farm Operating System",
  description: "AI-powered precision agriculture, real-time weather & pest alerts, crop disease pathology, and autonomous farm optimization.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#15803d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} font-sans min-h-full flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors`}>
        {children}
      </body>
    </html>
  );
}
