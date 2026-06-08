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
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0C0C0C" },
    { media: "(prefers-color-scheme: light)", color: "#0C0C0C" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: "PaisaTrack",
    template: "%s | PaisaTrack",
  },
  description:
    "Track your daily expenses, manage your balance, set budgets, and stay on top of recurring payments.",
  applicationName: "PaisaTrack",
  authors: [{ name: "PaisaTrack" }],
  keywords: ["expense tracker", "budget", "finance", "personal finance", "spending tracker"],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PaisaTrack",
    startupImage: ["/apple-touch-icon.png"],
  },
  openGraph: {
    type: "website",
    siteName: "PaisaTrack",
    title: "PaisaTrack - Personal Expense Manager",
    description: "Track expenses, manage balance, and stay on budget.",
  },
  twitter: {
    card: "summary",
    title: "PaisaTrack",
    description: "Track expenses, manage balance, and stay on budget.",
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/icon-192x192.png",
  },
  formatDetection: {
    telephone: false,
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
