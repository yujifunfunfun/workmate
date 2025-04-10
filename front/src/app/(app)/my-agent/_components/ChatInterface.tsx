"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";

interface ChatInterfaceProps {
  owner: string;
  agentId?: string;
}

export function ChatInterface({ owner, agentId = "personalAgent" }: ChatInterfaceProps) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useChat({
    api: "/api/chat",
    body: {
      agentId
    },
    onError: (error) => {
      console.error("チャットエラー:", error);
    }
  });

  return (
    <div className="flex flex-col h-[70vh]">
      <Card className="flex-grow overflow-hidden flex flex-col">
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
