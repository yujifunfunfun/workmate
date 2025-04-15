import { Thread } from "@/components/assistant-ui/thread";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { AssistantRuntimeProvider } from "@assistant-ui/react";


type Props = {
  initialMessages: any[];
  token: string;
}

export function MyChatInterface({ initialMessages, token }: Props) {
  const runtime = useChatRuntime({
    api: "/api/chat",
    headers: {
      Authorization: `Bearer ${token}`
    },
    initialMessages: initialMessages,
  });
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="h-[81vh]">
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
}
