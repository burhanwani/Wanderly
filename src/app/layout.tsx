import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Card, CardHeader } from "../components/ui/card";
import { cn } from "../lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Concierge - Travel Companion",
  description: "Concierge - Travel Companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "bg-gray-100")}>
        <header className="bg-white shadow-sm lg:static lg:overflow-y-visible">
          <div className="py-4 px-4 sm:px-6 lg:px-8 flex">
            <div>Concierge</div>
            <div></div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
