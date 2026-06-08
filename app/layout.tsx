import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { QuickAddSheet } from "@/components/QuickAddSheet";
import { Toaster } from "sonner";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "PaisaTrack - Personal Expense Manager",
  description: "Track your expenses and manage your balance efficiently.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col md:flex-row bg-[#0C0C0C]">
        <Sidebar />
        <main className="flex-1 min-w-0 pb-20 md:pb-0 overflow-y-auto">
          {children}
        </main>
        <BottomNav />
        <QuickAddSheet />
        <Toaster />
      </body>
    </html>
  );
}
