"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bookmark, Users, Bot } from "lucide-react";

// サイドバーのアクティブなリンクのスタイル
const activeLinkStyle = "bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400";
const defaultLinkStyle = "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700";

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));

  return (
    <Link
      href={href}
      className={`flex items-center p-2 rounded-lg ${isActive ? activeLinkStyle : defaultLinkStyle}`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-md z-10 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">WorkMate</h2>
      </div>
      <nav className="p-2">
        <ul className="space-y-1">
          <li>
            <NavLink
              href="/"
              icon={<Home className="w-5 h-5 mr-2" />}
              label="ダッシュボード"
            />
          </li>
          <li>
            <NavLink
              href="/my-agent"
              icon={<Bot className="w-5 h-5 mr-2" />}
              label="マイエージェント"
            />
          </li>
          <li>
            <NavLink
              href="/members"
              icon={<Users className="w-5 h-5 mr-2" />}
              label="メンバーズエージェント"
            />
          </li>
          <li>
            <NavLink
              href="/library"
              icon={<Bookmark className="w-5 h-5 mr-2" />}
              label="ライブラリ"
            />
          </li>
        </ul>
      </nav>
    </aside>
  );
}
