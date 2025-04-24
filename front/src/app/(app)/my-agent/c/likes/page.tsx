'use client'

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Heart, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Message {
  content: string;
  likeCount: number;
}

interface GroupedLikedMessage {
  id: string;
  liked_by_last_name: string;
  liked_by_first_name: string;
  liked_by_username: string;
  messageId: string;
  messages: Message[];
}

interface LikesData {
  count: number;
  groupedLikedMessages: GroupedLikedMessage[];
}

export default function LikesPage() {
  const { data, error, isLoading } = useSWR<LikesData>(
    `${process.env.NEXT_PUBLIC_MASTRA_API_URL}/chat/likes`,
    fetcher
  );
  if (isLoading) return null;

  const groupedLikedMessages = data?.groupedLikedMessages || [];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="fill-red-500 text-red-500" size={60} />
              <span className="text-7xl font-bold">{data?.count || 0}</span>
            </div>
            <p className="text-xl text-center text-muted-foreground">
              あなたのエージェントの回答がいいねされた回数
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>いいねしたユーザー</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {groupedLikedMessages.length === 0 ? (
              <p className="text-center text-muted-foreground">まだいいねされたメッセージはありません</p>
            ) : (
              groupedLikedMessages.map((user) => {
                // ユーザーの合計いいね数を計算
                const totalLikes = user.messages.reduce((sum, message) => sum + message.likeCount, 0);

                return (
                  <div key={user.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        <span className="font-medium">{user.liked_by_last_name} {user.liked_by_first_name}</span>
                        <span className="text-sm text-muted-foreground">@{user.liked_by_username}</span>
                      </div>
                      <div className="flex items-center bg-secondary px-3 py-1 rounded-full">
                        <Heart className="h-4 w-4 fill-red-500 text-red-500 mr-1" />
                        <span className="font-bold">{totalLikes}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {user.messages.map((message, index) => (
                        <div key={index} className="pl-2 border-l-2 border-gray-200">
                          <div className="flex justify-between items-start">
                            <p className="text-sm pr-8">{message.content}</p>
                            <div className="flex items-center shrink-0">
                              <Heart className="h-3 w-3 fill-red-500 text-red-500 mr-1" />
                              <span className="text-sm">{message.likeCount}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

