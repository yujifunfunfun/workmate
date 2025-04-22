import { Thread } from "@/components/assistant-ui/thread";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { makeAssistantToolUI } from "@assistant-ui/react";
import { Loader2 } from "lucide-react";


type Props = {
  token: string;
}

export function MyChatInterface({ token }: Props) {
  const [initialMessages, setInitialMessages] = useState(null);
  const params = useParams();
  const currentThreadId = params.threadId as string;
  useEffect(() => {
    fetchChatHistory(token);
  }, []);
  const fetchChatHistory = async (token: string | null) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_MASTRA_API_URL}/chat/history?threadId=${currentThreadId}`, {
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
    }
  };
  if (!initialMessages) return null;
  return (
    <MyChatThread initialMessages={initialMessages} token={token} />
  );
}


type MyChatThreadProps = {
  initialMessages: any[];
  token: string;
}
function MyChatThread({ initialMessages, token }: MyChatThreadProps) {
  const params = useParams();

  const a = params.threadId as string;
  const runtime = useChatRuntime({
    api: "/api/chat",
    headers: {
      Authorization: `Bearer ${token}`
    },
    initialMessages: initialMessages,
    body: {
      threadId: a
    }
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Thread />
      <UserInfoToolUI />
    </AssistantRuntimeProvider>
  );
}


type UserInfoArgs = {
  query: string;
};
type UserInfoResult = {
  title: string;
  description: string;
  url: string;
};
const UserInfoToolUI = makeAssistantToolUI<UserInfoArgs, UserInfoResult>({
  toolName: "userInfoTool",
  render: ({ args, status, result }) => {
    return (
      <div className="p-4 bg-gray-50 border rounded-md mb-4">
        <div className="flex items-center space-x-2 ">
          <span className="font-medium text-gray-800">ユーザー情報を検索中...</span>
          {status.type === 'running' && (
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          )}
        </div>
      </div>
    );
  },
});
