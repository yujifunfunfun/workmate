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
      <div className="ml-18 flex flex-col">
        <Header />
        <main className="p-4">
          {children}
        </main>
      </div>
    </>
  );
}
