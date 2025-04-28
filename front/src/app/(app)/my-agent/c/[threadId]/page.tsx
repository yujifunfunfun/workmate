'use client'
import { MyChatInterface } from "@/app/(app)/my-agent/c/[threadId]/_components/MyChatInterface";
import { useState, useEffect } from "react";
import { MyChatTreads } from "./_components/MyChatTreads";


export default function MyAgentPage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const jwtToken = localStorage.getItem('auth_token');
    setToken(jwtToken);
  }, []);

  if (!token) return null;


  return (
    <div className="grid h-[calc(100vh-96px)] grid-cols-[220px_1fr] gap-x-2">
      <MyChatTreads token={token} />
      <MyChatInterface token={token}/>
    </div>
  );
}
