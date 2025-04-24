import { SquarePlus, MessageSquareHeart, MessageSquareMore } from "lucide-react";
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
  threads: {
    today?: Thread[];
    pastWeek?: Thread[];
    older?: Thread[];
  };
  basePath?: string; // ベースパス（デフォルトは現在のパス）
}

export const Threads = ({
  threads,
  basePath = "/my-agent/c"
}: ThreadsProps) => {
  const router = useRouter();
  const params = useParams();
  const currentThreadId = params.threadId as string;

  const handleCreateNewThread = () => {
    const newThreadId = uuidv4();
    router.push(`${basePath}/${newThreadId}`);
  };

  // 指定されたスレッドリストをレンダリングする関数
  const renderThreadList = (threadList: Thread[] = []) => {
    if (threadList.length === 0) return null;

    return threadList.map(thread => (
      <Link
        key={thread.id}
        href={`${basePath}/${thread.id}`}
        className={`flex items-center gap-2 rounded-lg transition-all cursor-pointer ${
          currentThreadId === thread.id ? "bg-gray-100" : "hover:bg-gray-100/50"
        }`}
      >
        <div className="flex-grow px-3 py-2 text-start w-full">
          <p
            className="text-sm truncate"
            title={thread.title || "新規チャット"}
          >
            {thread.title || "新規チャット"}
          </p>
          {/* {thread.createdAt && (
            <p className="text-xs text-muted-foreground">
              {new Date(thread.createdAt).toLocaleString()}
            </p>
          )} */}
        </div>
      </Link>
    ));
  };

  const isEmpty =
    (!threads.today || threads.today.length === 0) &&
    (!threads.pastWeek || threads.pastWeek.length === 0) &&
    (!threads.older || threads.older.length === 0);

  return (
    <div className="flex flex-col items-stretch gap-1.5 bg-white p-2 overflow-y-auto">
      <div className="flex gap-0 justify-end">

        <div
          className="flex items-center justify-center w-[38px] h-[38px] hover:bg-gray-100 rounded-lg"
          onClick={handleCreateNewThread}
        >
          <SquarePlus className="size-5" />
        </div>
        <Link
          href={`${basePath}/likes`}
          className="flex items-center justify-center w-[38px] h-[38px] hover:bg-gray-100 rounded-lg"
        >
          <MessageSquareHeart className="size-5" />
        </Link>
        <Link
          href={`${basePath}/histories`}
          className="flex items-center justify-center w-[38px] h-[38px] hover:bg-gray-100 rounded-lg"
        >
          <MessageSquareMore className="size-5" />
        </Link>
      </div>

      {/* スレッドリスト */}
      <div className="overflow-y-auto flex flex-col gap-3">
        {isEmpty ? (
          <div className="py-2 text-center text-sm text-muted-foreground">
            スレッドがありません
          </div>
        ) : (
          <>
            {threads.today && threads.today.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-muted-foreground px-3 mb-1">今日</p>
                {renderThreadList(threads.today)}
              </div>
            )}

            {threads.pastWeek && threads.pastWeek.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-muted-foreground px-3 mb-1">過去7日間</p>
                {renderThreadList(threads.pastWeek)}
              </div>
            )}

            {threads.older && threads.older.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-muted-foreground px-3 mb-1">以前</p>
                {renderThreadList(threads.older)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
