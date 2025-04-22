"use client";

import { Sidebar } from "@/components/Sidebar";
import { ReactNode } from "react";
import { Header } from "./_components/Header";


interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <Sidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <Header />
        <main className="mx-auto p-4 flex-grow w-full">
          {children}
        </main>
        <footer className="bg-white dark:bg-gray-800 border-t py-4 w-full mt-auto">
          <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
            &copy; 2025 PaMi
          </div>
        </footer>
      </div>
    </>
  );
}
