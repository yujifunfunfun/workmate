"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bookmark, Users, Bot } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { useState, useEffect } from "react";

// サイドバーのアクティブなリンクのスタイル
const activeLinkStyle = "bg-gray-100";
const defaultLinkStyle = "text-gray-700 hover:bg-gray-100";



export function NavLinks() {
  return (
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
          <MyAgentLink/>
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
  );
}


function NavLink({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string, onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));
  return (
    <Link
      href={href}
      className={`flex items-center p-2 rounded-lg ${isActive ? activeLinkStyle : defaultLinkStyle}`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}


function MyAgentLink() {
  const [threadId, setThreadId] = useState<string>();
  const href = `/my-agent/c/${threadId}`;
  useEffect(() => {
    setThreadId(uuidv4());
  }, []);
  const onClick = () => {
    setThreadId(uuidv4());
  }
  const pathname = usePathname();
  const isActive = pathname?.startsWith('/my-agent/c/');
  return (
    <Link
      href={href}
      className={`flex items-center p-2 rounded-lg ${isActive ? activeLinkStyle : defaultLinkStyle}`}
      onClick={onClick}
    >
      <Bot className="w-5 h-5 mr-2" />
      <span>マイエージェント</span>
    </Link>
  );
}
