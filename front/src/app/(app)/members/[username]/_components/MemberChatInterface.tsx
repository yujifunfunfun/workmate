"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { Send, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";
import Image from "next/image";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";


interface ChatInterfaceProps {
  owner: string;
  userId: string;
  username: string;
  avatarUrl?: string;
}

export function MemberChatInterface({ owner, username, avatarUrl, userId }: ChatInterfaceProps) {
  const [token, setToken] = useState<string | null>(null);
  const [likedMessages, setLikedMessages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const jwtToken = localStorage.getItem('auth_token');
    setToken(jwtToken);
  }, []);

  const { data: initialMessages = [] } = useSWR(
    `${process.env.NEXT_PUBLIC_MASTRA_API_URL}/members/${username}/chat/history`,
    fetcher
  );

  const handleLike = async (messageId: string) => {
    if (!token) return;

    // アニメーション用に状態を更新
    setLikedMessages(prev => ({ ...prev, [messageId]: true }));

    setTimeout(() => {
      setLikedMessages(prev => ({ ...prev, [messageId]: false }));
    }, 400);

    try {
      await fetch(`${process.env.NEXT_PUBLIC_MASTRA_API_URL}/members/${userId}/chat/messages/${messageId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Failed to like message:', error);
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
        <CardContent className="p-4 flex-grow overflow-y-auto space-y-8">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center p-8">
              <div className="text-muted-foreground">
                <p className="text-lg mb-2">{owner}のAIエージェントです。</p>
                <p className="text-sm">異なる視点や専門知識を持つエージェントと協力し、チーム間のコラボレーションを促進しましょう。</p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              message.content &&
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className="max-w-[50%] flex flex-col gap-1">
                  <div
                    className={`rounded-lg px-4 py-2  ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role !== "user" && (
                    <button
                      className={`cursor-pointer w-fit h-6 px-2 rounded-full transition-colors duration-300 ${likedMessages[message.id] && 'animate-pulse'}`}
                      onClick={() => handleLike(message.id)}
                    >
                      <Heart
                        className={`transition-colors duration-200 ${likedMessages[message.id] ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
                        size={16}
                      />
                    </button>
                  )}
                </div>
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
            <Button type="submit" size="icon" disabled={!input.trim()}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
