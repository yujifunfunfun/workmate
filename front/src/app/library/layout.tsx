import Link from "next/link";
import { ReactNode } from "react";

interface LibraryLayoutProps {
  children: ReactNode;
}

export default function LibraryLayout({ children }: LibraryLayoutProps) {
  return (
    <div className="container">
      {children}
    </div>
  );
} 
