import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { cn } from "../lib/utils/ui.utils";
import { ApplicationStateProvider } from "../providers/state.provider";

import { ThemeProvider } from "../providers/theme.provider";
import { Header } from "@/components/layout/header";
import NextAuthSessionProvider from "../providers/session.provider";
import { Toaster } from "../components/ui/toaster";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wanderly - Travel Companion",
  description: "Wanderly - Travel Companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          inter.className,
          "h-screen overflow-y-auto overflow-x-hidden"
        )}
      >
        <NextAuthSessionProvider>
          <ApplicationStateProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <Header />
              <Toaster />
              {children}
              <Analytics />
            </ThemeProvider>
          </ApplicationStateProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
