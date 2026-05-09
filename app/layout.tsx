import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";
import "../src/index.css";

import { AuthInit } from "../src/components/auth/AuthInit";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Cronwatch",
  description: "Monitor your cron jobs and background tasks.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className={`${inter.className} font-sans`}>
        <AuthInit>
          <Toaster position="top-right" />
          {children}
          <Analytics />
        </AuthInit>
      </body>
    </html>
  );
}
