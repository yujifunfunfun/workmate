import { ReactNode } from "react";
import { Bot } from "lucide-react";


interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white dark:bg-gray-800 shadow py-4">
        <div className="flex justify-between px-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">PaMiAI</h2>
          <Bot className="w-7 h-7" />
        </div>
      </header>
      <main className="mx-auto flex-grow w-full">
        {children}
      </main>
      <footer className="bg-white dark:bg-gray-800 border-t py-4 w-full mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; 2025 PaMiAI
        </div>
      </footer>
    </div>
  );
}
