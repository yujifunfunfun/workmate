"use client";

import { Sidebar } from "@/components/Sidebar";
import { Bot, LogOut } from "lucide-react";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { removeAuthToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";


interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();

  const handleLogout = () => {
    // ログアウト処理
    removeAuthToken();
    // ログインページにリダイレクト
    router.push("/login");
  };

  return (
    <>
      <Sidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <header className="bg-white dark:bg-gray-800 shadow py-4">
          <div className="flex justify-end items-center px-4 gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>ログアウト</span>
            </Button>
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
    </>
  );
}
