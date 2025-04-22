"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownRenderer } from "@/app/(app)/library/agent/sales-case/_components/MarkdownRenderer";

// 検索結果表示コンポーネント
export function AdjustmentResult({ result }: { result: string }) {
  return (
    <Card className="h-full">
      <CardHeader className="border-b border-gray-200 flex">
        <CardTitle>スケジュール調整結果</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-white dark:bg-gray-800 rounded-md overflow-y-auto max-h-[600px]">
          <MarkdownRenderer markdown={result} />
        </div>
      </CardContent>
    </Card>
  );
}

// 検索結果がない場合のプレースホルダーコンポーネント
export function EmptyResult() {
  return (
    <Card className="h-full flex items-center justify-center">
      <CardContent className="py-12">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2">スケジュール調整結果がここに表示されます</p>
          <p className="text-sm">左側のフォームからスケジュール調整内容を入力して調整してください</p>
        </div>
      </CardContent>
    </Card>
  );
}
