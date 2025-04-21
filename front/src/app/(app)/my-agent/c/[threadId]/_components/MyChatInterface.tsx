import { Thread } from "@/components/assistant-ui/thread";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";


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
    </AssistantRuntimeProvider>
  );
}
