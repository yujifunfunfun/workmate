"use client";
import { useChat } from "@ai-sdk/react";
import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";


export function MyChatInterface() {
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


  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat', // Next.jsのAPIルート
    initialMessages: initialMessages,
    headers: {
      'Authorization': `Bearer ${token}` // 認証トークン
    }
  });

  return (
    <div className="flex flex-col h-[81vh]">
      <Card className="flex-grow overflow-hidden flex flex-col gap-0">
        <CardContent className="p-4 flex-grow overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center p-8">
              <div className="text-muted-foreground">
                <p className="text-lg mb-2">専属のAIエージェントです。</p>
                <p className="text-sm">日々の協働を通じてあなたの思考パターン・知識・好みを学習します。</p>
                <p className="text-sm">あなたのスタイルに合わせて成長し、より効率的なサポートを提供します。</p>
                <p className="text-sm">Googleカレンダーを操作して日程調整・スケジュール作成を実行</p>
                <p className="text-sm">Gmailを操作して会議の案内メールの文章を作成して送付</p>
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
                      src='https://picsum.photos/id/2/100/100'
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
