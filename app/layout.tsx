import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
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
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col md:flex-row bg-white text-black">
        <Sidebar />
        <main className="flex-1 min-w-0 pb-20 md:pb-0 overflow-y-auto">
          {children}
        </main>
        <Toaster
          toastOptions={{
            classNames: {
              toast:
                "bg-black text-white border-l-4 border-[#FF3000] rounded-none shadow-none",
              title: "text-white font-bold uppercase tracking-wide text-xs",
              description: "text-white/80 text-xs",
              success: "bg-black text-white border-l-4 border-[#FF3000]",
              error: "bg-black text-white border-l-4 border-[#FF3000]",
              warning: "bg-black text-white border-l-4 border-[#FF3000]",
            },
          }}
        />
      </body>
    </html>
  );
}
