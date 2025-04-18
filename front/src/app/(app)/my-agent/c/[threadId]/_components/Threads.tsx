import { PlusIcon, ArchiveIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { v4 as uuidv4 } from 'uuid';

// スレッドの型定義
export interface Thread {
  id: string;
  title: string;
  createdAt: string;
  isArchived?: boolean;
}

// スレッドリストのプロパティ定義
interface ThreadsProps {
  threads: Thread[];
  basePath?: string; // ベースパス（デフォルトは現在のパス）
}

export const Threads = ({
  threads,
  basePath = "/my-agent/c"
}: ThreadsProps) => {
  const router = useRouter();
  const params = useParams();
  const currentThreadId = params.threadId as string;

  // 新規スレッド作成処理
  const handleCreateNewThread = () => {
    // 新しいUUIDを生成
    const newThreadId = uuidv4();

    // 新しいスレッドページに遷移
    router.push(`${basePath}/${newThreadId}`);
  };

  return (
    <div className="flex flex-col items-stretch gap-1.5 bg-white p-2">
      {/* 新規スレッド作成ボタン */}
      <Button
        className="flex items-center justify-start gap-1 rounded-lg px-2.5 py-2 text-start"
        variant="ghost"
        onClick={handleCreateNewThread}
      >
        <PlusIcon className="size-4" />
        新規チャット
      </Button>

      {/* スレッドリスト */}
      <div className="overflow-y-auto flex flex-col gap-1">
        {threads.length === 0 ? (
          <div className="py-2 text-center text-sm text-muted-foreground">
            スレッドがありません
          </div>
        ) : (
          threads.map(thread => (
            <Link
              key={thread.id}
              href={`${basePath}/${thread.id}`}
              className={`flex items-center gap-2 rounded-lg transition-all cursor-pointer ${
                currentThreadId === thread.id ? "bg-muted" : "hover:bg-muted"
              }`}
            >
              <div className="flex-grow px-3 py-2 text-start w-full">
                <p
                  className="text-sm truncate"
                  title={thread.title || "新規チャット"}
                >
                  {thread.title || "新規チャット"}
                </p>
                {thread.createdAt && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(thread.createdAt).toLocaleString()}
                  </p>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};
