"use client";

import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { removeAuthToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { Skeleton } from "@/components/ui/skeleton";


export function Header() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const handleLogout = () => {
    removeAuthToken();
    router.push("/login");
  };
  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }
  return (
    <header className="bg-white shadow py-4 sticky top-0 z-9">
      <div className="flex justify-end items-center px-4 gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>ログアウト</span>
        </Button>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Skeleton className="h-6 w-32" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <span className="font-medium">
                {user.last_name} {user.first_name}
              </span>
            </div>
          ) : null}
        </div>

      </div>
    </header>
  );
}
