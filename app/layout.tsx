import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import BottomNav from '@/components/BottomNav';
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0C0C0C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "PaisaTrack - Personal Expense Manager",
  description: "Track your expenses and manage your balance efficiently.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PaisaTrack",
  },
  icons: {
    apple: "/apple-icon.png",
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
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col md:flex-row bg-background text-foreground">
        <Sidebar />
        <main className="flex-1 min-w-0 pb-16 md:pb-0 overflow-y-auto">
          {children}
        </main>
        <Toaster />
        <BottomNav />
      </body>
    </html>
  );
}
