import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";
import { MotionConfig } from "motion/react";
import "../src/index.css";

import { AuthInit } from "../src/components/auth/AuthInit";
import { TooltipProvider } from "../src/components/ui/tooltip";

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
    <html
      lang="en"
      className={`${inter.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { const theme = localStorage.getItem('cronwatch-theme') || 'dark'; document.documentElement.dataset.theme = theme; document.documentElement.style.colorScheme = theme; } catch (e) {} })();`,
          }}
        />
      </head>
      <body className={`${inter.className} font-sans`}>
        <MotionConfig reducedMotion="user">
          <TooltipProvider delayDuration={200}>
            <AuthInit>
              <Toaster position="top-right" />
              {children}
              <Analytics />
            </AuthInit>
          </TooltipProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
