import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import Providers from "./providers";
import { Bot } from "lucide-react";


const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "WorkMate",
  description: "あなたの仕事をサポートするAIエージェントです",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar />
            <div className="ml-64 flex flex-col min-h-screen">
              <header className="bg-white dark:bg-gray-800 shadow py-4">
                <div className="flex justify-end px-4">
                  <Bot className="w-7 h-7" />
                </div>
              </header>
              <main className="mx-auto p-4 flex-grow w-full">
                {children}
              </main>
              <footer className="bg-white dark:bg-gray-800 border-t py-4 w-full mt-auto">
                <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  &copy; 2025 WorkMate
                </div>
              </footer>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
