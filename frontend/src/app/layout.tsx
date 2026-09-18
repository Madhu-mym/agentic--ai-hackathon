import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Future-Ready Onboarding",
  description: "AI-powered employee onboarding platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
