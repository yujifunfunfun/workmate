'use client'

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Heart, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LikeRankingUser {
  rank: number;
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  likeCount: number;
}

export default function Home() {
  const { data: rankingData = [], error, isLoading } = useSWR<LikeRankingUser[]>(
    `${process.env.NEXT_PUBLIC_MASTRA_API_URL}/chat/likes/ranking`,
    fetcher
  );
  if (isLoading) return null;

  return (
    <div>
      <Card className="w-1/3">
        <CardHeader>
          <CardTitle>
            いいねランキング
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rankingData.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">ランキングデータがありません</p>
          ) : (
            <div className="space-y-3">
              {rankingData.map((user) => (
                <div
                  key={user.userId}
                  className={`flex items-center justify-between p-3 rounded-lg bg-gray-50`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 font-bold text-lg">
                      {user.rank}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{user.lastName} {user.firstName}</span>
                      <span className="text-sm text-muted-foreground">@{user.username}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-sm">
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    <span className="font-bold">{user.likeCount}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
