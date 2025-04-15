'use client'
import { MyChatInterface } from "@/app/(app)/my-agent/_components/MyChatInterface";
import { useState, useEffect } from "react";


export default function MyAgentPage() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialMessages, setInitialMessages] = useState([]);

  useEffect(() => {
    const jwtToken = localStorage.getItem('auth_token');
    setToken(jwtToken);
    fetchChatHistory(jwtToken);
  }, []);
  const fetchChatHistory = async (token: string | null) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_MASTRA_API_URL}/chat/history`, {
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
  if (isLoading || !token || initialMessages.length == 0) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <MyChatInterface initialMessages={initialMessages} token={token} />
    </div>
  );
}
