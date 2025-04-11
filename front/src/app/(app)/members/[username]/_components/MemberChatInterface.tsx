"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { useEffect } from "react";
import Image from "next/image";


interface ChatInterfaceProps {
  owner: string;
  username: string;
  avatarUrl?: string;
}

export function MemberChatInterface({ owner, username, avatarUrl }: ChatInterfaceProps) {
  const [token, setToken] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const jwtToken = localStorage.getItem('auth_token');
    setToken(jwtToken);
    fetchChatHistory(jwtToken);
  }, []);


  const fetchChatHistory = async (token: string | null) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_MASTRA_API_URL}/members/${username}/chat/history`, {
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


  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: `/api/member/${username}/chat`,
    initialMessages: initialMessages,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return (
    <div className="flex flex-col h-[70vh]">
      <Card className="flex-grow overflow-hidden flex flex-col gap-0">
        <CardContent className="p-4 flex-grow overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center p-8">
              <div className="text-muted-foreground">
                <p className="text-lg mb-2">{owner}のAIエージェントです。</p>
                <p className="text-sm">異なる視点や専門知識を持つエージェントと協力し、チーム間のコラボレーションを促進しましょう。</p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role !== "user" && (
                  <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={avatarUrl || 'https://picsum.photos/id/2/100/100'}
                      alt='AIのアバター'
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src='https://picsum.photos/id/13/100/100'
                      alt='あなたのアバター'
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <Textarea
              placeholder="メッセージを入力..."
              value={input}
              onChange={handleInputChange}
              className="min-h-24 resize-none flex-grow"
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
