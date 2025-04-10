"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";

interface ChatInterfaceProps {
  agentId?: string;
}

export function MyChatInterface({ agentId = "personalAgent" }: ChatInterfaceProps) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // JWTトークンをローカルストレージから取得
    const jwtToken = localStorage.getItem('auth_token');
    setToken(jwtToken);
  }, []);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useChat({
    api: "http://localhost:4111/chat",
    headers: token ? {
      'Authorization': `Bearer ${token}`
    } : undefined,
    body: {
      agentId
    },
    onError: (error) => {
      console.error("チャットエラー:", error);
    }
  });
  console.log(messages);
  return (
    <div className="flex flex-col h-[70vh]">
      <Card className="flex-grow overflow-hidden flex flex-col">
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
                  <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                    <span className="text-xs">AI</span>
                  </Avatar>
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
                  <Avatar className="h-8 w-8 bg-muted text-muted-foreground">
                    <span className="text-xs">Me</span>
                  </Avatar>
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
