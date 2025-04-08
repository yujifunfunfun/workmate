"use client";

import { useCompletion } from "@ai-sdk/react";
import { SearchResult, EmptyResult } from "@/app/library/agent/sales-case/_components/SearchResult";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function SalesSearchForm() {
  const {
    completion,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useCompletion({
    api: '/api/search',
    onFinish: (prompt, completion) => {
      console.log('検索が完了しました', completion);
    },
    onError: (error) => {
      console.error('検索エラー:', error);
    }
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-2/5">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>営業成功事例検索</CardTitle>
              <CardDescription>
                過去の営業成功事例から類似の事例を検索します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    検索内容
                  </label>
                  <div className="mt-2">
                    <Textarea
                      value={input}
                      onChange={handleInputChange}
                      placeholder="検索したい営業事例の内容を入力してください"
                      className="min-h-32"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    検索したい営業内容を具体的に記述してください
                  </p>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      検索中...
                    </>
                  ) : (
                    "検索"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="w-full lg:w-3/5">
          {completion ? <SearchResult result={completion} /> : <EmptyResult />}
        </div>
      </div>
    </div>
  );
}
