import { Thread } from "@/components/assistant-ui/thread";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { Threads } from "./Threads";


type Props = {
  initialMessages: any[];
  token: string;
  threads: any[];
  currentThreadId: string;
}

export function MyChatInterface({ initialMessages, token, threads, currentThreadId }: Props) {
  const runtime = useChatRuntime({
    api: "/api/chat",
    headers: {
      Authorization: `Bearer ${token}`
    },
    initialMessages: initialMessages,
    body: {
      threadId: currentThreadId
    }
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="grid h-[81vh] grid-cols-[200px_1fr] gap-x-2">
        <Threads threads={threads} />
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
}
