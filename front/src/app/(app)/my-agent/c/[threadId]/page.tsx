'use client'
import { MyChatInterface } from "@/app/(app)/my-agent/c/[threadId]/_components/MyChatInterface";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";


export default function MyAgentPage() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialMessages, setInitialMessages] = useState(null);
  const [threads, setThreads] = useState([]);
  const params = useParams();
  const currentThreadId = params.threadId as string;

  useEffect(() => {
    const jwtToken = localStorage.getItem('auth_token');
    setToken(jwtToken);
    fetchChatHistory(jwtToken);
    fetchThreads(jwtToken);
  }, []);
  const fetchChatHistory = async (token: string | null) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_MASTRA_API_URL}/chat/history?threadId=${currentThreadId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInitialMessages(data);
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchThreads = async (token: string | null) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_MASTRA_API_URL}/threads`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setThreads(data);
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };


  if (isLoading || !token || !initialMessages) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <MyChatInterface initialMessages={initialMessages} token={token} threads={threads} currentThreadId={currentThreadId} />
    </div>
  );
}
