"use client";
import { useChat } from "@ai-sdk/react";
import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";


export function ChatInterface() {
  const [isLoading, setIsLoading] = useState(false);


  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/agent/product-strategy-planning',
  });

  return (
    <div className="flex flex-col">
      <Card className="flex-grow overflow-hidden flex flex-col gap-0">
        <CardContent className="p-4 flex-grow overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center p-8">
              <div className="text-muted-foreground">
                <p className="text-lg mb-2">製品戦略立案エージェントです</p>
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
