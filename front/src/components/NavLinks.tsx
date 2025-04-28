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
    <nav className="p-2 pt-4">
      <ul className="space-y-6">
        <li>
          <NavLink
            href="/"
            icon={<Home className="w-5 h-5" />}
            label="ホーム"
          />
        </li>
        <li>
          <MyAgentLink/>
        </li>
        <li>
          <NavLink
            href="/members"
            icon={<Users className="w-5 h-5" />}
            label="メンバー"
          />
        </li>
        <li>
          <NavLink
            href="/library"
            icon={<Bookmark className="w-5 h-5" />}
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
      className={`flex flex-col items-center text-center text-[10px] gap-0 `}
      onClick={onClick}
    >
      <div className={`p-2 rounded-md ${isActive ? activeLinkStyle : defaultLinkStyle}`}>
        {icon}
      </div>
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
      className={`flex flex-col items-center text-center text-[10px] gap-0`}
      onClick={onClick}
    >
      <div className={`p-2 rounded-md ${isActive ? activeLinkStyle : defaultLinkStyle}`}>
        <Bot className="w-5 h-5" />
      </div>
      <span>マイエージェント</span>
    </Link>
  );
}
